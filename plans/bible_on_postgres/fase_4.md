# Fase 4 — Service Layer com Fallback

Refatoração do BibleService com estratégia de fallback PostgreSQL → API → JSON.

---

## 🎯 Objetivo

Refatorar `BibleService` existente para usar PostgreSQL como fonte primária, com fallback automático para API externa e JSON em memória caso PostgreSQL falhe.

**Prioridade de fontes:**
1. PostgreSQL (rápido, completo, indexado)
2. API da Bíblia Digital (versões remotas)
3. JSON em memória (fallback de emergência)

---

## 🐍 Backend — Service Layer

### Arquivo: `src/services/bible_service.py` (refatorar)

```python
"""
Service para leitura bíblica com múltiplas fontes.
"""

import json
import os
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx
from pydantic import BaseModel

from src.infra.repositories.bible_repository import BibleRepository
from src.services.logging_service import log_error, log_info, log_warning


# ========== Response Models ==========

class BibleVersion(BaseModel):
    id: str
    code: str
    name: str
    description: str
    is_remote: bool


class BibleBookSummary(BaseModel):
    abbrev: str
    name: str
    chapters_count: int
    testament: str


class BibleVerse(BaseModel):
    number: int
    text: str


class BibleChapterContent(BaseModel):
    book_abbrev: str
    book_name: str
    chapter: int
    title: Optional[str] = None
    verses: List[BibleVerse]
    previous_chapter: Optional[Dict[str, Any]] = None
    next_chapter: Optional[Dict[str, Any]] = None


class BibleSearchResult(BaseModel):
    book: str
    book_abbrev: str
    chapter: int
    verse: int
    text: str
    reference: str


class BibleSearchResponse(BaseModel):
    results: List[BibleSearchResult]
    total: int
    query: str
    version: str


class BibleNote(BaseModel):
    id: str
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    content: str
    is_public: bool
    created_at: str
    updated_at: str


class BibleHighlight(BaseModel):
    id: str
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    color: Optional[str]
    category: Optional[str]
    created_at: str


# ========== Service ==========

class BibleService:
    """
    Service para conteúdo bíblico com fallback automático.
    
    Estratégia:
    1. PostgreSQL (principal)
    2. API externa (se versão remota)
    3. JSON em memória (emergência)
    """

    DEFAULT_VERSION = "nvi"
    
    # Cache JSON (fallback de emergência)
    _json_cache: Dict[str, List[Dict]] = {}

    def __init__(self):
        self.repository = BibleRepository()

    # ========== Versões ==========

    async def get_versions(self) -> List[BibleVersion]:
        """Lista versões disponíveis."""
        try:
            versions_data = await self.repository.get_versions()
            return [BibleVersion(**v) for v in versions_data]
        except Exception as e:
            log_error("Erro ao buscar versões do PostgreSQL", error=str(e))
            # Fallback para versões hard-coded
            return self._get_hardcoded_versions()

    def _get_hardcoded_versions(self) -> List[BibleVersion]:
        """Versões hard-coded para fallback."""
        return [
            BibleVersion(
                id="nvi",
                code="nvi",
                name="Nova Versão Internacional",
                description="Linguagem moderna e acessível",
                is_remote=False,
            ),
            BibleVersion(
                id="acf",
                code="acf",
                name="Almeida Corrigida Fiel",
                description="Tradução clássica e fiel aos originais",
                is_remote=False,
            ),
            BibleVersion(
                id="aa",
                code="aa",
                name="Almeida Atualizada",
                description="Equilíbrio entre tradição e clareza",
                is_remote=False,
            ),
            BibleVersion(
                id="ara",
                code="ara",
                name="Almeida Revista e Atualizada",
                description="Texto Tradicional e Atual (On-line)",
                is_remote=True,
            ),
        ]

    # ========== Livros ==========

    async def get_books(self, version: str = DEFAULT_VERSION) -> List[BibleBookSummary]:
        """Lista livros da Bíblia."""
        try:
            # 1. Tentar PostgreSQL
            books_data = await self.repository.get_books(version)
            if books_data:
                return [BibleBookSummary(**b) for b in books_data]
        except Exception as e:
            log_error("Erro ao buscar livros do PostgreSQL", error=str(e), version=version)

        # 2. Fallback para JSON
        return await self._get_books_from_json(version)

    async def _get_books_from_json(self, version: str) -> List[BibleBookSummary]:
        """Busca livros do JSON (fallback)."""
        data = self._load_json_version(version)
        books = []
        for i, book in enumerate(data):
            testament = "OT" if i < 39 else "NT"
            books.append(
                BibleBookSummary(
                    abbrev=book["abbrev"],
                    name=book.get("name", book["abbrev"].title()),
                    chapters_count=len(book["chapters"]),
                    testament=testament,
                )
            )
        return books

    # ========== Capítulos ==========

    async def get_chapter(
        self,
        book_abbrev: str,
        chapter: int,
        version: str = DEFAULT_VERSION,
    ) -> Optional[BibleChapterContent]:
        """
        Busca capítulo com estratégia de fallback.
        
        1. PostgreSQL
        2. API externa (se versão remota)
        3. JSON em memória
        """
        # 1. Tentar PostgreSQL
        try:
            chapter_data = await self.repository.get_chapter(version, book_abbrev, chapter)
            if chapter_data:
                return await self._enrich_chapter_with_navigation(
                    chapter_data, book_abbrev, chapter, version
                )
        except Exception as e:
            log_warning(
                "PostgreSQL indisponível, tentando fallback",
                error=str(e),
                version=version,
                book=book_abbrev,
                chapter=chapter,
            )

        # 2. Verificar se é versão remota
        versions = await self.get_versions()
        is_remote = any(v.code == version and v.is_remote for v in versions)

        if is_remote:
            # Tentar API externa
            verses_text = await self._fetch_remote_chapter(version, book_abbrev, chapter)
            if verses_text:
                return await self._build_chapter_from_verses(
                    book_abbrev, chapter, verses_text, version
                )

        # 3. Fallback para JSON
        return await self._get_chapter_from_json(version, book_abbrev, chapter)

    async def _get_chapter_from_json(
        self, version: str, book_abbrev: str, chapter: int
    ) -> Optional[BibleChapterContent]:
        """Busca capítulo do JSON (fallback final)."""
        data = self._load_json_version(version)
        
        book_idx = -1
        book_data = None
        for i, b in enumerate(data):
            if b["abbrev"] == book_abbrev:
                book_data = b
                book_idx = i
                break

        if not book_data or chapter < 1 or chapter > len(book_data["chapters"]):
            return None

        verses_list = book_data["chapters"][chapter - 1]
        verses = [BibleVerse(number=i+1, text=text) for i, text in enumerate(verses_list)]

        # Navegação
        prev_chap = None
        if chapter > 1:
            prev_chap = {"book": book_abbrev, "chapter": chapter - 1}
        elif book_idx > 0:
            prev_book = data[book_idx - 1]
            prev_chap = {"book": prev_book["abbrev"], "chapter": len(prev_book["chapters"])}

        next_chap = None
        if chapter < len(book_data["chapters"]):
            next_chap = {"book": book_abbrev, "chapter": chapter + 1}
        elif book_idx < len(data) - 1:
            next_book = data[book_idx + 1]
            next_chap = {"book": next_book["abbrev"], "chapter": 1}

        return BibleChapterContent(
            book_abbrev=book_abbrev,
            book_name=book_data.get("name", book_abbrev.title()),
            chapter=chapter,
            title=None,
            verses=verses,
            previous_chapter=prev_chap,
            next_chapter=next_chap,
        )

    async def _fetch_remote_chapter(
        self, version: str, abbrev: str, chapter: int
    ) -> Optional[List[str]]:
        """Busca capítulo de API externa."""
        try:
            url = f"https://www.abibliadigital.com.br/api/verses/{version}/{abbrev}/{chapter}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                return [v["text"] for v in data.get("verses", [])]
        except Exception as e:
            log_error("Erro ao buscar capítulo remoto", error=str(e), version=version)
            return None

    async def _build_chapter_from_verses(
        self, book_abbrev: str, chapter: int, verses_text: List[str], version: str
    ) -> BibleChapterContent:
        """Constrói objeto de capítulo a partir de lista de versículos."""
        verses = [BibleVerse(number=i+1, text=text) for i, text in enumerate(verses_text)]
        
        return BibleChapterContent(
            book_abbrev=book_abbrev,
            book_name=book_abbrev.title(),
            chapter=chapter,
            title=None,
            verses=verses,
            previous_chapter=None,  # TODO: calcular
            next_chapter=None,  # TODO: calcular
        )

    async def _enrich_chapter_with_navigation(
        self, chapter_data: dict, book_abbrev: str, chapter: int, version: str
    ) -> BibleChapterContent:
        """Adiciona navegação prev/next ao capítulo."""
        # TODO: Implementar lógica de navegação consultando repository
        verses = [BibleVerse(**v) for v in chapter_data["verses"]]
        
        return BibleChapterContent(
            book_abbrev=chapter_data["book_abbrev"],
            book_name=chapter_data["book_name"],
            chapter=chapter_data["chapter"],
            title=chapter_data.get("title"),
            verses=verses,
            previous_chapter=None,
            next_chapter=None,
        )

    # ========== Busca ==========

    async def search_verses(
        self,
        query: str,
        version: str = DEFAULT_VERSION,
        testament: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> BibleSearchResponse:
        """Busca full-text nos versículos."""
        try:
            results, total = await self.repository.search_verses(
                query=query,
                version_code=version,
                testament=testament,
                limit=limit,
                offset=offset,
            )

            search_results = [BibleSearchResult(**r) for r in results]

            return BibleSearchResponse(
                results=search_results,
                total=total,
                query=query,
                version=version,
            )
        except Exception as e:
            log_error("Erro na busca", error=str(e), query=query)
            # Fallback: retornar vazio
            return BibleSearchResponse(
                results=[],
                total=0,
                query=query,
                version=version,
            )

    # ========== Anotações ==========

    async def create_note(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        content: str,
        is_public: bool = False,
    ) -> BibleNote:
        """Cria anotação."""
        note_data = await self.repository.create_note(
            tenant_id=tenant_id,
            user_id=user_id,
            version_code=version_code,
            book_abbrev=book_abbrev,
            chapter=chapter,
            verse=verse,
            content=content,
            is_public=is_public,
        )
        return BibleNote(**note_data)

    async def get_user_notes(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: Optional[str] = None,
        book_abbrev: Optional[str] = None,
        chapter: Optional[int] = None,
    ) -> List[BibleNote]:
        """Lista anotações do usuário."""
        notes_data = await self.repository.get_user_notes(
            user_id=user_id,
            tenant_id=tenant_id,
            version_code=version_code,
            book_abbrev=book_abbrev,
            chapter=chapter,
        )
        return [BibleNote(**n) for n in notes_data]

    async def update_note(self, note_id: UUID, content: str) -> Optional[BibleNote]:
        """Atualiza anotação."""
        note_data = await self.repository.update_note(note_id, content)
        return BibleNote(**note_data) if note_data else None

    async def delete_note(self, note_id: UUID, user_id: UUID) -> bool:
        """Deleta anotação."""
        return await self.repository.delete_note(note_id, user_id)

    # ========== Destaques ==========

    async def create_highlight(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        color: Optional[str] = None,
        category: Optional[str] = None,
    ) -> BibleHighlight:
        """Cria ou atualiza destaque."""
        highlight_data = await self.repository.create_highlight(
            tenant_id=tenant_id,
            user_id=user_id,
            version_code=version_code,
            book_abbrev=book_abbrev,
            chapter=chapter,
            verse=verse,
            color=color,
            category=category,
        )
        return BibleHighlight(**highlight_data)

    async def get_user_highlights(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: Optional[str] = None,
        book_abbrev: Optional[str] = None,
        chapter: Optional[int] = None,
    ) -> List[BibleHighlight]:
        """Lista destaques do usuário."""
        highlights_data = await self.repository.get_user_highlights(
            user_id=user_id,
            tenant_id=tenant_id,
            version_code=version_code,
            book_abbrev=book_abbrev,
            chapter=chapter,
        )
        return [BibleHighlight(**h) for h in highlights_data]

    async def delete_highlight(self, highlight_id: UUID, user_id: UUID) -> bool:
        """Remove destaque."""
        return await self.repository.delete_highlight(highlight_id, user_id)

    # ========== Helpers JSON ==========

    def _load_json_version(self, version: str) -> List[Dict]:
        """Carrega versão do JSON (lazy loading)."""
        if version not in self._json_cache:
            filename = f"bible_{version}.json"
            path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", filename)
            try:
                with open(path, "r", encoding="utf-8-sig") as f:
                    self._json_cache[version] = json.load(f)
                log_info("JSON carregado (fallback)", version=version)
            except FileNotFoundError:
                log_error("JSON não encontrado", path=path)
                self._json_cache[version] = []
        
        return self._json_cache[version]
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Refatorar `src/services/bible_service.py`
- [ ] Manter compatibilidade com endpoints atuais
- [ ] Adicionar logging em cada etapa do fallback
- [ ] Testar cenários de falha (PostgreSQL down, API timeout)
- [ ] Documentar estratégia de fallback no código

### Frontend
- N/A nesta fase (apenas backend)

---

## 🧪 Testes de Fallback

### Teste 1: PostgreSQL Funcionando

```python
@pytest.mark.asyncio
async def test_get_chapter_from_postgres():
    service = BibleService()
    chapter = await service.get_chapter("gn", 1, "nvi")
    
    assert chapter is not None
    assert chapter.book_abbrev == "gn"
    assert len(chapter.verses) == 31
```

### Teste 2: PostgreSQL Down → JSON Fallback

```python
@pytest.mark.asyncio
async def test_fallback_to_json(monkeypatch):
    # Mock repository para simular falha
    async def mock_get_chapter(*args, **kwargs):
        raise Exception("PostgreSQL down")
    
    service = BibleService()
    monkeypatch.setattr(service.repository, "get_chapter", mock_get_chapter)
    
    chapter = await service.get_chapter("gn", 1, "nvi")
    
    # Deve funcionar via JSON
    assert chapter is not None
    assert len(chapter.verses) == 31
```

### Teste 3: Versão Remota → API

```python
@pytest.mark.asyncio
async def test_remote_version_api():
    service = BibleService()
    chapter = await service.get_chapter("gn", 1, "ara")
    
    # Deve buscar da API externa
    assert chapter is not None
```

---

## 📊 Estimativa

**Tempo:** 4-6 horas

**Breakdown:**
- Refatoração do BibleService: 2-3h
- Lógica de fallback: 1-2h
- Testes de fallback: 1h

---

## ➡️ Próximo Passo

**Fase 5:** API Endpoints — Criar novos endpoints REST
