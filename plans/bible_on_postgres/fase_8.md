# Fase 8 — Performance e Índices

Otimizações de banco de dados e queries para garantir performance em escala.

---

## 🎯 Objetivo

Otimizar performance da aplicação através de:
- Índices full-text search em português
- Índices compostos para queries frequentes
- Análise de query plans
- Cache estratégico (opcional)
- Monitoramento de performance

---

## 🗄️ Backend — Índices PostgreSQL

### Migration: Índices de Performance

**Arquivo:** `alembic/versions/20260319_0010_bible_indexes.py`

```python
"""bible_indexes

Revision ID: 20260319_0010
Revises: 20260319_0009
Create Date: 2026-03-19 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '20260319_0010'
down_revision: Union[str, None] = '20260319_0009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ========== Full-Text Search Index ==========
    
    # Criar índice GIN para busca full-text em português
    op.execute("""
        CREATE INDEX idx_bible_verses_text_search 
        ON bible_verses 
        USING gin(to_tsvector('portuguese', text))
    """)
    
    # Adicionar coluna computada para otimizar busca (opcional)
    op.execute("""
        ALTER TABLE bible_verses 
        ADD COLUMN search_vector tsvector 
        GENERATED ALWAYS AS (to_tsvector('portuguese', text)) STORED
    """)
    
    # Índice na coluna gerada (mais rápido que índice na função)
    op.execute("""
        CREATE INDEX idx_bible_verses_search_vector 
        ON bible_verses 
        USING gin(search_vector)
    """)
    
    # ========== Índices para Lookup Rápido ==========
    
    # Já existem nas tabelas, mas garantir:
    # - bible_verses(chapter_id, verse_number)
    # - bible_chapters(book_id, chapter_number)
    # - bible_books(version_id, abbrev)
    
    # ========== Índices para Anotações/Destaques ==========
    
    # Busca por referência (versão + livro + capítulo + versículo)
    op.create_index(
        'idx_bible_notes_reference',
        'bible_notes',
        ['version_code', 'book_abbrev', 'chapter', 'verse'],
    )
    
    op.create_index(
        'idx_bible_highlights_reference',
        'bible_highlights',
        ['version_code', 'book_abbrev', 'chapter', 'verse'],
    )
    
    # Busca por usuário + tenant (já existe, mas garantir ordem otimizada)
    # Os índices criados na Fase 1 já cobrem:
    # - bible_notes(user_id, tenant_id)
    # - bible_highlights(user_id, tenant_id)
    
    # Anotações públicas (filtro WHERE na criação do índice)
    op.execute("""
        CREATE INDEX idx_bible_notes_public_tenant 
        ON bible_notes(tenant_id, created_at DESC) 
        WHERE is_public = TRUE
    """)
    
    # ========== Índices para Planos de Leitura ==========
    
    # Planos públicos por tenant
    op.execute("""
        CREATE INDEX idx_reading_plans_public_tenant 
        ON reading_plans(tenant_id, created_at DESC) 
        WHERE is_public = TRUE
    """)
    
    # Progresso ativo (não completado)
    op.execute("""
        CREATE INDEX idx_user_reading_progress_active 
        ON user_reading_progress(user_id, started_at DESC) 
        WHERE completed_at IS NULL
    """)
    
    # ========== Estatísticas e Vacuum ==========
    
    # Atualizar estatísticas para o otimizador de queries
    op.execute("ANALYZE bible_verses")
    op.execute("ANALYZE bible_chapters")
    op.execute("ANALYZE bible_books")
    op.execute("ANALYZE bible_notes")
    op.execute("ANALYZE bible_highlights")


def downgrade() -> None:
    # Remover índices
    op.drop_index('idx_bible_verses_search_vector', 'bible_verses')
    op.drop_index('idx_bible_verses_text_search', 'bible_verses')
    
    # Remover coluna gerada
    op.execute("ALTER TABLE bible_verses DROP COLUMN search_vector")
    
    # Remover índices de anotações/destaques
    op.drop_index('idx_bible_notes_reference', 'bible_notes')
    op.drop_index('idx_bible_highlights_reference', 'bible_highlights')
    op.drop_index('idx_bible_notes_public_tenant', 'bible_notes')
    op.drop_index('idx_reading_plans_public_tenant', 'reading_plans')
    op.drop_index('idx_user_reading_progress_active', 'user_reading_progress')
```

