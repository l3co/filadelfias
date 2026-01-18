from fastapi import APIRouter, HTTPException, status
from typing import List
from src.services.bible_service import BibleService, BibleBookSummary, BibleChapterContent

router = APIRouter(prefix="/bible", tags=["Bible"])

@router.get("/books", response_model=List[BibleBookSummary])
async def get_books():
    """List all books of the Bible."""
    return BibleService.get_books()

@router.get("/{book}/{chapter}", response_model=BibleChapterContent)
async def get_chapter(book: str, chapter: int):
    """Get a specific chapter with verses."""
    content = BibleService.get_chapter(book.lower(), chapter)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Chapter {chapter} of book '{book}' not found"
        )
    return content
