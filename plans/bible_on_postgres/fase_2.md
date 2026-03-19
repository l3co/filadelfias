# Fase 2 — Script de Importação

Importação dos dados bíblicos dos arquivos JSON para o PostgreSQL.

---

## 🎯 Objetivo

Migrar 3 versões da Bíblia (NVI, ACF, AA) dos arquivos JSON estáticos para as tabelas PostgreSQL criadas na Fase 1.

**Dados a importar:**
- 3 versões bíblicas
- 66 livros × 3 versões = 198 registros
- ~1.189 capítulos × 3 versões = ~3.567 registros
- ~31.102 versículos × 3 versões = ~93.306 registros

---

## 🐍 Backend — Script de Importação

### Arquivo: `src/scripts/import_bible_data.py`

```python
"""
Script para importar dados bíblicos dos JSONs para PostgreSQL.

Uso:
    poetry run python -m src.scripts.import_bible_data
    poetry run python -m src.scripts.import_bible_data --version nvi
    poetry run python -m src.scripts.import_bible_data --dry-run
"""

import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List
from uuid import uuid4

import click
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infra.db.models import (
    BibleBookModel,
    BibleChapterModel,
    BibleVerseModel,
    BibleVersionModel,
)
from src.infra.db.session import async_session_factory
from src.services.logging_service import log_error, log_info, log_warning


# Mapeamento de abreviações para nomes completos
BOOK_NAMES = {
    "gn": "Gênesis",
    "ex": "Êxodo",
    "lv": "Levítico",
    "nm": "Números",
    "dt": "Deuteronômio",
    "js": "Josué",
    "jz": "Juízes",
    "rt": "Rute",
    "1sm": "1 Samuel",
    "2sm": "2 Samuel",
    "1rs": "1 Reis",
    "2rs": "2 Reis",
    "1cr": "1 Crônicas",
    "2cr": "2 Crônicas",
    "ed": "Esdras",
    "ne": "Neemias",
    "et": "Ester",
    "job": "Jó",
    "sl": "Salmos",
    "pv": "Provérbios",
    "ec": "Eclesiastes",
    "ct": "Cânticos",
    "is": "Isaías",
    "jr": "Jeremias",
    "lm": "Lamentações",
    "ez": "Ezequiel",
    "dn": "Daniel",
    "os": "Oséias",
    "jl": "Joel",
    "am": "Amós",
    "ob": "Obadias",
    "jn": "Jonas",
    "mq": "Miquéias",
    "na": "Naum",
    "hc": "Habacuque",
    "sf": "Sofonias",
    "ag": "Ageu",
    "zc": "Zacarias",
    "ml": "Malaquias",
    "mt": "Mateus",
    "mc": "Marcos",
    "lc": "Lucas",
    "jo": "João",
    "at": "Atos",
    "rm": "Romanos",
    "1co": "1 Coríntios",
    "2co": "2 Coríntios",
    "gl": "Gálatas",
    "ef": "Efésios",
    "fp": "Filipenses",
    "cl": "Colossenses",
    "1ts": "1 Tessalonicenses",
    "2ts": "2 Tessalonicenses",
    "1tm": "1 Timóteo",
    "2tm": "2 Timóteo",
    "tt": "Tito",
    "fm": "Filemom",
    "hb": "Hebreus",
    "tg": "Tiago",
    "1pe": "1 Pedro",
    "2pe": "2 Pedro",
    "1jo": "1 João",
    "2jo": "2 João",
    "3jo": "3 João",
    "jd": "Judas",
    "ap": "Apocalipse",
}


VERSIONS_CONFIG = [
    {
        "code": "nvi",
        "name": "Nova Versão Internacional",
        "description": "Linguagem moderna e acessível",
        "is_remote": False,
    },
    {
        "code": "acf",
        "name": "Almeida Corrigida Fiel",
        "description": "Tradução clássica e fiel aos originais",
        "is_remote": False,
    },
    {
        "code": "aa",
        "name": "Almeida Atualizada",
        "description": "Equilíbrio entre tradição e clareza",
        "is_remote": False,
    },
]


async def load_json_file(version_code: str) -> List[Dict]:
    """Carrega arquivo JSON da versão especificada."""
    assets_path = Path(__file__).parent.parent / "assets"
    json_path = assets_path / f"bible_{version_code}.json"
    
    if not json_path.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {json_path}")
    
    with open(json_path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    log_info(f"JSON carregado", version=version_code, books=len(data))
    return data


async def get_or_create_version(session: AsyncSession, config: Dict) -> BibleVersionModel:
    """Busca ou cria registro de versão."""
    stmt = select(BibleVersionModel).where(BibleVersionModel.code == config["code"])
    result = await session.execute(stmt)
    version = result.scalars().first()
    
    if version:
        log_info(f"Versão já existe", code=config["code"])
        return version
    
    version = BibleVersionModel(
        code=config["code"],
        name=config["name"],
        description=config["description"],
        is_remote=config["is_remote"],
        is_active=True,
    )
    session.add(version)
    await session.flush()
    
    log_info(f"Versão criada", code=config["code"], id=str(version.id))
    return version


async def import_book(
    session: AsyncSession,
    version: BibleVersionModel,
    book_data: Dict,
    book_order: int,
) -> None:
    """Importa um livro completo com capítulos e versículos."""
    abbrev = book_data["abbrev"]
    name = BOOK_NAMES.get(abbrev, abbrev.title())
    testament = "OT" if book_order < 39 else "NT"
    
    # Criar livro
    book = BibleBookModel(
        version_id=version.id,
        abbrev=abbrev,
        name=name,
        testament=testament,
        book_order=book_order,
    )
    session.add(book)
    await session.flush()
    
    # Importar capítulos e versículos
    chapters_data = book_data.get("chapters", [])
    for chapter_num, verses_list in enumerate(chapters_data, start=1):
        # Criar capítulo
        chapter = BibleChapterModel(
            book_id=book.id,
            chapter_number=chapter_num,
            title=None,  # Será adicionado manualmente depois
        )
        session.add(chapter)
        await session.flush()
        
        # Criar versículos
        for verse_num, verse_text in enumerate(verses_list, start=1):
            verse = BibleVerseModel(
                chapter_id=chapter.id,
                verse_number=verse_num,
                text=verse_text,
            )
            session.add(verse)
    
    log_info(
        f"Livro importado",
        version=version.code,
        book=name,
        chapters=len(chapters_data),
        order=book_order,
    )


async def import_version(
    session: AsyncSession,
    version_config: Dict,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Importa uma versão completa da Bíblia."""
    version_code = version_config["code"]
    
    log_info(f"Iniciando importação", version=version_code)
    
    # Carregar JSON
    books_data = await load_json_file(version_code)
    
    # Criar versão
    version = await get_or_create_version(session, version_config)
    
    # Verificar se já foi importada
    stmt = select(BibleBookModel).where(BibleBookModel.version_id == version.id)
    result = await session.execute(stmt)
    existing_books = result.scalars().all()
    
    if existing_books:
        log_warning(
            f"Versão já possui livros importados",
            version=version_code,
            count=len(existing_books),
        )
        return {
            "version": version_code,
            "status": "skipped",
            "reason": "already_imported",
            "books_count": len(existing_books),
        }
    
    if dry_run:
        log_info(f"DRY RUN - Não irá persistir dados", version=version_code)
        return {
            "version": version_code,
            "status": "dry_run",
            "books_to_import": len(books_data),
        }
    
    # Importar todos os livros
    stats = {
        "version": version_code,
        "books": 0,
        "chapters": 0,
        "verses": 0,
    }
    
    for book_order, book_data in enumerate(books_data):
        await import_book(session, version, book_data, book_order)
        stats["books"] += 1
        stats["chapters"] += len(book_data.get("chapters", []))
        stats["verses"] += sum(len(ch) for ch in book_data.get("chapters", []))
    
    await session.commit()
    
    log_info(f"Importação concluída", **stats)
    return stats


async def import_all_versions(dry_run: bool = False, version_filter: str = None):
    """Importa todas as versões ou uma específica."""
    async with async_session_factory() as session:
        versions_to_import = VERSIONS_CONFIG
        
        if version_filter:
            versions_to_import = [v for v in VERSIONS_CONFIG if v["code"] == version_filter]
            if not versions_to_import:
                log_error(f"Versão não encontrada", version=version_filter)
                return
        
        results = []
        for version_config in versions_to_import:
            try:
                result = await import_version(session, version_config, dry_run)
                results.append(result)
            except Exception as e:
                log_error(
                    f"Erro ao importar versão",
                    version=version_config["code"],
                    error=str(e),
                )
                raise
        
        # Resumo final
        total_books = sum(r.get("books", 0) for r in results)
        total_chapters = sum(r.get("chapters", 0) for r in results)
        total_verses = sum(r.get("verses", 0) for r in results)
        
        log_info(
            "=== IMPORTAÇÃO FINALIZADA ===",
            versions=len(results),
            books=total_books,
            chapters=total_chapters,
            verses=total_verses,
        )


@click.command()
@click.option("--version", "-v", help="Importar apenas uma versão específica (nvi, acf, aa)")
@click.option("--dry-run", is_flag=True, help="Simular importação sem persistir dados")
def main(version: str, dry_run: bool):
    """Importa dados bíblicos dos JSONs para PostgreSQL."""
    asyncio.run(import_all_versions(dry_run=dry_run, version_filter=version))


if __name__ == "__main__":
    main()
```

