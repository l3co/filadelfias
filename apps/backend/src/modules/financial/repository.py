import logging
import uuid
from datetime import date, datetime
from typing import List

from src.infra.firebase import get_db

logger = logging.getLogger(__name__)


class FinancialAccountRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("financial_accounts")

    async def create_account(self, tenant_id: str, **kwargs) -> dict:
        collection = self._get_collection(tenant_id)
        doc_id = str(uuid.uuid4())

        data = kwargs.copy()
        data.update({"id": doc_id, "tenant_id": str(tenant_id), "created_at": datetime.utcnow()})

        collection.document(doc_id).set(data)
        return data

    async def get_all(self, tenant_id: str) -> List[dict]:
        return [doc.to_dict() for doc in self._get_collection(str(tenant_id)).stream()]


class TransactionCategoryRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("transaction_categories")

    async def create_category(self, tenant_id: str, **kwargs) -> dict:
        collection = self._get_collection(tenant_id)
        doc_id = str(uuid.uuid4())

        data = kwargs.copy()
        data.update({"id": doc_id, "tenant_id": str(tenant_id), "created_at": datetime.utcnow()})

        collection.document(doc_id).set(data)
        return data

    async def get_all(self, tenant_id: str) -> List[dict]:
        return [doc.to_dict() for doc in self._get_collection(str(tenant_id)).stream()]


class TransactionRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("transactions")

    async def create_transaction(
        self, tenant_id: str, account_id: str, amount: float, transaction_type: str, transaction_date: date, **kwargs
    ) -> dict:
        collection = self._get_collection(tenant_id)
        doc_id = str(uuid.uuid4())

        tx_date = transaction_date
        if isinstance(tx_date, date) and not isinstance(tx_date, datetime):
            tx_date = datetime.combine(tx_date, datetime.min.time())

        data = {
            "id": doc_id,
            "tenant_id": str(tenant_id),
            "account_id": str(account_id),
            "amount": float(amount),
            "type": transaction_type,
            "date": tx_date,
            "created_at": datetime.utcnow(),
        }
        data.update(kwargs)

        collection.document(doc_id).set(data)
        return data

    async def get_all(self, tenant_id: str) -> List[dict]:
        return [doc.to_dict() for doc in self._get_collection(str(tenant_id)).stream()]


financial_account_repository = FinancialAccountRepository()
transaction_category_repository = TransactionCategoryRepository()
transaction_repository = TransactionRepository()
