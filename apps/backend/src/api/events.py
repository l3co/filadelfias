from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException

from src.modules.events.schemas import EventCreate, EventUpdate, EventResponse
from src.modules.events.repository import event_repository
from src.middleware.permissions import require_authenticated

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=EventResponse)
async def create_event(
    data: EventCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Create a new event."""
    return await event_repository.create(tenant_id, data)


@router.get("", response_model=List[EventResponse])
async def list_events(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """List all events for a tenant."""
    return await event_repository.get_by_tenant(tenant_id)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Get a specific event."""
    event = await event_repository.get_by_id(tenant_id, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    data: EventUpdate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Update an event."""
    event = await event_repository.update(tenant_id, event_id, data)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """Delete an event."""
    deleted = await event_repository.delete(tenant_id, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}
