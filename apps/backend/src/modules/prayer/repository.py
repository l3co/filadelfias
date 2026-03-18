import json
import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select

from src.infra.db.models import PrayerRequestModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository
from src.modules.prayer.schemas import PrayerRequestCreate

logger = logging.getLogger(__name__)


class PrayerRequestRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "member_id",
        "author_name",
        "content",
        "category",
        "is_anonymous",
        "prayer_count",
        "prayed_by",
        "created_at",
        "updated_at",
    ]

    def _to_request_dict(self, request: PrayerRequestModel) -> dict:
        data = self._to_dict(request, self.fields)
        try:
            data["prayed_by"] = json.loads(data.get("prayed_by") or "[]")
        except json.JSONDecodeError:
            data["prayed_by"] = []
        return data

    async def create(self, tenant_id: UUID, member_id: str, author_name: str, data: PrayerRequestCreate) -> dict:
        async with self.session() as session:
            request = PrayerRequestModel(
                tenant_id=tenant_id,
                member_id=member_id,
                author_name="Anônimo" if data.is_anonymous else author_name,
                content=data.content,
                category=data.category,
                is_anonymous=data.is_anonymous,
                prayer_count=0,
                prayed_by="[]",
            )
            session.add(request)
            await session.commit()
            await session.refresh(request)
            return self._to_request_dict(request)

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(PrayerRequestModel)
                .where(PrayerRequestModel.tenant_id == tenant_id)
                .order_by(PrayerRequestModel.created_at.desc())
                .limit(50)
            )
            return [self._to_request_dict(item) for item in result.scalars().all()]

    async def get_by_id(self, tenant_id: UUID, request_id: str) -> Optional[dict]:
        async with self.session() as session:
            request = await self._first(
                session,
                select(PrayerRequestModel).where(
                    PrayerRequestModel.tenant_id == tenant_id,
                    PrayerRequestModel.id == self._maybe_uuid(request_id),
                ),
            )
            return self._to_request_dict(request) if request else None

    async def increment_prayer_count(self, tenant_id: UUID, request_id: str, user_id: str) -> Optional[dict]:
        async with self.session() as session:
            request = await self._first(
                session,
                select(PrayerRequestModel).where(
                    PrayerRequestModel.tenant_id == tenant_id,
                    PrayerRequestModel.id == self._maybe_uuid(request_id),
                ),
            )
            if not request:
                return None

            prayed_by = json.loads(request.prayed_by or "[]")
            if user_id in prayed_by:
                return self._to_request_dict(request)

            prayed_by.append(user_id)
            request.prayed_by = json.dumps(prayed_by)
            request.prayer_count = len(prayed_by)

            await session.commit()
            await session.refresh(request)
            return self._to_request_dict(request)

    async def delete(self, tenant_id: UUID, request_id: str) -> bool:
        async with self.session() as session:
            request = await self._first(
                session,
                select(PrayerRequestModel).where(
                    PrayerRequestModel.tenant_id == tenant_id,
                    PrayerRequestModel.id == self._maybe_uuid(request_id),
                ),
            )
            if not request:
                return False

            await session.delete(request)
            await session.commit()
            return True


prayer_request_repository = PrayerRequestRepository()
