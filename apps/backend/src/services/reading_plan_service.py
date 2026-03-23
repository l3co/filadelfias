from __future__ import annotations

from typing import Any
from uuid import UUID

from src.infra.repositories.reading_plan_repository import ReadingPlanRepository


class ReadingPlanService:
    def __init__(self):
        self.repository = ReadingPlanRepository()

    async def create_plan(
        self,
        tenant_id: UUID,
        creator_id: UUID,
        name: str,
        description: str | None,
        duration_days: int,
        readings: list[dict[str, Any]],
        is_public: bool = True,
    ) -> dict[str, Any]:
        return await self.repository.create_plan(
            tenant_id=tenant_id,
            creator_id=creator_id,
            name=name,
            description=description,
            duration_days=duration_days,
            readings=readings,
            is_public=is_public,
        )

    async def get_public_plans(self, tenant_id: UUID) -> list[dict[str, Any]]:
        return await self.repository.get_public_plans(tenant_id)

    async def get_plan_by_id(self, plan_id: UUID) -> dict[str, Any] | None:
        return await self.repository.get_plan_by_id(plan_id)

    async def start_plan(self, user_id: UUID, plan_id: UUID) -> dict[str, Any] | None:
        return await self.repository.start_plan(user_id, plan_id)

    async def update_progress(self, user_id: UUID, plan_id: UUID, completed_day: int) -> dict[str, Any] | None:
        return await self.repository.update_progress(user_id, plan_id, completed_day)

    async def get_user_progress(self, user_id: UUID, plan_id: UUID) -> dict[str, Any] | None:
        return await self.repository.get_user_progress(user_id, plan_id)
