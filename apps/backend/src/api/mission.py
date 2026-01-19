from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.infra.database import get_db
from src.api.auth import get_current_user
from src.infra.models import User
from src.services.mission_service import MissionService
from src.modules.missions.schemas import MissionaryCreate, MissionaryResponse

router = APIRouter(prefix="/missions", tags=["Missions"])

@router.post("/missionaries", response_model=MissionaryResponse)
async def create_missionary(
    data: MissionaryCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MissionService(db)
    return await service.create_missionary(tenant_id, data)

@router.get("/missionaries", response_model=List[MissionaryResponse])
async def list_missionaries(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MissionService(db)
    return await service.list_missionaries(tenant_id)
