from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from src.middleware.permissions import (
    PermissionChecker,
    require_view_missions,
)
from src.modules.missions.schemas import MissionaryCreate, MissionaryResponse
from src.services.mission_service import MissionService

router = APIRouter(prefix="/missions", tags=["Missions"])

require_create_missions = PermissionChecker("missions", "create")


@router.post("/missionaries", response_model=MissionaryResponse)
async def create_missionary(
    data: MissionaryCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_missions),
):
    """
    Create a new missionary.
    Requires: Pastor, Presbítero, Evangelista or Missionário (missions:create permission).
    """
    service = MissionService()
    return await service.create_missionary(tenant_id, data)


@router.get("/missionaries", response_model=List[MissionaryResponse])
async def list_missionaries(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_missions),
):
    """
    List all missionaries.
    Requires: missions:view permission (all members have this).
    """
    service = MissionService()
    return await service.list_missionaries(tenant_id)
