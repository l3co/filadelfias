from typing import List
from uuid import UUID

from src.modules.missions.repository import missionary_repository, social_project_repository
from src.modules.missions.schemas import MissionaryCreate, MissionaryUpdate, SocialProjectCreate, SocialProjectUpdate


class MissionService:
    def __init__(self):
        self.repo = missionary_repository
        self.social_project_repo = social_project_repository

    async def create_missionary(self, tenant_id: UUID, data: MissionaryCreate):
        return await self.repo.create(tenant_id, data)

    async def update_missionary(self, tenant_id: UUID, missionary_id: str, data: MissionaryUpdate):
        return await self.repo.update(tenant_id, missionary_id, data)

    async def list_missionaries(self, tenant_id: UUID) -> List[dict]:
        return await self.repo.get_by_tenant(tenant_id)

    async def create_social_project(self, tenant_id: UUID, data: SocialProjectCreate):
        return await self.social_project_repo.create(tenant_id, data)

    async def update_social_project(self, tenant_id: UUID, project_id: str, data: SocialProjectUpdate):
        return await self.social_project_repo.update(tenant_id, project_id, data)

    async def list_social_projects(self, tenant_id: UUID) -> List[dict]:
        return await self.social_project_repo.get_by_tenant(tenant_id)

    async def delete_social_project(self, tenant_id: UUID, project_id: str) -> bool:
        return await self.social_project_repo.delete(tenant_id, project_id)
