import logging
import uuid
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from src.infra.firebase import get_db
from src.modules.prayer.schemas import PrayerRequestCreate, PrayerRequestUpdate

logger = logging.getLogger(__name__)


class PrayerRequestRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("prayer_requests")

    async def create(self, tenant_id: UUID, member_id: str, author_name: str, data: PrayerRequestCreate) -> dict:
        collection = self._get_collection(str(tenant_id))
        doc_id = str(uuid.uuid4())

        request_data = data.model_dump()
        request_data.update({
            "id": doc_id,
            "tenant_id": str(tenant_id),
            "member_id": member_id,
            "author_name": "Anônimo" if data.is_anonymous else author_name,
            "prayer_count": 0,
            "prayed_by": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })

        collection.document(doc_id).set(request_data)
        return request_data

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        collection = self._get_collection(str(tenant_id))
        docs = collection.order_by("created_at", direction="DESCENDING").limit(50).stream()
        return [doc.to_dict() for doc in docs]

    async def get_by_id(self, tenant_id: UUID, request_id: str) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        doc = collection.document(request_id).get()
        return doc.to_dict() if doc.exists else None

    async def increment_prayer_count(self, tenant_id: UUID, request_id: str, user_id: str) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        doc_ref = collection.document(request_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        prayed_by = data.get("prayed_by", [])
        
        if user_id in prayed_by:
            return data  # Already prayed
        
        prayed_by.append(user_id)
        doc_ref.update({
            "prayer_count": len(prayed_by),
            "prayed_by": prayed_by,
            "updated_at": datetime.utcnow()
        })
        
        return doc_ref.get().to_dict()

    async def delete(self, tenant_id: UUID, request_id: str) -> bool:
        collection = self._get_collection(str(tenant_id))
        doc_ref = collection.document(request_id)
        
        if not doc_ref.get().exists:
            return False
        
        doc_ref.delete()
        return True


prayer_request_repository = PrayerRequestRepository()
