"""
Repository for Tithe/Offering records.
"""

from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import select

from src.infra.db.models import TitheRecordModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class TitheRecordRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "member_id",
        "amount",
        "type",
        "date",
        "status",
        "notes",
        "attachment_url",
        "rejection_reason",
        "approved_by",
        "approved_at",
        "transaction_id",
        "created_at",
        "updated_at",
    ]

    @staticmethod
    def _normalize_date(value) -> date:
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            return date.fromisoformat(value)
        raise ValueError("Invalid tithe date")

    async def create(self, tenant_id: str, member_id: str, **kwargs) -> dict:
        """Create a new tithe record."""
        async with self.session() as session:
            record = TitheRecordModel(
                tenant_id=self._maybe_uuid(tenant_id),
                member_id=str(member_id),
                amount=float(kwargs.get("amount", 0)),
                type=kwargs.get("type", "DIZIMO"),
                date=self._normalize_date(kwargs.get("date")),
                status="PENDING",
                notes=kwargs.get("notes"),
                attachment_url=kwargs.get("attachment_url"),
            )
            session.add(record)
            await session.commit()
            await session.refresh(record)
            return self._to_dict(record, self.fields)

    async def get_by_id(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Get a tithe record by ID."""
        async with self.session() as session:
            record = await self._first(
                session,
                select(TitheRecordModel).where(
                    TitheRecordModel.tenant_id == self._maybe_uuid(tenant_id),
                    TitheRecordModel.id == self._maybe_uuid(record_id),
                ),
            )
            return self._to_dict(record, self.fields) if record else None

    async def get(self, tenant_id: str, record_id: str) -> Optional[dict]:
        return await self.get_by_id(tenant_id, record_id)

    async def get_by_member(self, tenant_id: str, member_id: str, year: Optional[int] = None) -> List[dict]:
        """Get all tithe records for a member, optionally filtered by year."""
        async with self.session() as session:
            result = await session.execute(
                select(TitheRecordModel).where(
                    TitheRecordModel.tenant_id == self._maybe_uuid(tenant_id),
                    TitheRecordModel.member_id == str(member_id),
                )
            )
            records = [self._to_dict(item, self.fields) for item in result.scalars().all()]

        if year is not None:
            records = [record for record in records if date.fromisoformat(record["date"]).year == year]

        return sorted(records, key=lambda x: x.get("date", ""), reverse=True)

    async def get_pending(self, tenant_id: str) -> List[dict]:
        """Get all pending tithe records for approval."""
        async with self.session() as session:
            result = await session.execute(
                select(TitheRecordModel).where(
                    TitheRecordModel.tenant_id == self._maybe_uuid(tenant_id),
                    TitheRecordModel.status == "PENDING",
                )
            )
            records = [self._to_dict(item, self.fields) for item in result.scalars().all()]
        return sorted(records, key=lambda x: x.get("created_at", ""), reverse=True)

    async def get_all(self, tenant_id: str, year: Optional[int] = None) -> List[dict]:
        """Get all tithe records, optionally filtered by year."""
        async with self.session() as session:
            result = await session.execute(
                select(TitheRecordModel).where(TitheRecordModel.tenant_id == self._maybe_uuid(tenant_id))
            )
            records = [self._to_dict(item, self.fields) for item in result.scalars().all()]

        if year is not None:
            records = [record for record in records if date.fromisoformat(record["date"]).year == year]

        return sorted(records, key=lambda x: x.get("date", ""), reverse=True)

    async def update(self, tenant_id: str, record_id: str, data: dict) -> Optional[dict]:
        """Update a tithe record."""
        async with self.session() as session:
            record = await self._first(
                session,
                select(TitheRecordModel).where(
                    TitheRecordModel.tenant_id == self._maybe_uuid(tenant_id),
                    TitheRecordModel.id == self._maybe_uuid(record_id),
                ),
            )
            if not record:
                return None

            payload = data.copy()
            if "date" in payload and payload["date"] is not None:
                payload["date"] = self._normalize_date(payload["date"])

            for key, value in payload.items():
                if hasattr(record, key):
                    setattr(record, key, value)

            await session.commit()
            await session.refresh(record)
            return self._to_dict(record, self.fields)

    async def approve(
        self, tenant_id: str, record_id: str, approved_by: str, transaction_id: Optional[str] = None
    ) -> Optional[dict]:
        """Approve a tithe record."""
        return await self.update(
            tenant_id,
            record_id,
            {
                "status": "APPROVED",
                "approved_by": approved_by,
                "approved_at": datetime.utcnow(),
                "transaction_id": transaction_id,
            },
        )

    async def reject(
        self, tenant_id: str, record_id: str, rejected_by: str, reason: Optional[str] = None
    ) -> Optional[dict]:
        """Reject a tithe record."""
        return await self.update(
            tenant_id,
            record_id,
            {
                "status": "REJECTED",
                "approved_by": rejected_by,
                "approved_at": datetime.utcnow(),
                "rejection_reason": reason,
            },
        )

    async def delete(self, tenant_id: str, record_id: str) -> bool:
        """Delete a tithe record (only if pending)."""
        async with self.session() as session:
            record = await self._first(
                session,
                select(TitheRecordModel).where(
                    TitheRecordModel.tenant_id == self._maybe_uuid(tenant_id),
                    TitheRecordModel.id == self._maybe_uuid(record_id),
                ),
            )
            if not record or record.status != "PENDING":
                return False

            await session.delete(record)
            await session.commit()
            return True

    async def get_summary(self, tenant_id: str, member_id: str, year: int) -> dict:
        """Get summary of tithes for a member in a year."""
        records = await self.get_by_member(tenant_id, member_id, year)

        approved = [r for r in records if r.get("status") == "APPROVED"]
        pending = [r for r in records if r.get("status") == "PENDING"]

        dizimos = [r for r in approved if r.get("type") == "DIZIMO"]
        ofertas = [r for r in approved if r.get("type") == "OFERTA"]

        total_dizimo = sum(r.get("amount", 0) for r in dizimos)
        total_oferta = sum(r.get("amount", 0) for r in ofertas)

        return {
            "total_dizimo": total_dizimo,
            "total_oferta": total_oferta,
            "total": total_dizimo + total_oferta,
            "count_dizimo": len(dizimos),
            "count_oferta": len(ofertas),
            "count_pending": len(pending),
            "year": year,
        }


tithe_record_repository = TitheRecordRepository()
