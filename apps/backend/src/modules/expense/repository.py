"""
Repository for Expense Request records.
"""

from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import select

from src.infra.db.models import ExpenseRequestModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class ExpenseRequestRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "member_id",
        "amount",
        "category",
        "description",
        "expense_date",
        "receipt_url",
        "notes",
        "status",
        "created_at",
        "approved_by",
        "approved_at",
        "rejection_reason",
        "transaction_id",
    ]

    @staticmethod
    def _normalize_expense_date(value) -> date:
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            return date.fromisoformat(value)
        raise ValueError("Invalid expense_date")

    async def create(self, tenant_id: str, member_id: str, **kwargs) -> dict:
        """Create a new expense request."""
        async with self.session() as session:
            record = ExpenseRequestModel(
                tenant_id=self._maybe_uuid(tenant_id),
                member_id=member_id,
                amount=float(kwargs.get("amount", 0)),
                category=kwargs.get("category"),
                description=kwargs.get("description"),
                expense_date=self._normalize_expense_date(kwargs.get("expense_date")),
                receipt_url=kwargs.get("receipt_url"),
                notes=kwargs.get("notes"),
                status="PENDING",
            )
            session.add(record)
            await session.commit()
            await session.refresh(record)
            return self._serialize(self._to_dict(record, self.fields))

    async def get(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Get a single expense request by ID."""
        async with self.session() as session:
            record = await self._first(
                session,
                select(ExpenseRequestModel).where(
                    ExpenseRequestModel.tenant_id == self._maybe_uuid(tenant_id),
                    ExpenseRequestModel.id == self._maybe_uuid(record_id),
                ),
            )
            return self._serialize(self._to_dict(record, self.fields)) if record else None

    async def get_all(self, tenant_id: str, year: Optional[int] = None) -> List[dict]:
        """Get all expense requests for a tenant, optionally filtered by year."""
        async with self.session() as session:
            statement = select(ExpenseRequestModel).where(ExpenseRequestModel.tenant_id == self._maybe_uuid(tenant_id))
            result = await session.execute(statement.order_by(ExpenseRequestModel.expense_date.desc()))
            records = [self._to_dict(item, self.fields) for item in result.scalars().all()]

        if year is not None:
            records = [record for record in records if date.fromisoformat(record["expense_date"]).year == year]

        return [self._serialize(record) for record in records]

    async def get_pending(self, tenant_id: str) -> List[dict]:
        """Get all pending expense requests."""
        async with self.session() as session:
            result = await session.execute(
                select(ExpenseRequestModel).where(
                    ExpenseRequestModel.tenant_id == self._maybe_uuid(tenant_id),
                    ExpenseRequestModel.status == "PENDING",
                )
            )
            return [self._serialize(self._to_dict(item, self.fields)) for item in result.scalars().all()]

    async def get_by_member(self, tenant_id: str, member_id: str) -> List[dict]:
        """Get all expense requests for a specific member."""
        async with self.session() as session:
            result = await session.execute(
                select(ExpenseRequestModel).where(
                    ExpenseRequestModel.tenant_id == self._maybe_uuid(tenant_id),
                    ExpenseRequestModel.member_id == member_id,
                )
            )
            return [self._serialize(self._to_dict(item, self.fields)) for item in result.scalars().all()]

    async def update(self, tenant_id: str, record_id: str, data: dict) -> Optional[dict]:
        """Update an expense request."""
        async with self.session() as session:
            record = await self._first(
                session,
                select(ExpenseRequestModel).where(
                    ExpenseRequestModel.tenant_id == self._maybe_uuid(tenant_id),
                    ExpenseRequestModel.id == self._maybe_uuid(record_id),
                ),
            )
            if not record:
                return None

            for key, value in data.items():
                if key == "expense_date" and value is not None:
                    value = self._normalize_expense_date(value)
                if hasattr(record, key):
                    setattr(record, key, value)

            await session.commit()
            await session.refresh(record)
            return self._serialize(self._to_dict(record, self.fields))

    async def approve(
        self, tenant_id: str, record_id: str, approved_by: str, transaction_id: Optional[str] = None
    ) -> Optional[dict]:
        """Approve an expense request."""
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
        """Reject an expense request."""
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
        """Delete an expense request (only if pending)."""
        async with self.session() as session:
            record = await self._first(
                session,
                select(ExpenseRequestModel).where(
                    ExpenseRequestModel.tenant_id == self._maybe_uuid(tenant_id),
                    ExpenseRequestModel.id == self._maybe_uuid(record_id),
                ),
            )
            if not record or record.status != "PENDING":
                return False

            await session.delete(record)
            await session.commit()
            return True

    def _serialize(self, data: dict) -> dict:
        """Serialize datetime fields to ISO format strings."""
        result = data.copy()
        for field in ["created_at", "approved_at", "expense_date"]:
            if field in result and result[field]:
                if hasattr(result[field], "isoformat"):
                    result[field] = result[field].isoformat()
        return result


expense_request_repository = ExpenseRequestRepository()