---

## 🚀 Execução do Script

### 1. Importar todas as versões

```bash
cd apps/backend
poetry run python -m src.scripts.import_bible_data
```

**Saída esperada:**
```
[INFO] JSON carregado | version=nvi books=66
[INFO] Versão criada | code=nvi id=...
[INFO] Livro importado | version=nvi book=Gênesis chapters=50 order=0
[INFO] Livro importado | version=nvi book=Êxodo chapters=40 order=1
...
[INFO] Importação concluída | version=nvi books=66 chapters=1189 verses=31102
[INFO] === IMPORTAÇÃO FINALIZADA === | versions=3 books=198 chapters=3567 verses=93306
```

---

### 2. Importar apenas uma versão

```bash
poetry run python -m src.scripts.import_bible_data --version nvi
```

---

### 3. Simular importação (dry-run)

```bash
poetry run python -m src.scripts.import_bible_data --dry-run
```

---

## 🧪 Validação

### SQL Queries de Verificação

```sql
-- 1. Verificar versões importadas
SELECT code, name, is_active FROM bible_versions;

-- 2. Contar livros por versão
SELECT 
    bv.code,
    bv.name,
    COUNT(bb.id) as books_count
FROM bible_versions bv
LEFT JOIN bible_books bb ON bb.version_id = bv.id
GROUP BY bv.id, bv.code, bv.name;

-- 3. Contar capítulos por versão
SELECT 
    bv.code,
    COUNT(bc.id) as chapters_count
FROM bible_versions bv
LEFT JOIN bible_books bb ON bb.version_id = bv.id
LEFT JOIN bible_chapters bc ON bc.book_id = bb.id
GROUP BY bv.id, bv.code;

-- 4. Contar versículos por versão
SELECT 
    bv.code,
    COUNT(bverse.id) as verses_count
FROM bible_versions bv
LEFT JOIN bible_books bb ON bb.version_id = bv.id
LEFT JOIN bible_chapters bc ON bc.book_id = bb.id
LEFT JOIN bible_verses bverse ON bverse.chapter_id = bc.id
GROUP BY bv.id, bv.code;

-- 5. Verificar primeiro versículo de Gênesis 1
SELECT 
    bv.code,
    bb.name as book,
    bc.chapter_number,
    bverse.verse_number,
    bverse.text
FROM bible_verses bverse
JOIN bible_chapters bc ON bc.id = bverse.chapter_id
JOIN bible_books bb ON bb.id = bc.book_id
JOIN bible_versions bv ON bv.id = bb.version_id
WHERE bb.abbrev = 'gn' 
  AND bc.chapter_number = 1 
  AND bverse.verse_number = 1
ORDER BY bv.code;

-- 6. Verificar tamanho do banco
SELECT 
    pg_size_pretty(pg_total_relation_size('bible_verses')) as verses_size,
    pg_size_pretty(pg_total_relation_size('bible_chapters')) as chapters_size,
    pg_size_pretty(pg_total_relation_size('bible_books')) as books_size,
    pg_size_pretty(pg_total_relation_size('bible_versions')) as versions_size;
```

