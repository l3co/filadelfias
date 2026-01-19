from fastapi import APIRouter, HTTPException, status
from typing import List
from src.services.bible_service import BibleService, BibleBookSummary, BibleChapterContent, BibleVersion

router = APIRouter(prefix="/bible", tags=["Bible"])

@router.get("/versions", response_model=List[BibleVersion])
async def get_versions():
    """List available bible versions."""
    return BibleService.get_available_versions()

@router.get("/books", response_model=List[BibleBookSummary])
async def get_books(version: str = "nvi"):
    """List all books of the Bible for a specific version."""
    return BibleService.get_books(version)

@router.get("/{book}/{chapter}", response_model=BibleChapterContent)
async def get_chapter(book: str, chapter: int, version: str = "nvi"):
    """Get a specific chapter with verses from a specific version."""
    content = BibleService.get_chapter(book.lower(), chapter, version)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Chapter {chapter} of book '{book}' not found in version '{version}'"
        )
    return content
