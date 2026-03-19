# Fase 5 — API Endpoints

Criação e expansão de endpoints REST para todas as funcionalidades bíblicas.

---

## 🎯 Objetivo

Expandir a API REST com novos endpoints para:
- Busca full-text
- Versículo específico
- Anotações de usuário
- Destaques
- Planos de leitura

Manter **compatibilidade total** com endpoints existentes.

---

## 🐍 Backend — API Endpoints

### Arquivo: `src/api/bible.py` (expandir)

```python
"""
API endpoints para leitura bíblica e recursos de estudo.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from src.api.dependencies import get_current_user, get_tenant_context
from src.services.bible_service import (
    BibleChapterContent,
    BibleHighlight,
    BibleNote,
    BibleSearchResponse,
    BibleService,
    BibleVersion,
)
from src.services.reading_plan_service import ReadingPlanService

router = APIRouter(prefix="/bible", tags=["Bible"])
bible_service = BibleService()
reading_plan_service = ReadingPlanService()


# ========== Endpoints Existentes (Manter Compatibilidade) ==========

@router.get("/versions", response_model=List[BibleVersion])
async def get_versions():
    """Lista versões disponíveis da Bíblia."""
    return await bible_service.get_versions()


@router.get("/books")
async def get_books(version: str = Query("nvi", description="Versão da Bíblia")):
    """Lista todos os livros da Bíblia."""
    return await bible_service.get_books(version)


@router.get("/{book}/{chapter}", response_model=BibleChapterContent)
async def get_chapter(
    book: str,
    chapter: int,
    version: str = Query("nvi", description="Versão da Bíblia"),
):
    """Busca capítulo completo com versículos."""
    content = await bible_service.get_chapter(book.lower(), chapter, version)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Capítulo {chapter} do livro '{book}' não encontrado",
        )
    return content


# ========== Novos Endpoints ==========

# --- Versículo Específico ---

class VerseResponse(BaseModel):
    version: str
    book: str
    book_abbrev: str
    chapter: int
    verse: int
    text: str
    reference: str


@router.get("/{book}/{chapter}/{verse}", response_model=VerseResponse)
async def get_verse(
    book: str,
    chapter: int,
    verse: int,
    version: str = Query("nvi", description="Versão da Bíblia"),
):
    """Busca versículo específico."""
    verse_data = await bible_service.get_verse(
        version_code=version,
        book_abbrev=book.lower(),
        chapter_number=chapter,
        verse_number=verse,
    )
    
    if not verse_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Versículo {book} {chapter}:{verse} não encontrado",
        )
    
    # Adicionar referência formatada
    verse_data["reference"] = f"{verse_data['book']} {chapter}:{verse}"
    
    return verse_data


# --- Busca Full-Text ---

@router.get("/search", response_model=BibleSearchResponse)
async def search_verses(
    q: str = Query(..., min_length=3, description="Palavra ou frase a buscar"),
    version: str = Query("nvi", description="Versão da Bíblia"),
    testament: Optional[str] = Query(None, regex="^(OT|NT)$", description="Filtrar por testamento"),
    limit: int = Query(20, ge=1, le=100, description="Resultados por página"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
):
    """
    Busca full-text nos versículos.
    
    Exemplos:
    - /bible/search?q=amor
    - /bible/search?q=fé&testament=NT
    - /bible/search?q=salvação&version=acf&limit=50
    """
    return await bible_service.search_verses(
        query=q,
        version=version,
        testament=testament,
        limit=limit,
        offset=offset,
    )


# --- Anotações ---

class CreateNoteRequest(BaseModel):
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    content: str
    is_public: bool = False


class UpdateNoteRequest(BaseModel):
    content: str


@router.post("/notes", response_model=BibleNote, status_code=status.HTTP_201_CREATED)
async def create_note(
    request: CreateNoteRequest,
    current_user: dict = Depends(get_current_user),
    tenant_context: dict = Depends(get_tenant_context),
):
    """Cria anotação em versículo."""
    return await bible_service.create_note(
        tenant_id=UUID(tenant_context["tenant_id"]),
        user_id=UUID(current_user["id"]),
        version_code=request.version_code,
        book_abbrev=request.book_abbrev,
        chapter=request.chapter,
        verse=request.verse,
        content=request.content,
        is_public=request.is_public,
    )


@router.get("/notes", response_model=List[BibleNote])
async def get_notes(
    version: Optional[str] = Query(None, description="Filtrar por versão"),
    book: Optional[str] = Query(None, description="Filtrar por livro"),
    chapter: Optional[int] = Query(None, description="Filtrar por capítulo"),
    current_user: dict = Depends(get_current_user),
    tenant_context: dict = Depends(get_tenant_context),
):
    """Lista anotações do usuário."""
    return await bible_service.get_user_notes(
        user_id=UUID(current_user["id"]),
        tenant_id=UUID(tenant_context["tenant_id"]),
        version_code=version,
        book_abbrev=book,
        chapter=chapter,
    )


@router.put("/notes/{note_id}", response_model=BibleNote)
async def update_note(
    note_id: UUID,
    request: UpdateNoteRequest,
    current_user: dict = Depends(get_current_user),
):
    """Atualiza anotação."""
    note = await bible_service.update_note(note_id, request.content)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada",
        )
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Deleta anotação."""
    success = await bible_service.delete_note(note_id, UUID(current_user["id"]))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada ou sem permissão",
        )


# --- Destaques ---

class CreateHighlightRequest(BaseModel):
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    color: Optional[str] = None  # 'yellow', 'green', 'blue', 'pink', 'orange'
    category: Optional[str] = None  # 'promise', 'prayer', 'commandment', 'prophecy'


@router.post("/highlights", response_model=BibleHighlight, status_code=status.HTTP_201_CREATED)
async def create_highlight(
    request: CreateHighlightRequest,
    current_user: dict = Depends(get_current_user),
    tenant_context: dict = Depends(get_tenant_context),
):
    """Cria ou atualiza destaque em versículo."""
    return await bible_service.create_highlight(
        tenant_id=UUID(tenant_context["tenant_id"]),
        user_id=UUID(current_user["id"]),
        version_code=request.version_code,
        book_abbrev=request.book_abbrev,
        chapter=request.chapter,
        verse=request.verse,
        color=request.color,
        category=request.category,
    )


@router.get("/highlights", response_model=List[BibleHighlight])
async def get_highlights(
    version: Optional[str] = Query(None, description="Filtrar por versão"),
    book: Optional[str] = Query(None, description="Filtrar por livro"),
    chapter: Optional[int] = Query(None, description="Filtrar por capítulo"),
    current_user: dict = Depends(get_current_user),
    tenant_context: dict = Depends(get_tenant_context),
):
    """Lista destaques do usuário."""
    return await bible_service.get_user_highlights(
        user_id=UUID(current_user["id"]),
        tenant_id=UUID(tenant_context["tenant_id"]),
        version_code=version,
        book_abbrev=book,
        chapter=chapter,
    )


@router.delete("/highlights/{highlight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_highlight(
    highlight_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Remove destaque."""
    success = await bible_service.delete_highlight(highlight_id, UUID(current_user["id"]))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destaque não encontrado ou sem permissão",
        )


# --- Planos de Leitura ---

class CreatePlanRequest(BaseModel):
    name: str
    description: Optional[str] = None
    duration_days: int
    readings: List[dict]  # [{ day: 1, references: ['gn 1', 'sl 1'], title: '...' }]
    is_public: bool = True


class ReadingPlanResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    duration_days: int
    readings: List[dict]
    is_public: bool
    created_at: str


class ProgressResponse(BaseModel):
    id: str
    plan_id: str
    current_day: int
    completed_readings: List[int]
    started_at: str
    completed_at: Optional[str]


@router.post("/reading-plans", response_model=ReadingPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_reading_plan(
    request: CreatePlanRequest,
    current_user: dict = Depends(get_current_user),
    tenant_context: dict = Depends(get_tenant_context),
):
    """Cria plano de leitura (requer permissão de líder/pastor)."""
    # TODO: Verificar permissão
    return await reading_plan_service.create_plan(
        tenant_id=UUID(tenant_context["tenant_id"]),
        creator_id=UUID(current_user["id"]),
        name=request.name,
        description=request.description,
        duration_days=request.duration_days,
        readings=request.readings,
        is_public=request.is_public,
    )


@router.get("/reading-plans", response_model=List[ReadingPlanResponse])
async def get_reading_plans(
    tenant_context: dict = Depends(get_tenant_context),
):
    """Lista planos de leitura públicos."""
    return await reading_plan_service.get_public_plans(UUID(tenant_context["tenant_id"]))


@router.get("/reading-plans/{plan_id}", response_model=ReadingPlanResponse)
async def get_reading_plan(plan_id: UUID):
    """Busca plano de leitura por ID."""
    plan = await reading_plan_service.get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado",
        )
    return plan


@router.post("/reading-plans/{plan_id}/start", response_model=ProgressResponse)
async def start_reading_plan(
    plan_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Inicia plano de leitura para o usuário."""
    return await reading_plan_service.start_plan(
        user_id=UUID(current_user["id"]),
        plan_id=plan_id,
    )


class MarkProgressRequest(BaseModel):
    day: int


@router.post("/reading-plans/{plan_id}/progress", response_model=ProgressResponse)
async def mark_day_complete(
    plan_id: UUID,
    request: MarkProgressRequest,
    current_user: dict = Depends(get_current_user),
):
    """Marca dia do plano como concluído."""
    progress = await reading_plan_service.update_progress(
        user_id=UUID(current_user["id"]),
        plan_id=plan_id,
        completed_day=request.day,
    )
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progresso não encontrado. Inicie o plano primeiro.",
        )
    
    return progress


@router.get("/reading-plans/{plan_id}/progress", response_model=ProgressResponse)
async def get_reading_progress(
    plan_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Busca progresso do usuário no plano."""
    progress = await reading_plan_service.get_user_progress(
        user_id=UUID(current_user["id"]),
        plan_id=plan_id,
    )
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não iniciou este plano",
        )
    
    return progress
```

