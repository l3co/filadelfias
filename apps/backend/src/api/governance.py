from typing import List

from fastapi import APIRouter, Depends, Query

from src.api.auth import get_current_user
from src.modules.governance.repository import council_repository, meeting_repository
from src.modules.governance.schemas import CouncilCreate, CouncilResponse, MeetingCreate, MeetingResponse

router = APIRouter(prefix="/governance", tags=["Governance"])


@router.post("/councils", response_model=CouncilResponse)
async def create_council(
    data: CouncilCreate,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new council (Session, Board, Assembly).
    Requires appropriate permissions (TODO).
    """
    # Schema uses 'type'
    return await council_repository.create_council(
        tenant_id=tenant_id,
        name=data.name,
        council_type=data.type,
        description=data.description,
    )


@router.get("/councils", response_model=List[CouncilResponse])
async def list_councils(
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    current_user: dict = Depends(get_current_user),
):
    """
    List all councils for a specific tenant.
    """
    return await council_repository.get_all(tenant_id)


@router.post("/meetings", response_model=MeetingResponse)
async def create_meeting(
    data: MeetingCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Schedule a new meeting.
    """
    # Schema: date, status, agenda, location
    return await meeting_repository.create_meeting(
        council_id=str(data.council_id),
        title=data.agenda,  # Map agenda to title/agenda
        scheduled_date=data.date,  # Map date
        location=data.location,
        status=data.status,
    )


@router.get("/councils/{council_id}/meetings", response_model=List[MeetingResponse])
async def list_meetings(
    council_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    List meetings for a specific council.
    """
    return await meeting_repository.get_by_council(council_id)
