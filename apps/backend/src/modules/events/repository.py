import logging
import uuid
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from src.infra.firebase import get_db
from src.modules.events.schemas import EventCreate, EventUpdate

logger = logging.getLogger(__name__)


class EventRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("events")

    async def create(self, tenant_id: UUID, data: EventCreate) -> dict:
        collection = self._get_collection(str(tenant_id))
        doc_id = str(uuid.uuid4())

        event_data = data.model_dump()
        event_data.update({
            "id": doc_id,
            "tenant_id": str(tenant_id),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })

        collection.document(doc_id).set(event_data)
        return event_data

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        collection = self._get_collection(str(tenant_id))
        return [doc.to_dict() for doc in collection.stream()]

    async def get_by_id(self, tenant_id: UUID, event_id: str) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        doc = collection.document(event_id).get()
        return doc.to_dict() if doc.exists else None

    async def update(self, tenant_id: UUID, event_id: str, data: EventUpdate) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        doc_ref = collection.document(event_id)
        
        if not doc_ref.get().exists:
            return None

        update_data = data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        doc_ref.update(update_data)
        return doc_ref.get().to_dict()

    async def delete(self, tenant_id: UUID, event_id: str) -> bool:
        collection = self._get_collection(str(tenant_id))
        doc_ref = collection.document(event_id)
        
        if not doc_ref.get().exists:
            return False
        
        doc_ref.delete()
        return True


event_repository = EventRepository()