---

## 🔍 Otimização de Queries

### 1. Busca Full-Text Otimizada

**Antes (ILIKE - lento):**
```python
# Repository antigo
stmt = stmt.where(BibleVerseModel.text.ilike(f"%{query}%"))
```

**Depois (GIN Index - rápido):**
```python
# Repository otimizado
from sqlalchemy import func

# Usando a coluna search_vector gerada
stmt = stmt.where(
    BibleVerseModel.search_vector.op('@@')(
        func.plainto_tsquery('portuguese', query)
    )
)

# OU usando função diretamente no índice
stmt = stmt.where(
    func.to_tsvector('portuguese', BibleVerseModel.text).op('@@')(
        func.plainto_tsquery('portuguese', query)
    )
)
```

**Atualizar em:** `src/infra/repositories/bible_repository.py`

```python
async def search_verses(
    self,
    query: str,
    version_code: str = "nvi",
    testament: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[List[dict], int]:
    """Busca full-text otimizada com GIN index."""
    async with self.session() as session:
        version = await self.get_version_by_code(version_code)
        if not version:
            return [], 0

        # Query base
        base_stmt = (
            select(
                BibleVerseModel,
                BibleChapterModel.chapter_number,
                BibleBookModel.abbrev,
                BibleBookModel.name.label("book_name"),
                # Ranking de relevância
                func.ts_rank(
                    BibleVerseModel.search_vector,
                    func.plainto_tsquery('portuguese', query)
                ).label('rank')
            )
            .join(BibleChapterModel, BibleChapterModel.id == BibleVerseModel.chapter_id)
            .join(BibleBookModel, BibleBookModel.id == BibleChapterModel.book_id)
            .where(BibleBookModel.version_id == version.id)
        )

        # Filtro de testamento
        if testament:
            base_stmt = base_stmt.where(BibleBookModel.testament == testament.upper())

        # Full-text search com ranking
        search_filter = BibleVerseModel.search_vector.op('@@')(
            func.plainto_tsquery('portuguese', query)
        )
        base_stmt = base_stmt.where(search_filter)
        
        # Ordenar por relevância
        base_stmt = base_stmt.order_by(sa.desc('rank'))

        # Contar total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = await session.scalar(count_stmt)

        # Buscar resultados paginados
        stmt = base_stmt.limit(limit).offset(offset)
        result = await session.execute(stmt)
        rows = result.all()

        results = [
            {
                "book": book_name,
                "book_abbrev": abbrev,
                "chapter": chapter_number,
                "verse": verse.verse_number,
                "text": verse.text,
                "reference": f"{book_name} {chapter_number}:{verse.verse_number}",
                "relevance": float(rank),  # Score de relevância
            }
            for verse, chapter_number, abbrev, book_name, rank in rows
        ]

        return results, total
```

---

### 2. Query de Capítulo com Navegação

**Otimização:** Carregar prev/next em uma única query usando window functions.

```python
async def get_chapter_with_navigation(
    self, version_code: str, book_abbrev: str, chapter_number: int
) -> Optional[dict]:
    """Busca capítulo com navegação otimizada."""
    async with self.session() as session:
        book = await self.get_book_by_abbrev(version_code, book_abbrev)
        if not book:
            return None

        # Query para obter prev/next usando LAG/LEAD
        stmt = text("""
            WITH chapter_navigation AS (
                SELECT 
                    bc.id,
                    bc.chapter_number,
                    bc.title,
                    bb.abbrev AS book_abbrev,
                    LAG(bc.chapter_number) OVER (ORDER BY bc.chapter_number) AS prev_chapter,
                    LEAD(bc.chapter_number) OVER (ORDER BY bc.chapter_number) AS next_chapter
                FROM bible_chapters bc
                JOIN bible_books bb ON bb.id = bc.book_id
                WHERE bc.book_id = :book_id
            )
            SELECT * FROM chapter_navigation
            WHERE chapter_number = :chapter_number
        """)
        
        result = await session.execute(
            stmt, {"book_id": book.id, "chapter_number": chapter_number}
        )
        chapter_info = result.first()
        
        if not chapter_info:
            return None
        
        # Buscar versículos
        verses_stmt = (
            select(BibleVerseModel)
            .where(BibleVerseModel.chapter_id == chapter_info.id)
            .order_by(BibleVerseModel.verse_number)
        )
        verses_result = await session.execute(verses_stmt)
        verses = verses_result.scalars().all()
        
        return {
            "book_abbrev": book_abbrev,
            "book_name": book.name,
            "chapter": chapter_number,
            "title": chapter_info.title,
            "verses": [{"number": v.verse_number, "text": v.text} for v in verses],
            "previous_chapter": {
                "book": book_abbrev,
                "chapter": chapter_info.prev_chapter
            } if chapter_info.prev_chapter else None,
            "next_chapter": {
                "book": book_abbrev,
                "chapter": chapter_info.next_chapter
            } if chapter_info.next_chapter else None,
        }
```

