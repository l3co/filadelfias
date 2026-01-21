from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from src.api.auth import get_current_user
from src.modules.missions.schemas import MissionaryCreate, MissionaryResponse
from src.services.mission_service import MissionService

router = APIRouter(prefix="/missions", tags=["Missions"])


@router.post("/missionaries", response_model=MissionaryResponse)
async def create_missionary(
    data: MissionaryCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    service = MissionService()
    return await service.create_missionary(tenant_id, data)


@router.get("/missionaries", response_model=List[MissionaryResponse])
async def list_missionaries(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    service = MissionService()
    return await service.list_missionaries(tenant_id)
