"""
Repository for Tithe/Offering records.
"""

import uuid
from datetime import date, datetime
from typing import List, Optional

from src.infra.firebase import get_db


class TitheRecordRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("tithe_records")

    async def create(self, tenant_id: str, member_id: str, **kwargs) -> dict:
        """Create a new tithe record."""
        collection = self._get_collection(tenant_id)
        doc_id = str(uuid.uuid4())

        tithe_date = kwargs.get("date")
        if isinstance(tithe_date, date) and not isinstance(tithe_date, datetime):
            tithe_date = datetime.combine(tithe_date, datetime.min.time())

        data = {
            "id": doc_id,
            "tenant_id": str(tenant_id),
            "member_id": str(member_id),
            "amount": float(kwargs.get("amount", 0)),
            "type": kwargs.get("type", "DIZIMO"),
            "date": tithe_date,
            "status": "PENDING",
            "notes": kwargs.get("notes"),
            "attachment_url": kwargs.get("attachment_url"),
            "rejection_reason": None,
            "approved_by": None,
            "approved_at": None,
            "transaction_id": None,
            "created_at": datetime.utcnow(),
            "updated_at": None,
        }

        collection.document(doc_id).set(data)
        return data

    async def get_by_id(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Get a tithe record by ID."""
        doc = self._get_collection(tenant_id).document(str(record_id)).get()
        return doc.to_dict() if doc.exists else None

    async def get_by_member(self, tenant_id: str, member_id: str, year: Optional[int] = None) -> List[dict]:
        """Get all tithe records for a member, optionally filtered by year."""
        query = self._get_collection(tenant_id).where("member_id", "==", str(member_id))

        records = [doc.to_dict() for doc in query.stream()]

        if year:
            records = [
                r
                for r in records
                if r.get("date")
                and (
                    r["date"].year == year
                    if isinstance(r["date"], datetime)
                    else datetime.fromisoformat(str(r["date"])).year == year
                )
            ]

        return sorted(records, key=lambda x: x.get("date", datetime.min), reverse=True)

    async def get_pending(self, tenant_id: str) -> List[dict]:
        """Get all pending tithe records for approval."""
        query = self._get_collection(tenant_id).where("status", "==", "PENDING")
        records = [doc.to_dict() for doc in query.stream()]
        return sorted(records, key=lambda x: x.get("created_at", datetime.min), reverse=True)

    async def get_all(self, tenant_id: str, year: Optional[int] = None) -> List[dict]:
        """Get all tithe records, optionally filtered by year."""
        records = [doc.to_dict() for doc in self._get_collection(tenant_id).stream()]

        if year:
            records = [
                r
                for r in records
                if r.get("date")
                and (
                    r["date"].year == year
                    if isinstance(r["date"], datetime)
                    else datetime.fromisoformat(str(r["date"])).year == year
                )
            ]

        return sorted(records, key=lambda x: x.get("date", datetime.min), reverse=True)

    async def update(self, tenant_id: str, record_id: str, data: dict) -> Optional[dict]:
        """Update a tithe record."""
        doc_ref = self._get_collection(tenant_id).document(str(record_id))
        doc = doc_ref.get()

        if not doc.exists:
            return None

        data["updated_at"] = datetime.utcnow()
        doc_ref.update(data)

        return doc_ref.get().to_dict()

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
        doc_ref = self._get_collection(tenant_id).document(str(record_id))
        doc = doc_ref.get()

        if not doc.exists:
            return False

        data = doc.to_dict()
        if data.get("status") != "PENDING":
            return False

        doc_ref.delete()
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