---

### Script de Validação Python

```python
# src/scripts/validate_bible_import.py
import asyncio
from sqlalchemy import func, select
from src.infra.db.session import async_session_factory
from src.infra.db.models import *

async def validate():
    async with async_session_factory() as session:
        # Contar registros
        versions_count = await session.scalar(select(func.count(BibleVersionModel.id)))
        books_count = await session.scalar(select(func.count(BibleBookModel.id)))
        chapters_count = await session.scalar(select(func.count(BibleChapterModel.id)))
        verses_count = await session.scalar(select(func.count(BibleVerseModel.id)))
        
        print(f"✓ Versões: {versions_count} (esperado: 3)")
        print(f"✓ Livros: {books_count} (esperado: 198)")
        print(f"✓ Capítulos: {chapters_count} (esperado: ~3.567)")
        print(f"✓ Versículos: {verses_count} (esperado: ~93.306)")
        
        # Verificar Gênesis 1:1
        stmt = (
            select(BibleVerseModel.text, BibleVersionModel.code)
            .join(BibleChapterModel, BibleChapterModel.id == BibleVerseModel.chapter_id)
            .join(BibleBookModel, BibleBookModel.id == BibleChapterModel.book_id)
            .join(BibleVersionModel, BibleVersionModel.id == BibleBookModel.version_id)
            .where(
                BibleBookModel.abbrev == "gn",
                BibleChapterModel.chapter_number == 1,
                BibleVerseModel.verse_number == 1,
            )
        )
        result = await session.execute(stmt)
        verses = result.all()
        
        print("\n✓ Gênesis 1:1 em todas as versões:")
        for text, code in verses:
            print(f"  [{code}] {text[:80]}...")

if __name__ == "__main__":
    asyncio.run(validate())
```

