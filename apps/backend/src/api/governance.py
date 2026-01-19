from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.infra.database import get_db
from src.api.auth import get_current_user
from src.infra.models import User
from src.services.governance_service import GovernanceService
from src.modules.governance.schemas import CouncilCreate, CouncilResponse, MeetingCreate, MeetingResponse

router = APIRouter(prefix="/governance", tags=["Governance"])

@router.post("/councils", response_model=CouncilResponse)
async def create_council(
    data: CouncilCreate, 
    tenant_id: UUID = Query(..., description="ID of the tenant/church"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new council (Session, Board, Assembly).
    Requires appropriate permissions (TODO).
    """
    service = GovernanceService(db)
    return await service.create_council(tenant_id, data)

@router.get("/councils", response_model=List[CouncilResponse])
async def list_councils(
    tenant_id: UUID = Query(..., description="ID of the tenant/church"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all councils for a specific tenant.
    """
    service = GovernanceService(db)
    return await service.list_councils(tenant_id)

@router.post("/meetings", response_model=MeetingResponse)
async def create_meeting(
    data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Schedule a new meeting.
    """
    service = GovernanceService(db)
    return await service.create_meeting(data)

@router.get("/councils/{council_id}/meetings", response_model=List[MeetingResponse])
async def list_meetings(
    council_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List meetings for a specific council.
    """
    service = GovernanceService(db)
    return await service.list_meetings(council_id)
