from typing import List
from uuid import UUID

from src.modules.missions.repository import missionary_repository
from src.modules.missions.schemas import MissionaryCreate


class MissionService:
    def __init__(self):
        self.repo = missionary_repository

    async def create_missionary(self, tenant_id: UUID, data: MissionaryCreate):
        return await self.repo.create(tenant_id, data)

    async def list_missionaries(self, tenant_id: UUID) -> List[dict]:
        return await self.repo.get_by_tenant(tenant_id)