---

### Arquivo: `src/services/reading_plan_service.py` (novo)

```python
"""
Service para planos de leitura bíblica.
"""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel

from src.infra.repositories.reading_plan_repository import ReadingPlanRepository


class ReadingPlanService:
    """Service para planos de leitura."""

    def __init__(self):
        self.repository = ReadingPlanRepository()

    async def create_plan(
        self,
        tenant_id: UUID,
        creator_id: UUID,
        name: str,
        description: Optional[str],
        duration_days: int,
        readings: list,
        is_public: bool = True,
    ) -> dict:
        """Cria plano de leitura."""
        return await self.repository.create_plan(
            tenant_id=tenant_id,
            creator_id=creator_id,
            name=name,
            description=description,
            duration_days=duration_days,
            readings=readings,
            is_public=is_public,
        )

    async def get_public_plans(self, tenant_id: UUID) -> List[dict]:
        """Lista planos públicos."""
        return await self.repository.get_public_plans(tenant_id)

    async def get_plan_by_id(self, plan_id: UUID) -> Optional[dict]:
        """Busca plano por ID."""
        return await self.repository.get_plan_by_id(plan_id)

    async def start_plan(self, user_id: UUID, plan_id: UUID) -> dict:
        """Inicia plano para usuário."""
        return await self.repository.start_plan(user_id, plan_id)

    async def update_progress(
        self, user_id: UUID, plan_id: UUID, completed_day: int
    ) -> Optional[dict]:
        """Marca dia como concluído."""
        return await self.repository.update_progress(user_id, plan_id, completed_day)

    async def get_user_progress(self, user_id: UUID, plan_id: UUID) -> Optional[dict]:
        """Busca progresso do usuário."""
        return await self.repository.get_user_progress(user_id, plan_id)
```

