import logging
from datetime import date
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select

from src.infra.db.models import DevotionalModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository
from src.modules.devotionals.schemas import DevotionalCreate, DevotionalUpdate

logger = logging.getLogger(__name__)


class DevotionalRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "title",
        "date",
        "verse_reference",
        "verse_text",
        "meditation",
        "reflection",
        "prayer",
        "author",
        "created_at",
        "updated_at",
    ]

    async def create(self, tenant_id: UUID, data: DevotionalCreate) -> dict:
        async with self.session() as session:
            devotional = DevotionalModel(tenant_id=tenant_id, **data.model_dump())
            session.add(devotional)
            await session.commit()
            await session.refresh(devotional)
            return self._to_dict(devotional, self.fields)

    async def get_by_tenant(self, tenant_id: UUID, limit: int = 30) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(DevotionalModel)
                .where(DevotionalModel.tenant_id == tenant_id)
                .order_by(DevotionalModel.date.desc(), DevotionalModel.created_at.desc())
                .limit(limit)
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def get_by_id(self, tenant_id: UUID, devotional_id: str) -> Optional[dict]:
        async with self.session() as session:
            devotional = await self._first(
                session,
                select(DevotionalModel).where(
                    DevotionalModel.tenant_id == tenant_id,
                    DevotionalModel.id == self._maybe_uuid(devotional_id),
                ),
            )
            return self._to_dict(devotional, self.fields) if devotional else None

    async def get_by_date(self, tenant_id: UUID, target_date: date) -> Optional[dict]:
        async with self.session() as session:
            devotional = await self._first(
                session,
                select(DevotionalModel).where(
                    DevotionalModel.tenant_id == tenant_id,
                    DevotionalModel.date == target_date,
                ),
            )
            return self._to_dict(devotional, self.fields) if devotional else None

    async def get_today(self, tenant_id: UUID) -> Optional[dict]:
        return await self.get_by_date(tenant_id, date.today())

    async def update(self, tenant_id: UUID, devotional_id: str, data: DevotionalUpdate) -> Optional[dict]:
        async with self.session() as session:
            devotional = await self._first(
                session,
                select(DevotionalModel).where(
                    DevotionalModel.tenant_id == tenant_id,
                    DevotionalModel.id == self._maybe_uuid(devotional_id),
                ),
            )
            if not devotional:
                return None

            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(devotional, key, value)

            await session.commit()
            await session.refresh(devotional)
            return self._to_dict(devotional, self.fields)

    async def delete(self, tenant_id: UUID, devotional_id: str) -> bool:
        async with self.session() as session:
            devotional = await self._first(
                session,
                select(DevotionalModel).where(
                    DevotionalModel.tenant_id == tenant_id,
                    DevotionalModel.id == self._maybe_uuid(devotional_id),
                ),
            )
            if not devotional:
                return False

            await session.delete(devotional)
            await session.commit()
            return True


devotional_repository = DevotionalRepository()
