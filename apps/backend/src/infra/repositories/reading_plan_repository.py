"""
Repository for bible reading plans and user progress.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import and_, select

from src.infra.db.models import ReadingPlanModel, UserReadingProgressModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class ReadingPlanRepository(SQLAlchemyRepository):
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
        async with self.session() as session:
            plan = ReadingPlanModel(
                tenant_id=tenant_id,
                creator_id=creator_id,
                name=name,
                description=description,
                duration_days=duration_days,
                readings=readings,
                is_public=is_public,
            )
            session.add(plan)
            await session.commit()
            await session.refresh(plan)
            return self._serialize_plan(plan)

    async def get_public_plans(self, tenant_id: UUID) -> list[dict[str, Any]]:
        async with self.session() as session:
            statement = (
                select(ReadingPlanModel)
                .where(
                    and_(
                        ReadingPlanModel.tenant_id == tenant_id,
                        ReadingPlanModel.is_public.is_(True),
                    )
                )
                .order_by(ReadingPlanModel.created_at.desc())
            )
            result = await session.execute(statement)
            plans = result.scalars().all()
            return [self._serialize_plan(plan) for plan in plans]

    async def get_plan_by_id(self, plan_id: UUID) -> dict[str, Any] | None:
        async with self.session() as session:
            plan = await session.get(ReadingPlanModel, plan_id)
            if not plan:
                return None
            return self._serialize_plan(plan)

    async def start_plan(self, user_id: UUID, plan_id: UUID) -> dict[str, Any] | None:
        async with self.session() as session:
            plan = await session.get(ReadingPlanModel, plan_id)
            if not plan:
                return None

            statement = select(UserReadingProgressModel).where(
                and_(
                    UserReadingProgressModel.user_id == user_id,
                    UserReadingProgressModel.plan_id == plan_id,
                )
            )
            result = await session.execute(statement)
            progress = result.scalars().first()

            if not progress:
                progress = UserReadingProgressModel(
                    user_id=user_id,
                    plan_id=plan_id,
                    current_day=1,
                    completed_readings=[],
                )
                session.add(progress)
                await session.commit()
                await session.refresh(progress)

            return self._serialize_progress(progress)

    async def update_progress(self, user_id: UUID, plan_id: UUID, completed_day: int) -> dict[str, Any] | None:
        async with self.session() as session:
            statement = select(UserReadingProgressModel).where(
                and_(
                    UserReadingProgressModel.user_id == user_id,
                    UserReadingProgressModel.plan_id == plan_id,
                )
            )
            result = await session.execute(statement)
            progress = result.scalars().first()

            if not progress:
                return None

            plan = await session.get(ReadingPlanModel, plan_id)
            if not plan:
                return None

            if completed_day > plan.duration_days:
                raise ValueError(f"Day must be between 1 and {plan.duration_days} for this reading plan")

            completed = sorted(set(progress.completed_readings or []) | {completed_day})
            progress.completed_readings = completed

            if completed and len(completed) >= plan.duration_days:
                progress.current_day = plan.duration_days
                if not progress.completed_at:
                    from datetime import datetime, timezone

                    progress.completed_at = datetime.now(timezone.utc)
            else:
                progress.current_day = max(completed) + 1 if completed else 1

            await session.commit()
            await session.refresh(progress)
            return self._serialize_progress(progress)

    async def get_user_progress(self, user_id: UUID, plan_id: UUID) -> dict[str, Any] | None:
        async with self.session() as session:
            statement = select(UserReadingProgressModel).where(
                and_(
                    UserReadingProgressModel.user_id == user_id,
                    UserReadingProgressModel.plan_id == plan_id,
                )
            )
            result = await session.execute(statement)
            progress = result.scalars().first()
            if not progress:
                return None
            return self._serialize_progress(progress)

    @staticmethod
    def _serialize_plan(plan: ReadingPlanModel) -> dict[str, Any]:
        return {
            "id": str(plan.id),
            "name": plan.name,
            "description": plan.description,
            "duration_days": plan.duration_days,
            "readings": plan.readings or [],
            "is_public": plan.is_public,
            "created_at": plan.created_at.isoformat(),
        }

    @staticmethod
    def _serialize_progress(progress: UserReadingProgressModel) -> dict[str, Any]:
        return {
            "id": str(progress.id),
            "plan_id": str(progress.plan_id),
            "current_day": progress.current_day,
            "completed_readings": progress.completed_readings or [],
            "started_at": progress.started_at.isoformat(),
            "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
        }
