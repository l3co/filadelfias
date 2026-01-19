from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.missions.repository import MissionaryRepository
from src.modules.missions.models import Missionary
from src.modules.missions.schemas import MissionaryCreate

class MissionService:
    def __init__(self, db: AsyncSession):
        self.repo = MissionaryRepository(db)

    async def create_missionary(self, tenant_id: UUID, data: MissionaryCreate) -> Missionary:
        missionary = Missionary(
            tenant_id=tenant_id,
            name=data.name,
            field_name=data.field_name,
            country_code=data.country_code,
            latitude=data.latitude,
            longitude=data.longitude,
            bio=data.bio,
            photo_url=data.photo_url,
            newsletter_url=data.newsletter_url
        )
        return await self.repo.create(missionary)

    async def list_missionaries(self, tenant_id: UUID) -> List[Missionary]:
        return await self.repo.get_by_tenant(tenant_id)
