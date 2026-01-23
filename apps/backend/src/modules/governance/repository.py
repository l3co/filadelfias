import logging
import uuid
from datetime import date, datetime
from typing import List

from src.infra.firebase import get_db

logger = logging.getLogger(__name__)


class CouncilRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("councils")

    async def create_council(self, tenant_id: str, **kwargs) -> dict:
        collection = self._get_collection(tenant_id)
        doc_id = str(uuid.uuid4())

        data = kwargs.copy()

        if "council_type" in data:
            data["type"] = data.pop("council_type")

        data.update({"id": doc_id, "tenant_id": str(tenant_id), "created_at": datetime.utcnow()})

        collection.document(doc_id).set(data)
        return data

    async def get_all(self, tenant_id: str) -> List[dict]:
        return [doc.to_dict() for doc in self._get_collection(str(tenant_id)).stream()]

    async def delete(self, tenant_id: str, council_id: str) -> None:
        """Delete a council by ID."""
        self._get_collection(tenant_id).document(council_id).delete()

    async def get_by_id(self, tenant_id: str, council_id: str) -> dict | None:
        """Get a council by ID."""
        doc = self._get_collection(tenant_id).document(council_id).get()
        return doc.to_dict() if doc.exists else None

    async def add_member(self, tenant_id: str, council_id: str, member_id: str) -> dict | None:
        """Add a member to a council."""
        doc_ref = self._get_collection(tenant_id).document(council_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None

        council_data = doc.to_dict()
        members = council_data.get("members", [])

        if member_id not in members:
            members.append(member_id)
            doc_ref.update({"members": members, "updated_at": datetime.utcnow()})

        council_data["members"] = members
        return council_data

    async def remove_member(self, tenant_id: str, council_id: str, member_id: str) -> dict | None:
        """Remove a member from a council."""
        doc_ref = self._get_collection(tenant_id).document(council_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None

        council_data = doc.to_dict()
        members = council_data.get("members", [])

        if member_id in members:
            members.remove(member_id)
            doc_ref.update({"members": members, "updated_at": datetime.utcnow()})

        council_data["members"] = members
        return council_data


class MeetingRepository:
    @property
    def db(self):
        return get_db()

    async def create_meeting(self, council_id: str, **kwargs) -> dict:
        councils = self.db.collection_group("councils").where("id", "==", str(council_id)).limit(1).get()
        if not councils:
            raise ValueError("Council not found")

        council_doc = councils[0]
        doc_id = str(uuid.uuid4())

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

        data.update({"id": doc_id, "council_id": str(council_id), "created_at": datetime.utcnow()})

        council_doc.reference.collection("meetings").document(doc_id).set(data)
        return data

    async def get_by_council(self, council_id: str) -> List[dict]:
        councils = self.db.collection_group("councils").where("id", "==", str(council_id)).limit(1).get()
        if not councils:
            return []

        return [doc.to_dict() for doc in councils[0].reference.collection("meetings").stream()]


council_repository = CouncilRepository()
meeting_repository = MeetingRepository()
