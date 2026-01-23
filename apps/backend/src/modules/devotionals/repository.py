import logging
import uuid
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from src.infra.firebase import get_db
from src.modules.devotionals.schemas import DevotionalCreate, DevotionalUpdate

logger = logging.getLogger(__name__)


class DevotionalRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("devotionals")

    async def create(self, tenant_id: UUID, data: DevotionalCreate) -> dict:
        collection = self._get_collection(str(tenant_id))
        doc_id = str(uuid.uuid4())

        devotional_data = data.model_dump()
        # Convert date to string for Firestore
        devotional_data["date"] = data.date.isoformat()
        devotional_data.update({
            "id": doc_id,
            "tenant_id": str(tenant_id),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })

        collection.document(doc_id).set(devotional_data)
        return devotional_data

    async def get_by_tenant(self, tenant_id: UUID, limit: int = 30) -> List[dict]:
        collection = self._get_collection(str(tenant_id))
        docs = collection.order_by("date", direction="DESCENDING").limit(limit).stream()
        return [doc.to_dict() for doc in docs]

    async def get_by_id(self, tenant_id: UUID, devotional_id: str) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        doc = collection.document(devotional_id).get()
        return doc.to_dict() if doc.exists else None

    async def get_by_date(self, tenant_id: UUID, target_date: date) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        docs = collection.where("date", "==", target_date.isoformat()).limit(1).stream()
        results = [doc.to_dict() for doc in docs]
        return results[0] if results else None

    async def get_today(self, tenant_id: UUID) -> Optional[dict]:
        return await self.get_by_date(tenant_id, date.today())

    async def update(self, tenant_id: UUID, devotional_id: str, data: DevotionalUpdate) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        doc_ref = collection.document(devotional_id)

        if not doc_ref.get().exists:
            return None

        update_data = data.model_dump(exclude_unset=True)
        if "date" in update_data and update_data["date"]:
            update_data["date"] = update_data["date"].isoformat()
        update_data["updated_at"] = datetime.utcnow()

        doc_ref.update(update_data)
        return doc_ref.get().to_dict()

    async def delete(self, tenant_id: UUID, devotional_id: str) -> bool:
        collection = self._get_collection(str(tenant_id))
        doc_ref = collection.document(devotional_id)

        if not doc_ref.get().exists:
            return False

        doc_ref.delete()
        return True


devotional_repository = DevotionalRepository()
