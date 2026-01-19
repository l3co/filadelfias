from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.missions.models import Missionary


class MissionaryRepository:
    """Repository for Missionary operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, missionary: Missionary) -> Missionary:
        self.session.add(missionary)
        await self.session.commit()
        await self.session.refresh(missionary)
        return missionary

    async def get_by_tenant(self, tenant_id: UUID) -> Sequence[Missionary]:
        result = await self.session.execute(
            select(Missionary).where(Missionary.tenant_id == tenant_id)
        )
        return result.scalars().all()