---

## 🚀 Cache Estratégico (Opcional)

### Redis Cache para Capítulos Populares

**Arquivo:** `src/services/bible_cache_service.py`

```python
"""
Cache service para conteúdo bíblico usando Redis.
"""

import json
from typing import Optional
from redis import asyncio as aioredis

from src.config import settings

redis_client = aioredis.from_url(
    settings.redis_url,
    encoding="utf-8",
    decode_responses=True,
)

class BibleCacheService:
    CACHE_PREFIX = "bible:"
    CACHE_TTL = 3600  # 1 hora
    
    @staticmethod
    async def get_chapter(version: str, book: str, chapter: int) -> Optional[dict]:
        """Busca capítulo do cache."""
        key = f"{BibleCacheService.CACHE_PREFIX}chapter:{version}:{book}:{chapter}"
        cached = await redis_client.get(key)
        return json.loads(cached) if cached else None
    
    @staticmethod
    async def set_chapter(version: str, book: str, chapter: int, data: dict):
        """Salva capítulo no cache."""
        key = f"{BibleCacheService.CACHE_PREFIX}chapter:{version}:{book}:{chapter}"
        await redis_client.setex(
            key,
            BibleCacheService.CACHE_TTL,
            json.dumps(data),
        )
    
    @staticmethod
    async def invalidate_chapter(version: str, book: str, chapter: int):
        """Invalida cache de capítulo."""
        key = f"{BibleCacheService.CACHE_PREFIX}chapter:{version}:{book}:{chapter}"
        await redis_client.delete(key)
```

**Integrar no BibleService:**

```python
async def get_chapter(self, book_abbrev: str, chapter: int, version: str = DEFAULT_VERSION):
    # 1. Tentar cache Redis
    cached = await BibleCacheService.get_chapter(version, book_abbrev, chapter)
    if cached:
        return BibleChapterContent(**cached)
    
    # 2. Tentar PostgreSQL
    try:
        chapter_data = await self.repository.get_chapter(version, book_abbrev, chapter)
        if chapter_data:
            # Salvar no cache
            await BibleCacheService.set_chapter(version, book_abbrev, chapter, chapter_data)
            return BibleChapterContent(**chapter_data)
    except Exception as e:
        log_warning("PostgreSQL indisponível", error=str(e))
    
    # 3. Fallback para API/JSON
    # ... resto do código
```

---

## 📊 Monitoramento de Performance

### 1. Query Logging

**Arquivo:** `src/infra/db/session.py`

```python
# Habilitar logging de queries lentas
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # Logar queries em dev
    pool_pre_ping=True,
    # Configurações de pool
    pool_size=20,
    max_overflow=10,
)
```

### 2. Análise de Query Plans

```sql
-- Analisar query de busca
EXPLAIN ANALYZE
SELECT bv.*, bc.chapter_number, bb.name
FROM bible_verses bv
JOIN bible_chapters bc ON bc.id = bv.chapter_id
JOIN bible_books bb ON bb.id = bc.book_id
WHERE bv.search_vector @@ plainto_tsquery('portuguese', 'amor')
ORDER BY ts_rank(bv.search_vector, plainto_tsquery('portuguese', 'amor')) DESC
LIMIT 20;

-- Resultado esperado:
-- Index Scan using idx_bible_verses_search_vector
-- Planning Time: <5ms
-- Execution Time: <50ms
```

### 3. Métricas de Performance

**Endpoint de métricas:** `GET /metrics/bible`

