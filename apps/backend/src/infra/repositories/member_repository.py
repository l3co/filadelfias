"""
Member repository backed by PostgreSQL.
"""

from __future__ import annotations

import json
from datetime import date
from typing import Optional

from sqlalchemy import select

from src.infra.db.models import MemberModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class MemberRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "user_id",
        "full_name",
        "email",
        "phone",
        "birth_date",
        "gender",
        "marital_status",
        "marriage_date",
        "spouse_name",
        "street",
        "number",
        "complement",
        "neighborhood",
        "city",
        "state",
        "postal_code",
        "status",
        "office",
        "system_role",
        "photo_url",
        "functions",
        "baptism_date",
        "profession_of_faith_date",
        "admission_date",
        "admission_type",
        "origin_church",
        "created_at",
        "updated_at",
    ]

    def _prepare_payload(self, data: dict) -> dict:
        payload = data.copy()
        if "functions" in payload and isinstance(payload["functions"], list):
            payload["functions"] = json.dumps(payload["functions"])
        for field in [
            "birth_date",
            "marriage_date",
            "baptism_date",
            "profession_of_faith_date",
            "admission_date",
        ]:
            value = payload.get(field)
            if isinstance(value, str):
                payload[field] = date.fromisoformat(value)
        payload.pop("role", None)
        return payload

    def _to_member_dict(self, member: MemberModel) -> dict:
        data = self._to_dict(member, self.fields)
        if data.get("functions"):
            try:
                data["functions"] = json.loads(data["functions"])
            except json.JSONDecodeError:
                pass
        return data

    async def get(self, tenant_id: str, member_id: str) -> Optional[dict]:
        async with self.session() as session:
            member = await self._first(
                session,
                select(MemberModel).where(
                    MemberModel.id == self._maybe_uuid(member_id),
                    MemberModel.tenant_id == self._maybe_uuid(tenant_id),
                ),
            )
            return self._to_member_dict(member) if member else None

    async def get_all(self, tenant_id: str, limit: int = 100) -> list[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(MemberModel)
                .where(MemberModel.tenant_id == self._maybe_uuid(tenant_id))
                .limit(limit)
                .order_by(MemberModel.full_name.asc())
            )
            return [self._to_member_dict(item) for item in result.scalars().all()]

    async def get_by_email(self, tenant_id: str, email: str) -> Optional[dict]:
        async with self.session() as session:
            member = await self._first(
                session,
                select(MemberModel).where(
                    MemberModel.tenant_id == self._maybe_uuid(tenant_id),
                    MemberModel.email == email,
                ),
            )
            return self._to_member_dict(member) if member else None

    async def get_by_user_id(self, tenant_id: str, user_id: str) -> Optional[dict]:
        async with self.session() as session:
            member = await self._first(
                session,
                select(MemberModel).where(
                    MemberModel.tenant_id == self._maybe_uuid(tenant_id),
                    MemberModel.user_id == self._maybe_uuid(user_id),
                ),
            )
            return self._to_member_dict(member) if member else None

    async def create_member(self, tenant_id: str, **kwargs) -> dict:
        async with self.session() as session:
            payload = self._prepare_payload(kwargs)
            if payload.get("user_id"):
                payload["user_id"] = self._maybe_uuid(payload["user_id"])
            member = MemberModel(tenant_id=self._maybe_uuid(tenant_id), **payload)
            session.add(member)
            await session.commit()
            await session.refresh(member)
            return self._to_member_dict(member)

    async def update(self, tenant_id: str, member_id: str, data: dict) -> Optional[dict]:
        async with self.session() as session:
            member = await self._first(
                session,
                select(MemberModel).where(
                    MemberModel.id == self._maybe_uuid(member_id),
                    MemberModel.tenant_id == self._maybe_uuid(tenant_id),
                ),
            )
            if not member:
                return None
            payload = self._prepare_payload(data)
            for key, value in payload.items():
                if hasattr(member, key):
                    if key == "user_id" and value:
                        value = self._maybe_uuid(value)
                    setattr(member, key, value)
            await session.commit()
            await session.refresh(member)
            return self._to_member_dict(member)

    async def get_by_status(self, tenant_id: str, status: str) -> list[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(MemberModel).where(
                    MemberModel.tenant_id == self._maybe_uuid(tenant_id),
                    MemberModel.status == status,
                )
            )
            return [self._to_member_dict(item) for item in result.scalars().all()]

    async def get_by_office(self, tenant_id: str, office: str) -> list[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(MemberModel).where(
                    MemberModel.tenant_id == self._maybe_uuid(tenant_id),
                    MemberModel.office == office,
                )
            )
            return [self._to_member_dict(item) for item in result.scalars().all()]

    async def link_user(self, tenant_id: str, member_id: str, user_id: str) -> Optional[dict]:
        return await self.update(tenant_id, member_id, {"user_id": user_id})

    async def delete(self, tenant_id: str, member_id: str) -> bool:
        async with self.session() as session:
            member = await self._first(
                session,
                select(MemberModel).where(
                    MemberModel.id == self._maybe_uuid(member_id),
                    MemberModel.tenant_id == self._maybe_uuid(tenant_id),
                ),
            )
            if not member:
                return False
            await session.delete(member)
            await session.commit()
            return True

    async def unlink_user_across_tenants(self, user_id: str) -> int:
        async with self.session() as session:
            result = await session.execute(select(MemberModel).where(MemberModel.user_id == self._maybe_uuid(user_id)))
            members = result.scalars().all()
            count = 0
            for member in members:
                member.user_id = None
                count += 1
            await session.commit()
            return count


member_repository = MemberRepository()
