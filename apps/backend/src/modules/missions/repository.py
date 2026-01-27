import logging
import uuid
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from src.infra.firebase import get_db
from src.modules.missions.schemas import CountryCreate, MissionaryCreate

logger = logging.getLogger(__name__)


class CountryRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("countries")

    async def create(self, tenant_id: UUID, data: CountryCreate) -> dict:
        collection = self._get_collection(str(tenant_id))
        doc_id = str(uuid.uuid4())

        country_data = data.model_dump()
        country_data.update(
            {
                "id": doc_id,
                "tenant_id": str(tenant_id),
                "created_at": datetime.utcnow(),
            }
        )

        collection.document(doc_id).set(country_data)
        return country_data

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        collection = self._get_collection(str(tenant_id))
        docs = collection.order_by("name").stream()
        return [doc.to_dict() for doc in docs]

    async def get_by_code(self, tenant_id: UUID, code: str) -> Optional[dict]:
        collection = self._get_collection(str(tenant_id))
        docs = collection.where("code", "==", code).limit(1).stream()
        for doc in docs:
            return doc.to_dict()
        return None


country_repository = CountryRepository()


class MissionaryRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("missionaries")

    async def create(self, tenant_id: UUID, data: MissionaryCreate) -> dict:
        collection = self._get_collection(str(tenant_id))
        doc_id = str(uuid.uuid4())

        missionary_data = data.model_dump()
        missionary_data.update({"id": doc_id, "tenant_id": str(tenant_id), "created_at": datetime.utcnow()})

        collection.document(doc_id).set(missionary_data)
        return missionary_data

    async def get_by_tenant(self, tenant_id: UUID) -> List[dict]:
        collection = self._get_collection(str(tenant_id))
        return [doc.to_dict() for doc in collection.stream()]

    async def delete(self, tenant_id: UUID, missionary_id: str) -> bool:
        collection = self._get_collection(str(tenant_id))
        doc_ref = collection.document(missionary_id)
        if not doc_ref.get().exists:
            return False
        doc_ref.delete()
        return True


missionary_repository = MissionaryRepository()
