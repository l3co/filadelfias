from typing import List

from fastapi import APIRouter, Depends, Query

from src.modules.governance.repository import council_repository, meeting_repository
from src.modules.governance.schemas import CouncilCreate, CouncilUpdate, CouncilMemberAdd, CouncilResponse, MeetingCreate, MeetingResponse
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


@router.patch("/councils/{council_id}", response_model=CouncilResponse)
async def update_council(
    council_id: str,
    data: CouncilUpdate,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_manage_governance),
):
    """
    Update a council.
    Requires: Pastor or Presbítero with manage permission (governance:manage).
    """
    update_data = data.model_dump(exclude_unset=True)
    if "type" in update_data:
        update_data["council_type"] = update_data.pop("type")
    await council_repository.update(council_id, update_data, tenant_id)
    return await council_repository.get(council_id, tenant_id)


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


@router.post("/councils/{council_id}/members", response_model=CouncilResponse)
async def add_council_member(
    council_id: str,
    data: CouncilMemberAdd,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_manage_governance),
):
    """
    Add a member to a council.
    Requires: Pastor or Presbítero with manage permission (governance:manage).
    """
    result = await council_repository.add_member(tenant_id, council_id, data.member_id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Council not found")
    return result


@router.delete("/councils/{council_id}/members/{member_id}", response_model=CouncilResponse)
async def remove_council_member(
    council_id: str,
    member_id: str,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_manage_governance),
):
    """
    Remove a member from a council.
    Requires: Pastor or Presbítero with manage permission (governance:manage).
    """
    result = await council_repository.remove_member(tenant_id, council_id, member_id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Council not found")
    return result

