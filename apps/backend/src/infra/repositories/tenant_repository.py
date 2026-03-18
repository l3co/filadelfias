"""
Tenant repository backed by PostgreSQL.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select

from src.infra.db.models import TenantModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class TenantRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "name",
        "slug",
        "logo_url",
        "street",
        "number",
        "complement",
        "neighborhood",
        "city",
        "state",
        "postal_code",
        "country",
        "phone",
        "email",
        "latitude",
        "longitude",
        "is_public",
        "created_at",
        "updated_at",
    ]

    async def get(self, tenant_id: str) -> Optional[dict]:
        async with self.session() as session:
            tenant = await session.get(TenantModel, self._maybe_uuid(tenant_id))
            return self._to_dict(tenant, self.fields) if tenant else None

    async def get_by_slug(self, slug: str) -> Optional[dict]:
        async with self.session() as session:
            tenant = await self._first(session, select(TenantModel).where(TenantModel.slug == slug))
            return self._to_dict(tenant, self.fields) if tenant else None

    async def create_tenant(
        self,
        name: str,
        slug: str,
        logo_url: Optional[str] = None,
        street: Optional[str] = None,
        number: Optional[str] = None,
        complement: Optional[str] = None,
        neighborhood: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        postal_code: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
    ) -> dict:
        async with self.session() as session:
            tenant = TenantModel(
                name=name,
                slug=slug,
                logo_url=logo_url,
                street=street,
                number=number,
                complement=complement,
                neighborhood=neighborhood,
                city=city,
                state=state,
                postal_code=postal_code,
                phone=phone,
                email=email,
            )
            session.add(tenant)
            await session.commit()
            await session.refresh(tenant)
            return self._to_dict(tenant, self.fields)

    async def update(self, tenant_id: str, data: dict) -> Optional[dict]:
        async with self.session() as session:
            tenant = await session.get(TenantModel, self._maybe_uuid(tenant_id))
            if not tenant:
                return None
            for key, value in data.items():
                if hasattr(tenant, key):
                    setattr(tenant, key, value)
            await session.commit()
            await session.refresh(tenant)
            return self._to_dict(tenant, self.fields)

    async def delete(self, tenant_id: str) -> bool:
        async with self.session() as session:
            tenant = await session.get(TenantModel, self._maybe_uuid(tenant_id))
            if not tenant:
                return False
            await session.delete(tenant)
            await session.commit()
            return True


tenant_repository = TenantRepository()
