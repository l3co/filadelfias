from fastapi import APIRouter, HTTPException, status
from typing import List
from src.services.hymnal_service import HymnalService, Hymn

router = APIRouter(prefix="/hymnal", tags=["Hymnal"])

@router.get("/", response_model=List[Hymn])
async def get_hymns():
    """List all hymns."""
    return HymnalService.get_hymns()

@router.get("/{number}", response_model=Hymn)
async def get_hymn(number: int):
    """Get a specific hymn by number."""
    hymn = HymnalService.get_hymn(number)
    if not hymn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Hino {number} não encontrado"
        )
    return hymn
