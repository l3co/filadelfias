import logging
import uuid
from datetime import datetime
from typing import List
from uuid import UUID

from src.infra.firebase import get_db
from src.modules.missions.schemas import MissionaryCreate

logger = logging.getLogger(__name__)


class MissionaryRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("missionaries")

    async def create(self, tenant_id: UUID, data: MissionaryCreate) -> dict:
        # Note: tenant_id can be UUID object
        collection = self._get_collection(str(tenant_id))
        doc_id = str(uuid.uuid4())

        missionary_data = data.model_dump()
        missionary_data.update({"id": doc_id, "tenant_id": str(tenant_id), "created_at": datetime.utcnow()})

        collection.document(doc_id).set(missionary_data)
        return missionary_data

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        collection = self._get_collection(str(tenant_id))
        # stream() is a generator, must be consumed
        return [doc.to_dict() for doc in collection.stream()]


missionary_repository = MissionaryRepository()
