"""
Repository for Expense Request records.
"""

import uuid
from datetime import datetime
from typing import List, Optional

from src.infra.firebase import get_db


class ExpenseRequestRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("expense_requests")

    async def create(self, tenant_id: str, member_id: str, **kwargs) -> dict:
        """Create a new expense request."""
        collection = self._get_collection(tenant_id)
        doc_id = str(uuid.uuid4())

        expense_date = kwargs.get("expense_date")
        if hasattr(expense_date, "isoformat"):
            expense_date = expense_date.isoformat()

        data = {
            "id": doc_id,
            "tenant_id": str(tenant_id),
            "member_id": member_id,
            "amount": float(kwargs.get("amount", 0)),
            "category": kwargs.get("category"),
            "description": kwargs.get("description"),
            "expense_date": expense_date,
            "receipt_url": kwargs.get("receipt_url"),
            "notes": kwargs.get("notes"),
            "status": "PENDING",
            "created_at": datetime.utcnow(),
            "approved_by": None,
            "approved_at": None,
            "rejection_reason": None,
            "transaction_id": None,
        }

        collection.document(doc_id).set(data)
        return self._serialize(data)

    async def get(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Get a single expense request by ID."""
        doc = self._get_collection(tenant_id).document(record_id).get()
        if doc.exists:
            return self._serialize(doc.to_dict())
        return None

    async def get_all(self, tenant_id: str, year: Optional[int] = None) -> List[dict]:
        """Get all expense requests for a tenant, optionally filtered by year."""
        docs = [doc.to_dict() for doc in self._get_collection(str(tenant_id)).stream()]

        if year:
            records = [
                r
                for r in docs
                if r.get("expense_date")
                and (
                    r["expense_date"].year == year
                    if isinstance(r["expense_date"], datetime)
                    else datetime.fromisoformat(str(r["expense_date"])).year == year
                )
            ]
        else:
            records = docs

        return [self._serialize(r) for r in records]

    async def get_pending(self, tenant_id: str) -> List[dict]:
        """Get all pending expense requests."""
        docs = self._get_collection(str(tenant_id)).where("status", "==", "PENDING").stream()
        return [self._serialize(doc.to_dict()) for doc in docs]

    async def get_by_member(self, tenant_id: str, member_id: str) -> List[dict]:
        """Get all expense requests for a specific member."""
        docs = self._get_collection(str(tenant_id)).where("member_id", "==", member_id).stream()
        return [self._serialize(doc.to_dict()) for doc in docs]

    async def update(self, tenant_id: str, record_id: str, data: dict) -> Optional[dict]:
        """Update an expense request."""
        doc_ref = self._get_collection(tenant_id).document(record_id)
        doc_ref.update(data)
        return self._serialize(doc_ref.get().to_dict())

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
        doc_ref = self._get_collection(tenant_id).document(record_id)
        doc = doc_ref.get()
        if doc.exists and doc.to_dict().get("status") == "PENDING":
            doc_ref.delete()
            return True
        return False

    def _serialize(self, data: dict) -> dict:
        """Serialize datetime fields to ISO format strings."""
        result = data.copy()
        for field in ["created_at", "approved_at", "expense_date"]:
            if field in result and result[field]:
                if hasattr(result[field], "isoformat"):
                    result[field] = result[field].isoformat()
        return result


expense_request_repository = ExpenseRequestRepository()
