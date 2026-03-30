from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from src.middleware.permissions import (
    require_create_governance,
    require_manage_governance,
    require_view_governance,
)
from src.modules.governance.repository import council_repository, meeting_repository, meeting_vote_repository
from src.modules.governance.schemas import (
    CouncilCreate,
    CouncilMemberAdd,
    CouncilResponse,
    CouncilUpdate,
    MeetingCreate,
    MeetingResponse,
    MeetingUpdate,
    VoteCastRequest,
    VotingItemResponse,
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
        meeting_type=data.meeting_type,
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


@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_view_governance),
):
    """
    Retrieve a single meeting by ID.
    Requires: Pastor, Presbítero or Diácono (governance:view permission).
    """
    meeting = await meeting_repository.get_by_id(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.patch("/meetings/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    data: MeetingUpdate,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_manage_governance),
):
    """
    Update meeting details, minutes, or attendee list.
    Requires: Pastor or Presbítero with manage permission (governance:manage).

    Cannot update completed meetings (returns 400 error).
    """
    existing = await meeting_repository.get_by_id(meeting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if existing.get("status") == "COMPLETED":
        raise HTTPException(status_code=400, detail="Cannot update a completed meeting")

    update_data = data.model_dump(exclude_unset=True)
    result = await meeting_repository.update_meeting(meeting_id, update_data)
    return result


@router.post("/meetings/{meeting_id}/complete", response_model=MeetingResponse)
async def complete_meeting(
    meeting_id: str,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_manage_governance),
):
    """
    Mark a meeting as completed.
    Requires: Pastor or Presbítero with manage permission (governance:manage).

    This is a one-way operation - completed meetings cannot be reopened.
    The completion timestamp is recorded automatically.
    """
    existing = await meeting_repository.get_by_id(meeting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if existing.get("status") == "COMPLETED":
        raise HTTPException(status_code=400, detail="Meeting is already completed")

    result = await meeting_repository.complete_meeting(meeting_id)
    return result


@router.get("/meetings/{meeting_id}/votes", response_model=List[VotingItemResponse])
async def list_meeting_votes(
    meeting_id: str,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_view_governance),
):
    """
    List voting items and current scoreboard for a meeting.
    Requires: Pastor, Presbítero or Diácono (governance:view permission).
    """
    user = auth_context.get("user") or {}
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    meeting = await meeting_repository.get_by_id(meeting_id)
    if not meeting or meeting.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return await meeting_vote_repository.list_voting_items(tenant_id, meeting_id, user_id)


@router.post("/meetings/{meeting_id}/votes/{agenda_index}", response_model=VotingItemResponse)
async def cast_meeting_vote(
    meeting_id: str,
    agenda_index: int,
    data: VoteCastRequest,
    tenant_id: str = Query(..., description="ID of the tenant/church"),
    auth_context: dict = Depends(require_view_governance),
):
    """
    Cast or update a vote for a specific agenda item.
    Requires: governance:view permission.
    """
    user = auth_context.get("user") or {}
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    meeting = await meeting_repository.get_by_id(meeting_id)
    if not meeting or meeting.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=404, detail="Meeting not found")

    try:
        return await meeting_vote_repository.cast_vote(tenant_id, meeting_id, agenda_index, user_id, data.choice)
    except ValueError as exc:
        message = str(exc)
        if message == "Meeting not found":
            raise HTTPException(status_code=404, detail=message) from exc
        raise HTTPException(status_code=400, detail=message) from exc


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
        raise HTTPException(status_code=404, detail="Council not found")
    return result
