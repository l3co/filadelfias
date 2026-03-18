import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select

from src.infra.db.models import EventModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository
from src.modules.events.schemas import EventCreate, EventUpdate

logger = logging.getLogger(__name__)


class EventRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "title",
        "description",
        "location",
        "start_date",
        "end_date",
        "all_day",
        "category",
        "created_at",
        "updated_at",
    ]

    async def create(self, tenant_id: UUID, data: EventCreate) -> dict:
        async with self.session() as session:
            event = EventModel(tenant_id=tenant_id, **data.model_dump())
            session.add(event)
            await session.commit()
            await session.refresh(event)
            return self._to_dict(event, self.fields)

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(EventModel)
                .where(EventModel.tenant_id == tenant_id)
                .order_by(EventModel.start_date.desc(), EventModel.created_at.desc())
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def get_by_id(self, tenant_id: UUID, event_id: str) -> Optional[dict]:
        async with self.session() as session:
            event = await self._first(
                session,
                select(EventModel).where(
                    EventModel.tenant_id == tenant_id,
                    EventModel.id == self._maybe_uuid(event_id),
                ),
            )
            return self._to_dict(event, self.fields) if event else None

    async def update(self, tenant_id: UUID, event_id: str, data: EventUpdate) -> Optional[dict]:
        async with self.session() as session:
            event = await self._first(
                session,
                select(EventModel).where(
                    EventModel.tenant_id == tenant_id,
                    EventModel.id == self._maybe_uuid(event_id),
                ),
            )
            if not event:
                return None

            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(event, key, value)

            await session.commit()
            await session.refresh(event)
            return self._to_dict(event, self.fields)

    async def delete(self, tenant_id: UUID, event_id: str) -> bool:
        async with self.session() as session:
            event = await self._first(
                session,
                select(EventModel).where(
                    EventModel.tenant_id == tenant_id,
                    EventModel.id == self._maybe_uuid(event_id),
                ),
            )
            if not event:
                return False

            await session.delete(event)
            await session.commit()
            return True


event_repository = EventRepository()