```python
@router.get("/metrics/bible")
async def get_bible_metrics():
    """Métricas de performance da Bíblia."""
    async with async_session_factory() as session:
        # Tamanho das tabelas
        sizes = await session.execute(text("""
            SELECT 
                'bible_verses' as table_name,
                pg_size_pretty(pg_total_relation_size('bible_verses')) as size,
                count(*) as row_count
            FROM bible_verses
            UNION ALL
            SELECT 
                'bible_notes',
                pg_size_pretty(pg_total_relation_size('bible_notes')),
                count(*)
            FROM bible_notes
        """))
        
        # Índices mais usados
        index_usage = await session.execute(text("""
            SELECT 
                schemaname,
                tablename,
                indexname,
                idx_scan,
                idx_tup_read,
                idx_tup_fetch
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public' AND tablename LIKE 'bible%'
            ORDER BY idx_scan DESC
            LIMIT 10
        """))
        
        return {
            "table_sizes": [dict(row) for row in sizes],
            "index_usage": [dict(row) for row in index_usage],
        }
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar migration `20260319_0010_bible_indexes.py`
- [ ] Executar migration: `alembic upgrade head`
- [ ] Atualizar `search_verses()` para usar GIN index
- [ ] Otimizar `get_chapter()` com window functions
- [ ] Configurar Redis cache (opcional)
- [ ] Adicionar endpoint de métricas
- [ ] Analisar query plans
- [ ] Validar performance com dataset real

### Validação
- [ ] Busca full-text <200ms para 50 resultados
- [ ] Carregamento de capítulo <100ms
- [ ] Índices sendo utilizados (não full table scan)
- [ ] Cache hit rate >80% para capítulos populares

---

## 🧪 Testes de Performance

### Script de Benchmark

**Arquivo:** `src/scripts/benchmark_bible.py`

```python
"""
Benchmark de performance da Bíblia.
"""

import asyncio
import time
from statistics import mean, median

from src.infra.repositories.bible_repository import BibleRepository


async def benchmark_search():
    """Benchmark de busca full-text."""
    repo = BibleRepository()
    queries = ["amor", "salvação", "Jesus", "fé", "paz"]
    
    times = []
    for query in queries:
        start = time.time()
        results, total = await repo.search_verses(query, limit=50)
        elapsed = (time.time() - start) * 1000  # ms
        times.append(elapsed)
        print(f"Query '{query}': {elapsed:.2f}ms ({total} resultados)")
    
    print(f"\nMédia: {mean(times):.2f}ms")
    print(f"Mediana: {median(times):.2f}ms")


async def benchmark_chapter():
    """Benchmark de carregamento de capítulo."""
    repo = BibleRepository()
    chapters = [("gn", 1), ("sl", 23), ("jo", 3), ("rm", 8), ("ap", 22)]
    
    times = []
    for book, chapter in chapters:
        start = time.time()
        data = await repo.get_chapter("nvi", book, chapter)
        elapsed = (time.time() - start) * 1000  # ms
        times.append(elapsed)
        print(f"Capítulo {book} {chapter}: {elapsed:.2f}ms")
    
    print(f"\nMédia: {mean(times):.2f}ms")
    print(f"Mediana: {median(times):.2f}ms")


async def main():
    print("=== Benchmark de Busca ===")
    await benchmark_search()
    
    print("\n=== Benchmark de Capítulo ===")
    await benchmark_chapter()


if __name__ == "__main__":
    asyncio.run(main())
```

**Executar:**
```bash
poetry run python -m src.scripts.benchmark_bible
```

---

## 📊 Estimativa

**Tempo:** 3-4 horas

**Breakdown:**
- Migration de índices: 1h
- Otimização de queries: 1-2h
- Redis cache (opcional): 1h
- Testes de performance: 30min

---

## 🎯 Metas de Performance

| Operação | Meta | Atual (antes) |
|----------|------|---------------|
| Busca full-text (50 resultados) | <200ms | ~2000ms (ILIKE) |
| Carregamento de capítulo | <100ms | ~50ms |
| Listagem de livros | <50ms | ~30ms |
| Criar anotação | <100ms | ~80ms |
| Cache hit rate | >80% | N/A |

---

## ➡️ Próximo Passo

**Fase 9:** Testes — Cobertura completa com testes unitários, integração e E2E
