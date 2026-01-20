"""
Base Firestore repository with common CRUD operations.
"""

import uuid
from datetime import datetime
from typing import Any, Generic, Optional, TypeVar

from google.cloud.firestore import Client, CollectionReference

from src.infra.firebase import get_db

T = TypeVar("T", bound=dict)


class FirestoreRepository(Generic[T]):
    """
    Base repository for Firestore collections.
    """

    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self._db: Client | None = None

    @property
    def db(self) -> Client:
        if self._db is None:
            self._db = get_db()
        return self._db

    @property
    def collection(self) -> CollectionReference:
        return self.db.collection(self.collection_name)

    def _generate_id(self) -> str:
        return str(uuid.uuid4())

    def _add_timestamps(self, data: dict, is_update: bool = False) -> dict:
        now = datetime.utcnow()
        if not is_update:
            data["created_at"] = now
        data["updated_at"] = now
        return data

    async def create(self, data: dict, doc_id: str | None = None) -> dict:
        """Create a new document."""
        doc_id = doc_id or self._generate_id()
        data = self._add_timestamps(data.copy())
        data["id"] = doc_id
        self.collection.document(doc_id).set(data)
        return data

    async def get(self, doc_id: str) -> Optional[dict]:
        """Get a document by ID."""
        doc = self.collection.document(doc_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    async def get_all(self, limit: int = 100) -> list[dict]:
        """Get all documents in collection."""
        docs = self.collection.limit(limit).stream()
        return [doc.to_dict() for doc in docs]

    async def update(self, doc_id: str, data: dict) -> Optional[dict]:
        """Update a document."""
        doc_ref = self.collection.document(doc_id)
        if not doc_ref.get().exists:
            return None
        data = self._add_timestamps(data.copy(), is_update=True)
        doc_ref.update(data)
        return await self.get(doc_id)

    async def delete(self, doc_id: str) -> bool:
        """Delete a document."""
        doc_ref = self.collection.document(doc_id)
        if not doc_ref.get().exists:
            return False
        doc_ref.delete()
        return True

    async def query(self, field: str, operator: str, value: Any, limit: int = 100) -> list[dict]:
        """Query documents by field."""
        docs = self.collection.where(field, operator, value).limit(limit).stream()
        return [doc.to_dict() for doc in docs]

    async def get_by_field(self, field: str, value: Any) -> Optional[dict]:
        """Get first document matching field value."""
        docs = await self.query(field, "==", value, limit=1)
        return docs[0] if docs else None


class TenantScopedRepository(FirestoreRepository[T]):
    """
    Repository for tenant-scoped collections (subcollections under tenants).
    """

    def __init__(self, subcollection_name: str):
        self.subcollection_name = subcollection_name
        self._db: Client | None = None

    def get_collection(self, tenant_id: str) -> CollectionReference:
        """Get subcollection for a specific tenant."""
        return self.db.collection("tenants").document(tenant_id).collection(self.subcollection_name)

    async def create(self, tenant_id: str, data: dict, doc_id: str | None = None) -> dict:
        """Create a new document in tenant's subcollection."""
        doc_id = doc_id or self._generate_id()
        data = self._add_timestamps(data.copy())
        data["id"] = doc_id
        data["tenant_id"] = tenant_id
        self.get_collection(tenant_id).document(doc_id).set(data)
        return data

    async def get(self, tenant_id: str, doc_id: str) -> Optional[dict]:
        """Get a document by ID from tenant's subcollection."""
        doc = self.get_collection(tenant_id).document(doc_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    async def get_all(self, tenant_id: str, limit: int = 100) -> list[dict]:
        """Get all documents in tenant's subcollection."""
        docs = self.get_collection(tenant_id).limit(limit).stream()
        return [doc.to_dict() for doc in docs]

    async def update(self, tenant_id: str, doc_id: str, data: dict) -> Optional[dict]:
        """Update a document in tenant's subcollection."""
        doc_ref = self.get_collection(tenant_id).document(doc_id)
        if not doc_ref.get().exists:
            return None
        data = self._add_timestamps(data.copy(), is_update=True)
        doc_ref.update(data)
        return await self.get(tenant_id, doc_id)

    async def delete(self, tenant_id: str, doc_id: str) -> bool:
        """Delete a document from tenant's subcollection."""
        doc_ref = self.get_collection(tenant_id).document(doc_id)
        if not doc_ref.get().exists:
            return False
        doc_ref.delete()
        return True

    async def query(self, tenant_id: str, field: str, operator: str, value: Any, limit: int = 100) -> list[dict]:
        """Query documents in tenant's subcollection."""
        docs = self.get_collection(tenant_id).where(field, operator, value).limit(limit).stream()
        return [doc.to_dict() for doc in docs]
