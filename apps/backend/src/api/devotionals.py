from typing import List, Optional
from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, Query, HTTPException

from src.modules.devotionals.schemas import DevotionalCreate, DevotionalUpdate, DevotionalResponse
from src.modules.devotionals.repository import devotional_repository
from src.middleware.permissions import require_authenticated

router = APIRouter(prefix="/devotionals", tags=["Devotionals"])


@router.post("", response_model=DevotionalResponse)
async def create_devotional(
    data: DevotionalCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Create a new devotional."""
    return await devotional_repository.create(tenant_id, data)


@router.get("", response_model=List[DevotionalResponse])
async def list_devotionals(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    limit: int = Query(30, description="Number of devotionals to return"),
    auth_context: dict = Depends(require_authenticated),
):
    """List devotionals for a tenant, ordered by date descending."""
    return await devotional_repository.get_by_tenant(tenant_id, limit)


@router.get("/today", response_model=Optional[DevotionalResponse])
async def get_today_devotional(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Get today's devotional."""
    return await devotional_repository.get_today(tenant_id)


@router.get("/date/{target_date}", response_model=Optional[DevotionalResponse])
async def get_devotional_by_date(
    target_date: date,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Get devotional for a specific date."""
    return await devotional_repository.get_by_date(tenant_id, target_date)


@router.get("/{devotional_id}", response_model=DevotionalResponse)
async def get_devotional(
    devotional_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Get a specific devotional."""
    devotional = await devotional_repository.get_by_id(tenant_id, devotional_id)
    if not devotional:
        raise HTTPException(status_code=404, detail="Devotional not found")
    return devotional


@router.patch("/{devotional_id}", response_model=DevotionalResponse)
async def update_devotional(
    devotional_id: str,
    data: DevotionalUpdate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Update a devotional."""
    devotional = await devotional_repository.update(tenant_id, devotional_id, data)
    if not devotional:
        raise HTTPException(status_code=404, detail="Devotional not found")
    return devotional


@router.delete("/{devotional_id}")
async def delete_devotional(
    devotional_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Delete a devotional."""
    deleted = await devotional_repository.delete(tenant_id, devotional_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Devotional not found")
    return {"message": "Devotional deleted successfully"}