**Executar:**
```bash
poetry run python -m src.scripts.validate_bible_import
```

---

## 📊 Performance

### Tempo de Importação Estimado

- **NVI:** ~30-45 segundos (31.102 versículos)
- **ACF:** ~30-45 segundos (31.173 versículos)
- **AA:** ~30-45 segundos (31.031 versículos)
- **Total:** ~2-3 minutos para 3 versões

### Tamanho do Banco

Após importação:
- `bible_verses`: ~10-12 MB
- `bible_chapters`: ~200 KB
- `bible_books`: ~50 KB
- `bible_versions`: ~5 KB
- **Total:** ~12-15 MB (sem índices full-text)

---

## ⚠️ Tratamento de Erros

### Duplicação

O script verifica se a versão já foi importada:
```python
if existing_books:
    log_warning("Versão já possui livros importados")
    return {"status": "skipped"}
```

Para reimportar:
```sql
-- Deletar versão específica (cascade deleta livros/capítulos/versículos)
DELETE FROM bible_versions WHERE code = 'nvi';
```

### Arquivo JSON não encontrado

```python
if not json_path.exists():
    raise FileNotFoundError(f"Arquivo não encontrado: {json_path}")
```

### Rollback em caso de erro

SQLAlchemy gerencia transações automaticamente:
- Se der erro, faz rollback
- Script pode ser reexecutado com segurança

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar `src/scripts/import_bible_data.py`
- [ ] Criar `src/scripts/validate_bible_import.py`
- [ ] Executar importação: `poetry run python -m src.scripts.import_bible_data`
- [ ] Validar com queries SQL
- [ ] Executar script de validação Python
- [ ] Confirmar contagens corretas

### Frontend
- N/A nesta fase

---

## 📊 Estimativa

**Tempo:** 2-3 horas

**Breakdown:**
- Desenvolvimento do script: 1-1.5h
- Execução e validação: 30min
- Script de validação: 30min
- Testes e troubleshooting: 30min

---

## ➡️ Próximo Passo

**Fase 3:** Repository Layer — Criar camada de acesso aos dados
