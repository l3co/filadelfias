"""
User repository backed by PostgreSQL.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select

from src.infra.db.models import UserModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository
from src.infra.security import get_password_hash


class UserRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "email",
        "name",
        "avatar_url",
        "is_active",
        "must_change_password",
        "password_hash",
        "password_reset_token",
        "password_reset_expires",
        "created_at",
        "updated_at",
    ]

    async def get_by_email(self, email: str) -> Optional[dict]:
        async with self.session() as session:
            user = await self._first(session, select(UserModel).where(UserModel.email == email))
            return self._to_dict(user, self.fields) if user else None

    async def get_by_id(self, user_id: str) -> Optional[dict]:
        async with self.session() as session:
            user = await session.get(UserModel, self._maybe_uuid(user_id))
            return self._to_dict(user, self.fields) if user else None

    async def exists_by_email(self, email: str) -> bool:
        return await self.get_by_email(email) is not None

    async def get_by_reset_token(self, token: str) -> Optional[dict]:
        async with self.session() as session:
            user = await self._first(session, select(UserModel).where(UserModel.password_reset_token == token))
            if user and user.password_reset_expires and user.password_reset_expires > datetime.now(timezone.utc):
                return self._to_dict(user, self.fields)
            return None

    async def create_user(self, email: str, name: str, password: str, avatar_url: Optional[str] = None) -> dict:
        async with self.session() as session:
            user = UserModel(
                email=email,
                name=name,
                password_hash=get_password_hash(password),
                avatar_url=avatar_url,
                is_active=True,
                must_change_password=False,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return self._to_dict(user, self.fields)

    async def set_password_reset_token(self, user_id: str, token: str, expires: datetime) -> Optional[dict]:
        async with self.session() as session:
            user = await session.get(UserModel, self._maybe_uuid(user_id))
            if not user:
                return None
            user.password_reset_token = token
            user.password_reset_expires = expires
            await session.commit()
            await session.refresh(user)
            return self._to_dict(user, self.fields)

    async def clear_password_reset_token(self, user_id: str) -> Optional[dict]:
        async with self.session() as session:
            user = await session.get(UserModel, self._maybe_uuid(user_id))
            if not user:
                return None
            user.password_reset_token = None
            user.password_reset_expires = None
            await session.commit()
            await session.refresh(user)
            return self._to_dict(user, self.fields)

    async def update_password(self, user_id: str, password_hash: str) -> Optional[dict]:
        async with self.session() as session:
            user = await session.get(UserModel, self._maybe_uuid(user_id))
            if not user:
                return None
            user.password_hash = password_hash
            user.must_change_password = False
            user.password_reset_token = None
            user.password_reset_expires = None
            await session.commit()
            await session.refresh(user)
            return self._to_dict(user, self.fields)

    async def delete(self, user_id: str) -> bool:
        async with self.session() as session:
            user = await session.get(UserModel, self._maybe_uuid(user_id))
            if not user:
                return False
            await session.delete(user)
            await session.commit()
            return True


user_repository = UserRepository()
