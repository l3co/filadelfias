from typing import List

from fastapi import APIRouter, Depends, Query

from src.modules.governance.repository import council_repository, meeting_repository
from src.modules.governance.schemas import CouncilCreate, CouncilResponse, MeetingCreate, MeetingResponse
from src.middleware.permissions import (
    require_view_governance,
    require_create_governance,
    require_manage_governance,
)

router = APIRouter(prefix="/governance", tags=["Governance"])


@router.post("/councils", response_model=CouncilResponse)
async def create_council(
    data: CouncilCreate,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_create_governance),
):
    """
    Create a new council (Session, Board, Assembly).
    Requires: Pastor or Presbítero (governance:create permission).
    """
    return await council_repository.create_council(
        tenant_id=tenant_id,
        name=data.name,
        council_type=data.type,
        description=data.description,
    )


@router.get("/councils", response_model=List[CouncilResponse])
async def list_councils(
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_view_governance),
):
    """
    List all councils for a specific tenant.
    Requires: Pastor, Presbítero or Diácono (governance:view permission).
    """
    return await council_repository.get_all(tenant_id)


@router.post("/meetings", response_model=MeetingResponse)
async def create_meeting(
    data: MeetingCreate,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_create_governance),
):
    """
    Schedule a new meeting.
    Requires: Pastor or Presbítero (governance:create permission).
    """
    return await meeting_repository.create_meeting(
        council_id=str(data.council_id),
        title=data.agenda,
        scheduled_date=data.date,
        location=data.location,
        status=data.status,
    )


@router.get("/councils/{council_id}/meetings", response_model=List[MeetingResponse])
async def list_meetings(
    council_id: str,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_view_governance),
):
    """
    List meetings for a specific council.
    Requires: Pastor, Presbítero or Diácono (governance:view permission).
    """
    return await meeting_repository.get_by_council(council_id)


@router.delete("/councils/{council_id}")
async def delete_council(
    council_id: str,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_manage_governance),
):
    """
    Delete a council.
    Requires: Pastor or Presbítero with manage permission (governance:manage).
    """
    await council_repository.delete(tenant_id, council_id)
    return {"message": "Council deleted successfully"}

