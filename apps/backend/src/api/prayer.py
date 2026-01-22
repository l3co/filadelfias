from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException

from src.modules.prayer.schemas import PrayerRequestCreate, PrayerRequestResponse
from src.modules.prayer.repository import prayer_request_repository
from src.middleware.permissions import require_authenticated

router = APIRouter(prefix="/prayer", tags=["Prayer"])


@router.post("/requests", response_model=PrayerRequestResponse)
async def create_prayer_request(
    data: PrayerRequestCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Create a new prayer request."""
    user = auth_context.get("user") or {}
    member = auth_context.get("member") or {}
    
    member_id = member.get("id") or user.get("id") or "unknown"
    author_name = member.get("full_name") or user.get("name") or "Membro"
    
    return await prayer_request_repository.create(tenant_id, member_id, author_name, data)


@router.get("/requests", response_model=List[PrayerRequestResponse])
async def list_prayer_requests(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """List all prayer requests for a tenant."""
    return await prayer_request_repository.get_by_tenant(tenant_id)


@router.post("/requests/{request_id}/pray")
async def pray_for_request(
    request_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Increment prayer count for a request."""
    user = auth_context.get("user") or {}
    user_id = user.get("id") or "unknown"
    
    result = await prayer_request_repository.increment_prayer_count(tenant_id, request_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    return {"message": "Prayer registered", "prayer_count": result.get("prayer_count", 0)}


@router.delete("/requests/{request_id}")
async def delete_prayer_request(
    request_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Delete a prayer request."""
    deleted = await prayer_request_repository.delete(tenant_id, request_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    return {"message": "Prayer request deleted successfully"}
