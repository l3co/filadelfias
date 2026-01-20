"""
API endpoints for Manual Presbiteriano 2019.
"""

from fastapi import APIRouter, HTTPException, Query

from src.services.manual_service import get_article, get_manual_structure, search_articles

router = APIRouter(prefix="/manual", tags=["Manual Presbiteriano"])


@router.get("/structure")
async def get_structure():
    """
    Get the complete manual structure (table of contents).
    Returns parts, chapters, and sections without article content.
    """
    return get_manual_structure()


@router.get("/article/{article_id:path}")
async def get_article_by_id(article_id: str):
    """
    Get a specific article by its ID.
    Returns the full article with text, structure, notes, and navigation.
    """
    article = get_article(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return article


@router.get("/search")
async def search(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results"),
):
    """
    Search articles by text content.
    Returns matching articles with excerpts.
    """
    results = search_articles(q, limit)
    return {
        "query": q,
        "count": len(results),
        "results": results,
    }