---

## 📚 Documentação OpenAPI

A documentação automática estará disponível em `/docs` com todos os endpoints categorizados.

### Exemplos de Uso

**Buscar versículo:**
```bash
GET /bible/gn/1/1?version=nvi
```

**Busca full-text:**
```bash
GET /bible/search?q=amor&testament=NT&limit=20
```

**Criar anotação:**
```bash
POST /bible/notes
{
  "version_code": "nvi",
  "book_abbrev": "jo",
  "chapter": 3,
  "verse": 16,
  "content": "Versículo mais famoso da Bíblia",
  "is_public": false
}
```

**Criar destaque:**
```bash
POST /bible/highlights
{
  "version_code": "nvi",
  "book_abbrev": "sl",
  "chapter": 23,
  "verse": 1,
  "color": "yellow",
  "category": "promise"
}
```

**Iniciar plano de leitura:**
```bash
POST /bible/reading-plans/{plan_id}/start
```

**Marcar dia concluído:**
```bash
POST /bible/reading-plans/{plan_id}/progress
{
  "day": 5
}
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Expandir `src/api/bible.py` com novos endpoints
- [ ] Criar `src/services/reading_plan_service.py`
- [ ] Adicionar validações de permissão
- [ ] Documentar todos os endpoints no OpenAPI
- [ ] Adicionar exemplos de request/response
- [ ] Testes de integração para cada endpoint

### Frontend
- N/A nesta fase (preparação para Fase 6)

---

## 🧪 Testes de Integração

```python
# tests/integration/test_bible_api.py

@pytest.mark.asyncio
async def test_search_verses(client):
    response = await client.get("/bible/search?q=amor&version=nvi")
    
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data
    assert data["total"] > 0


@pytest.mark.asyncio
async def test_create_note(client, auth_headers):
    payload = {
        "version_code": "nvi",
        "book_abbrev": "jo",
        "chapter": 3,
        "verse": 16,
        "content": "Minha anotação",
        "is_public": False,
    }
    
    response = await client.post("/bible/notes", json=payload, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Minha anotação"


@pytest.mark.asyncio
async def test_create_highlight(client, auth_headers):
    payload = {
        "version_code": "nvi",
        "book_abbrev": "sl",
        "chapter": 23,
        "verse": 1,
        "color": "yellow",
        "category": "promise",
    }
    
    response = await client.post("/bible/highlights", json=payload, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["color"] == "yellow"
```

---

## 📊 Estimativa

**Tempo:** 4-6 horas

**Breakdown:**
- Endpoints de busca e versículo: 1h
- Endpoints de anotações: 1-2h
- Endpoints de destaques: 1h
- Endpoints de planos de leitura: 1-2h
- Testes de integração: 1h

---

## ➡️ Próximo Passo

**Fase 6:** Frontend Web — Interface completa de leitura e estudo
