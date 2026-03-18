import json
import logging
from datetime import date, datetime
from typing import List

from sqlalchemy import select

from src.infra.db.models import CouncilModel, MeetingModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository

logger = logging.getLogger(__name__)


class CouncilRepository(SQLAlchemyRepository):
    fields = ["id", "tenant_id", "name", "type", "description", "member_ids", "created_at", "updated_at"]

    def _to_council_dict(self, council: CouncilModel) -> dict:
        data = self._to_dict(council, self.fields)
        try:
            data["member_ids"] = json.loads(data.get("member_ids") or "[]")
        except json.JSONDecodeError:
            data["member_ids"] = []
        return data

    async def create_council(self, tenant_id: str, **kwargs) -> dict:
        data = kwargs.copy()
        if "council_type" in data:
            data["type"] = data.pop("council_type")
        member_ids = data.pop("member_ids", [])

        async with self.session() as session:
            council = CouncilModel(
                tenant_id=self._maybe_uuid(tenant_id),
                name=data["name"],
                type=data["type"],
                description=data.get("description"),
                member_ids=json.dumps(member_ids),
            )
            session.add(council)
            await session.commit()
            await session.refresh(council)
            return self._to_council_dict(council)

    async def get_all(self, tenant_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(CouncilModel)
                .where(CouncilModel.tenant_id == self._maybe_uuid(tenant_id))
                .order_by(CouncilModel.name.asc())
            )
            return [self._to_council_dict(item) for item in result.scalars().all()]

    async def delete(self, tenant_id: str, council_id: str) -> None:
        """Delete a council by ID."""
        async with self.session() as session:
            council = await self._first(
                session,
                select(CouncilModel).where(
                    CouncilModel.tenant_id == self._maybe_uuid(tenant_id),
                    CouncilModel.id == self._maybe_uuid(council_id),
                ),
            )
            if council:
                await session.delete(council)
                await session.commit()

    async def get_by_id(self, tenant_id: str, council_id: str) -> dict | None:
        """Get a council by ID."""
        async with self.session() as session:
            council = await self._first(
                session,
                select(CouncilModel).where(
                    CouncilModel.tenant_id == self._maybe_uuid(tenant_id),
                    CouncilModel.id == self._maybe_uuid(council_id),
                ),
            )
            return self._to_council_dict(council) if council else None

    async def get(self, council_id: str, tenant_id: str) -> dict | None:
        """Get a council by ID (alias for compatibility)."""
        return await self.get_by_id(tenant_id, council_id)

    async def update(self, council_id: str, data: dict, tenant_id: str) -> dict | None:
        """Update a council."""
        async with self.session() as session:
            council = await self._first(
                session,
                select(CouncilModel).where(
                    CouncilModel.tenant_id == self._maybe_uuid(tenant_id),
                    CouncilModel.id == self._maybe_uuid(council_id),
                ),
            )
            if not council:
                return None

            payload = data.copy()
            if "council_type" in payload:
                payload["type"] = payload.pop("council_type")
            if "member_ids" in payload:
                payload["member_ids"] = json.dumps(payload["member_ids"])

            for key, value in payload.items():
                if hasattr(council, key):
                    setattr(council, key, value)

            await session.commit()
            await session.refresh(council)
            return self._to_council_dict(council)

    async def add_member(self, tenant_id: str, council_id: str, member_id: str) -> dict | None:
        """Add a member to a council."""
        council_data = await self.get_by_id(tenant_id, council_id)
        if not council_data:
            return None
        member_ids = council_data.get("member_ids", [])
        if member_id not in member_ids:
            member_ids.append(member_id)
            return await self.update(council_id, {"member_ids": member_ids}, tenant_id)
        return council_data

    async def remove_member(self, tenant_id: str, council_id: str, member_id: str) -> dict | None:
        """Remove a member from a council."""
        council_data = await self.get_by_id(tenant_id, council_id)
        if not council_data:
            return None
        member_ids = council_data.get("member_ids", [])
        if member_id in member_ids:
            member_ids.remove(member_id)
            return await self.update(council_id, {"member_ids": member_ids}, tenant_id)
        return council_data


class MeetingRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "council_id",
        "date",
        "status",
        "agenda",
        "location",
        "meeting_type",
        "minutes",
        "attendees",
        "completed_at",
        "created_at",
        "updated_at",
    ]

    def _to_meeting_dict(self, meeting: MeetingModel) -> dict:
        data = self._to_dict(meeting, self.fields)
        try:
            data["attendees"] = json.loads(data.get("attendees") or "[]")
        except json.JSONDecodeError:
            data["attendees"] = []
        return data

    async def create_meeting(self, council_id: str, **kwargs) -> dict:
        data = kwargs.copy()
        if "scheduled_date" in data:
            val = data.pop("scheduled_date")
            if isinstance(val, date) and not isinstance(val, datetime):
                data["date"] = datetime.combine(val, datetime.min.time())
            else:
                data["date"] = val

        if "title" in data:
            if "agenda" not in data:
                data["agenda"] = data.pop("title")

        async with self.session() as session:
            council = await self._first(
                session,
                select(CouncilModel).where(CouncilModel.id == self._maybe_uuid(council_id)),
            )
            if not council:
                raise ValueError("Council not found")

            meeting = MeetingModel(
                tenant_id=council.tenant_id,
                council_id=council.id,
                date=data["date"],
                status=data.get("status", "SCHEDULED"),
                agenda=data.get("agenda"),
                location=data.get("location"),
                meeting_type=data.get("meeting_type", "ORDINARY"),
                minutes=data.get("minutes"),
                attendees=json.dumps(data.get("attendees", [])),
            )
            session.add(meeting)
            await session.commit()
            await session.refresh(meeting)
            return self._to_meeting_dict(meeting)

    async def get_by_council(self, council_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(MeetingModel)
                .where(MeetingModel.council_id == self._maybe_uuid(council_id))
                .order_by(MeetingModel.date.desc(), MeetingModel.created_at.desc())
            )
            return [self._to_meeting_dict(item) for item in result.scalars().all()]

    async def get_by_id(self, meeting_id: str) -> dict | None:
        async with self.session() as session:
            meeting = await self._first(
                session,
                select(MeetingModel).where(MeetingModel.id == self._maybe_uuid(meeting_id)),
            )
            return self._to_meeting_dict(meeting) if meeting else None

    async def update_meeting(self, meeting_id: str, data: dict) -> dict | None:
        async with self.session() as session:
            meeting = await self._first(
                session,
                select(MeetingModel).where(MeetingModel.id == self._maybe_uuid(meeting_id)),
            )
            if not meeting:
                return None

            payload = data.copy()
            if "attendees" in payload:
                payload["attendees"] = json.dumps(payload["attendees"])
            if "scheduled_date" in payload:
                payload["date"] = payload.pop("scheduled_date")

            for key, value in payload.items():
                if hasattr(meeting, key):
                    setattr(meeting, key, value)

            await session.commit()
            await session.refresh(meeting)
            return self._to_meeting_dict(meeting)

    async def complete_meeting(self, meeting_id: str) -> dict | None:
        return await self.update_meeting(
            meeting_id,
            {
                "status": "COMPLETED",
                "completed_at": datetime.utcnow(),
            },
        )


council_repository = CouncilRepository()
meeting_repository = MeetingRepository()
