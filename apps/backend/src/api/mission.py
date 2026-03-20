from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from src.middleware.permissions import (
    PermissionChecker,
    require_authenticated,
    require_view_missions,
)
from src.modules.missions.repository import country_repository, missionary_repository
from src.modules.missions.schemas import (
    CountryCreate,
    CountryResponse,
    MissionaryCreate,
    MissionaryResponse,
    MissionaryUpdate,
    SocialProjectCreate,
    SocialProjectResponse,
    SocialProjectUpdate,
)
from src.services.mission_service import MissionService

router = APIRouter(prefix="/missions", tags=["Missions"])

require_create_missions = PermissionChecker("missions", "create")
require_delete_missions = PermissionChecker("missions", "delete")


# ============================================================================
# COUNTRIES
# ============================================================================


@router.get("/countries", response_model=List[CountryResponse])
async def list_countries(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_authenticated),
):
    """List all countries for a tenant."""
    return await country_repository.get_by_tenant(tenant_id)


@router.post("/countries", response_model=CountryResponse)
async def create_country(
    data: CountryCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_missions),
):
    """Create a new country. Requires missions:create permission."""
    return await country_repository.create(tenant_id, data)


# ============================================================================
# MISSIONARIES
# ============================================================================


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


@router.put("/missionaries/{missionary_id}", response_model=MissionaryResponse)
async def update_missionary(
    missionary_id: str,
    data: MissionaryUpdate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_missions),
):
    """
    Update a missionary.
    Requires: missions:create permission.
    """
    service = MissionService()
    updated = await service.update_missionary(tenant_id, missionary_id, data)
    if not updated:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Missionário não encontrado")
    return updated


@router.delete("/missionaries/{missionary_id}")
async def delete_missionary(
    missionary_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_delete_missions),
):
    """
    Delete a missionary.
    Requires: missions:delete permission.
    """
    deleted = await missionary_repository.delete(tenant_id, missionary_id)
    if not deleted:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Missionário não encontrado")

    return {"success": True}


@router.post("/social-projects", response_model=SocialProjectResponse)
async def create_social_project(
    data: SocialProjectCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_missions),
):
    """
    Create a social project.
    Requires: missions:create permission.
    """
    service = MissionService()
    return await service.create_social_project(tenant_id, data)


@router.get("/social-projects", response_model=List[SocialProjectResponse])
async def list_social_projects(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_missions),
):
    """
    List social projects.
    Requires: missions:view permission.
    """
    service = MissionService()
    return await service.list_social_projects(tenant_id)


@router.put("/social-projects/{project_id}", response_model=SocialProjectResponse)
async def update_social_project(
    project_id: str,
    data: SocialProjectUpdate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_missions),
):
    """
    Update a social project.
    Requires: missions:create permission.
    """
    service = MissionService()
    updated = await service.update_social_project(tenant_id, project_id, data)
    if not updated:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Projeto social não encontrado")
    return updated


@router.delete("/social-projects/{project_id}")
async def delete_social_project(
    project_id: str,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_delete_missions),
):
    """
    Delete a social project.
    Requires: missions:delete permission.
    """
    service = MissionService()
    deleted = await service.delete_social_project(tenant_id, project_id)
    if not deleted:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Projeto social não encontrado")

    return {"success": True}
