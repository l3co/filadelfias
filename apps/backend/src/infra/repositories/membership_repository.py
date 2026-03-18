"""
Membership repository backed by PostgreSQL.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select

from src.infra.db.models import MembershipModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class MembershipRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "user_id",
        "tenant_id",
        "role",
        "status",
        "joined_at",
        "invited_by",
        "created_at",
        "updated_at",
    ]

    async def get(self, membership_id: str) -> Optional[dict]:
        async with self.session() as session:
            membership = await session.get(MembershipModel, self._maybe_uuid(membership_id))
            return self._to_dict(membership, self.fields) if membership else None

    async def get_by_user_and_tenant(self, user_id: str, tenant_id: str) -> Optional[dict]:
        async with self.session() as session:
            membership = await self._first(
                session,
                select(MembershipModel).where(
                    MembershipModel.user_id == self._maybe_uuid(user_id),
                    MembershipModel.tenant_id == self._maybe_uuid(tenant_id),
                ),
            )
            return self._to_dict(membership, self.fields) if membership else None

    async def get_user_memberships(self, user_id: str) -> list[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(MembershipModel).where(MembershipModel.user_id == self._maybe_uuid(user_id))
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def get_tenant_memberships(self, tenant_id: str) -> list[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(MembershipModel).where(MembershipModel.tenant_id == self._maybe_uuid(tenant_id))
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def create_membership(
        self,
        user_id: str,
        tenant_id: str,
        role: str = "ATTENDEE",
        status: str = "ACTIVE",
        invited_by: Optional[str] = None,
    ) -> dict:
        async with self.session() as session:
            membership = MembershipModel(
                user_id=self._maybe_uuid(user_id),
                tenant_id=self._maybe_uuid(tenant_id),
                role=role,
                status=status,
                invited_by=invited_by,
                joined_at=datetime.now(timezone.utc),
            )
            session.add(membership)
            await session.commit()
            await session.refresh(membership)
            return self._to_dict(membership, self.fields)

    async def update_role(self, membership_id: str, role: str) -> Optional[dict]:
        async with self.session() as session:
            membership = await session.get(MembershipModel, self._maybe_uuid(membership_id))
            if not membership:
                return None
            membership.role = role
            await session.commit()
            await session.refresh(membership)
            return self._to_dict(membership, self.fields)

    async def update_status(self, membership_id: str, status: str) -> Optional[dict]:
        async with self.session() as session:
            membership = await session.get(MembershipModel, self._maybe_uuid(membership_id))
            if not membership:
                return None
            membership.status = status
            await session.commit()
            await session.refresh(membership)
            return self._to_dict(membership, self.fields)

    async def delete_by_user_and_tenant(self, user_id: str, tenant_id: str) -> bool:
        async with self.session() as session:
            membership = await self._first(
                session,
                select(MembershipModel).where(
                    MembershipModel.user_id == self._maybe_uuid(user_id),
                    MembershipModel.tenant_id == self._maybe_uuid(tenant_id),
                ),
            )
            if not membership:
                return False
            await session.delete(membership)
            await session.commit()
            return True

    async def delete(self, membership_id: str) -> bool:
        async with self.session() as session:
            membership = await session.get(MembershipModel, self._maybe_uuid(membership_id))
            if not membership:
                return False
            await session.delete(membership)
            await session.commit()
            return True


membership_repository = MembershipRepository()
