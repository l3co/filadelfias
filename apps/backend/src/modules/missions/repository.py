import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select

from src.infra.db.models import CountryModel, MissionaryModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository
from src.modules.missions.schemas import CountryCreate, MissionaryCreate

logger = logging.getLogger(__name__)


class CountryRepository(SQLAlchemyRepository):
    fields = ["id", "tenant_id", "code", "name", "created_at", "updated_at"]

    async def create(self, tenant_id: UUID, data: CountryCreate) -> dict:
        async with self.session() as session:
            country = CountryModel(tenant_id=tenant_id, **data.model_dump())
            session.add(country)
            await session.commit()
            await session.refresh(country)
            return self._to_dict(country, self.fields)

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(CountryModel).where(CountryModel.tenant_id == tenant_id).order_by(CountryModel.name.asc())
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def get_by_code(self, tenant_id: UUID, code: str) -> Optional[dict]:
        async with self.session() as session:
            country = await self._first(
                session,
                select(CountryModel).where(CountryModel.tenant_id == tenant_id, CountryModel.code == code),
            )
            return self._to_dict(country, self.fields) if country else None


country_repository = CountryRepository()


class MissionaryRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "name",
        "field_name",
        "country_code",
        "state",
        "city",
        "latitude",
        "longitude",
        "bio",
        "photo_url",
        "newsletter_url",
        "created_at",
        "updated_at",
    ]

    async def create(self, tenant_id: UUID, data: MissionaryCreate) -> dict:
        payload = data.model_dump()
        payload["latitude"] = str(payload["latitude"]) if payload.get("latitude") is not None else None
        payload["longitude"] = str(payload["longitude"]) if payload.get("longitude") is not None else None

        async with self.session() as session:
            missionary = MissionaryModel(tenant_id=tenant_id, **payload)
            session.add(missionary)
            await session.commit()
            await session.refresh(missionary)
            return self._to_dict(missionary, self.fields)

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(MissionaryModel)
                .where(MissionaryModel.tenant_id == tenant_id)
                .order_by(MissionaryModel.name.asc(), MissionaryModel.created_at.desc())
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def delete(self, tenant_id: UUID, missionary_id: str) -> bool:
        async with self.session() as session:
            missionary = await self._first(
                session,
                select(MissionaryModel).where(
                    MissionaryModel.tenant_id == tenant_id,
                    MissionaryModel.id == self._maybe_uuid(missionary_id),
                ),
            )
            if not missionary:
                return False

            await session.delete(missionary)
            await session.commit()
            return True


missionary_repository = MissionaryRepository()
