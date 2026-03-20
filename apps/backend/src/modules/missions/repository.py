import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select

from src.infra.db.models import CountryModel, MissionaryModel, SocialProjectModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository
from src.modules.missions.schemas import CountryCreate, MissionaryCreate, MissionaryUpdate, SocialProjectCreate

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

    async def update(self, tenant_id: UUID, missionary_id: str, data: MissionaryUpdate) -> dict | None:
        payload = data.model_dump(exclude_unset=True)
        if "latitude" in payload:
            payload["latitude"] = str(payload["latitude"]) if payload["latitude"] is not None else None
        if "longitude" in payload:
            payload["longitude"] = str(payload["longitude"]) if payload["longitude"] is not None else None

        async with self.session() as session:
            missionary = await self._first(
                session,
                select(MissionaryModel).where(
                    MissionaryModel.tenant_id == tenant_id,
                    MissionaryModel.id == self._maybe_uuid(missionary_id),
                ),
            )
            if not missionary:
                return None

            for field, value in payload.items():
                setattr(missionary, field, value)

            await session.commit()
            await session.refresh(missionary)
            return self._to_dict(missionary, self.fields)

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


class SocialProjectRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "title",
        "summary",
        "location",
        "status",
        "target_audience",
        "coordinator_name",
        "contact_info",
        "start_date",
        "end_date",
        "created_at",
        "updated_at",
    ]

    async def create(self, tenant_id: UUID, data: SocialProjectCreate) -> dict:
        async with self.session() as session:
            project = SocialProjectModel(tenant_id=tenant_id, **data.model_dump())
            session.add(project)
            await session.commit()
            await session.refresh(project)
            return self._to_dict(project, self.fields)

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(SocialProjectModel)
                .where(SocialProjectModel.tenant_id == tenant_id)
                .order_by(SocialProjectModel.created_at.desc(), SocialProjectModel.title.asc())
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def delete(self, tenant_id: UUID, project_id: str) -> bool:
        async with self.session() as session:
            project = await self._first(
                session,
                select(SocialProjectModel).where(
                    SocialProjectModel.tenant_id == tenant_id,
                    SocialProjectModel.id == self._maybe_uuid(project_id),
                ),
            )
            if not project:
                return False

            await session.delete(project)
            await session.commit()
            return True


social_project_repository = SocialProjectRepository()
