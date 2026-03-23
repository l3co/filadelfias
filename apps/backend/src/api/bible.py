from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from src.api.auth import get_current_user
from src.services.bible_service import (
    BibleBookSummary,
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


class VerseResponse(BaseModel):
    version: str
    book: str
    book_abbrev: str
    chapter: int
    verse: int
    text: str
    reference: str


class CreateNoteRequest(BaseModel):
    tenant_id: UUID
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    content: str
    is_public: bool = False


class UpdateNoteRequest(BaseModel):
    content: str


class CreateHighlightRequest(BaseModel):
    tenant_id: UUID
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    color: Optional[str] = None
    category: Optional[str] = None


class CreatePlanRequest(BaseModel):
    tenant_id: UUID
    name: str
    description: Optional[str] = None
    duration_days: int = Field(..., ge=1)
    readings: List[dict]
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


class MarkProgressRequest(BaseModel):
    day: int = Field(..., ge=1)


class BibleMetricsResponse(BaseModel):
    database: str
    table_sizes: List[dict]
    index_usage: List[dict]


@router.get("/versions", response_model=List[BibleVersion])
async def get_versions():
    """List available bible versions."""
    return await bible_service.get_versions()


@router.get("/books", response_model=List[BibleBookSummary])
async def get_books(version: str = "nvi"):
    """List all books of the Bible for a specific version."""
    return await bible_service.get_books(version)


@router.get("/search", response_model=BibleSearchResponse)
async def search_verses(
    q: str = Query(..., min_length=2, description="Termo a buscar"),
    version: str = Query("nvi", description="Versão da Bíblia"),
    testament: Optional[str] = Query(None, pattern="^(OT|NT)$", description="Filtrar por testamento"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return await bible_service.search_verses(q, version=version, testament=testament, limit=limit, offset=offset)


@router.get("/metrics", response_model=BibleMetricsResponse)
async def get_bible_metrics(current_user: dict = Depends(get_current_user)):
    return await bible_service.get_metrics()


@router.post("/notes", response_model=BibleNote, status_code=status.HTTP_201_CREATED)
async def create_note(request: CreateNoteRequest, current_user: dict = Depends(get_current_user)):
    return await bible_service.create_note(
        tenant_id=request.tenant_id,
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
    tenant_id: UUID = Query(..., description="Tenant atual"),
    version: Optional[str] = Query(None),
    book: Optional[str] = Query(None),
    chapter: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    return await bible_service.get_user_notes(
        user_id=UUID(current_user["id"]),
        tenant_id=tenant_id,
        version_code=version,
        book_abbrev=book,
        chapter=chapter,
    )


@router.put("/notes/{note_id}", response_model=BibleNote)
async def update_note(note_id: UUID, request: UpdateNoteRequest, current_user: dict = Depends(get_current_user)):
    note = await bible_service.update_note(note_id, UUID(current_user["id"]), request.content)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: UUID, current_user: dict = Depends(get_current_user)):
    deleted = await bible_service.delete_note(note_id, UUID(current_user["id"]))
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")


@router.post("/highlights", response_model=BibleHighlight, status_code=status.HTTP_201_CREATED)
async def create_highlight(request: CreateHighlightRequest, current_user: dict = Depends(get_current_user)):
    return await bible_service.create_highlight(
        tenant_id=request.tenant_id,
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
    tenant_id: UUID = Query(..., description="Tenant atual"),
    version: Optional[str] = Query(None),
    book: Optional[str] = Query(None),
    chapter: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    return await bible_service.get_user_highlights(
        user_id=UUID(current_user["id"]),
        tenant_id=tenant_id,
        version_code=version,
        book_abbrev=book,
        chapter=chapter,
    )


@router.delete("/highlights/{highlight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_highlight(highlight_id: UUID, current_user: dict = Depends(get_current_user)):
    deleted = await bible_service.delete_highlight(highlight_id, UUID(current_user["id"]))
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Highlight not found")


@router.post("/reading-plans", response_model=ReadingPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_reading_plan(request: CreatePlanRequest, current_user: dict = Depends(get_current_user)):
    return await reading_plan_service.create_plan(
        tenant_id=request.tenant_id,
        creator_id=UUID(current_user["id"]),
        name=request.name,
        description=request.description,
        duration_days=request.duration_days,
        readings=request.readings,
        is_public=request.is_public,
    )


@router.get("/reading-plans", response_model=List[ReadingPlanResponse])
async def get_reading_plans(tenant_id: UUID = Query(..., description="Tenant atual")):
    return await reading_plan_service.get_public_plans(tenant_id)


@router.get("/reading-plans/{plan_id}", response_model=ReadingPlanResponse)
async def get_reading_plan(plan_id: UUID):
    plan = await reading_plan_service.get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reading plan not found")
    return plan


@router.post("/reading-plans/{plan_id}/start", response_model=ProgressResponse)
async def start_reading_plan(plan_id: UUID, current_user: dict = Depends(get_current_user)):
    progress = await reading_plan_service.start_plan(UUID(current_user["id"]), plan_id)
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reading plan not found")
    return progress


@router.post("/reading-plans/{plan_id}/progress", response_model=ProgressResponse)
async def mark_day_complete(
    plan_id: UUID,
    request: MarkProgressRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        progress = await reading_plan_service.update_progress(
            user_id=UUID(current_user["id"]),
            plan_id=plan_id,
            completed_day=request.day,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reading progress not found")
    return progress


@router.get("/reading-plans/{plan_id}/progress", response_model=ProgressResponse)
async def get_reading_progress(plan_id: UUID, current_user: dict = Depends(get_current_user)):
    progress = await reading_plan_service.get_user_progress(UUID(current_user["id"]), plan_id)
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reading progress not found")
    return progress


@router.get("/{book}/{chapter}", response_model=BibleChapterContent)
async def get_chapter(book: str, chapter: int, version: str = "nvi"):
    """Get a specific chapter with verses from a specific version."""
    content = await bible_service.get_chapter(book.lower(), chapter, version)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter {chapter} of book '{book}' not found in version '{version}'",
        )
    return content


@router.get("/{book}/{chapter}/{verse}", response_model=VerseResponse)
async def get_verse(book: str, chapter: int, verse: int, version: str = "nvi"):
    verse_data = await bible_service.get_verse(
        version_code=version,
        book_abbrev=book.lower(),
        chapter_number=chapter,
        verse_number=verse,
    )
    if not verse_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verse {book} {chapter}:{verse} not found in version '{version}'",
        )
    verse_data["reference"] = f"{verse_data['book']} {chapter}:{verse}"
    return verse_data
