"""
Helpers for repositories backed by SQLAlchemy async sessions.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import date, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infra.db.session import async_session_factory


class SQLAlchemyRepository:
    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        async with async_session_factory() as session:
            yield session

    @staticmethod
    def _maybe_uuid(value: Any) -> Any:
        if isinstance(value, str):
            try:
                return UUID(value)
            except ValueError:
                return value
        return value

    @staticmethod
    def _serialize_value(value: Any) -> Any:
        if isinstance(value, list):
            return [SQLAlchemyRepository._serialize_value(item) for item in value]
        if isinstance(value, UUID):
            return str(value)
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, date):
            return value.isoformat()
        return value

    @classmethod
    def _to_dict(cls, obj: Any, fields: list[str]) -> dict[str, Any]:
        return {field: cls._serialize_value(getattr(obj, field)) for field in fields}

    @staticmethod
    async def _first(session: AsyncSession, statement: Select) -> Any | None:
        result = await session.execute(statement)
        return result.scalars().first()
