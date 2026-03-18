import logging
from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import select

from src.infra.db.models import FinancialAccountModel, TransactionCategoryModel, TransactionModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository

logger = logging.getLogger(__name__)


class FinancialAccountRepository(SQLAlchemyRepository):
    fields = ["id", "tenant_id", "name", "type", "balance", "created_at", "updated_at"]

    async def create_account(self, tenant_id: str, **kwargs) -> dict:
        account_type = kwargs.get("type") or kwargs.get("account_type") or "BANK"
        balance = float(kwargs.get("balance", kwargs.get("initial_balance", 0.0)) or 0.0)

        async with self.session() as session:
            account = FinancialAccountModel(
                tenant_id=self._maybe_uuid(tenant_id),
                name=kwargs["name"],
                type=str(account_type).upper(),
                balance=balance,
            )
            session.add(account)
            await session.commit()
            await session.refresh(account)
            return self._to_dict(account, self.fields)

    async def get_all(self, tenant_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(FinancialAccountModel)
                .where(FinancialAccountModel.tenant_id == self._maybe_uuid(tenant_id))
                .order_by(FinancialAccountModel.name.asc())
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]


class TransactionCategoryRepository(SQLAlchemyRepository):
    fields = ["id", "tenant_id", "name", "type", "parent_id", "created_at", "updated_at"]

    async def create_category(self, tenant_id: str, **kwargs) -> dict:
        category_type = kwargs.get("type") or kwargs.get("category_type")
        parent_id = kwargs.get("parent_id")

        async with self.session() as session:
            category = TransactionCategoryModel(
                tenant_id=self._maybe_uuid(tenant_id),
                name=kwargs["name"],
                type=str(category_type).upper(),
                parent_id=self._maybe_uuid(parent_id) if parent_id else None,
            )
            session.add(category)
            await session.commit()
            await session.refresh(category)
            return self._to_dict(category, self.fields)

    async def get_all(self, tenant_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(TransactionCategoryModel)
                .where(TransactionCategoryModel.tenant_id == self._maybe_uuid(tenant_id))
                .order_by(TransactionCategoryModel.type.asc(), TransactionCategoryModel.name.asc())
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]


class TransactionRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "tenant_id",
        "account_id",
        "category_id",
        "member_id",
        "amount",
        "type",
        "description",
        "date",
        "attachment_url",
        "category",
        "created_at",
        "updated_at",
    ]

    async def create_transaction(
        self, tenant_id: str, account_id: str, amount: float, transaction_type: str, transaction_date: date, **kwargs
    ) -> dict:
        tx_date = self._normalize_date(transaction_date)
        category_id = kwargs.get("category_id")

        async with self.session() as session:
            transaction = TransactionModel(
                tenant_id=self._maybe_uuid(tenant_id),
                account_id=self._maybe_uuid(account_id),
                category_id=self._maybe_uuid(category_id) if category_id else None,
                member_id=kwargs.get("member_id"),
                amount=float(amount),
                type=str(transaction_type).upper(),
                description=kwargs.get("description") or "",
                date=tx_date,
                attachment_url=kwargs.get("attachment_url"),
                category=kwargs.get("category"),
            )
            session.add(transaction)
            await session.commit()
            await session.refresh(transaction)
            return self._to_dict(transaction, self.fields)

    @staticmethod
    def _normalize_date(value) -> date:
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            return date.fromisoformat(value)
        raise ValueError("Invalid transaction_date")

    def _parse_date(self, doc_date) -> datetime:
        """Parse date from various formats to datetime."""
        if doc_date is None:
            return None
        if isinstance(doc_date, datetime):
            return doc_date
        if isinstance(doc_date, date):
            return datetime.combine(doc_date, datetime.min.time())
        if isinstance(doc_date, str):
            try:
                return datetime.fromisoformat(doc_date.replace("Z", "+00:00"))
            except ValueError:
                try:
                    return datetime.strptime(doc_date, "%Y-%m-%d")
                except ValueError:
                    return None
        return None

    async def get_all(
        self, tenant_id: str, month: int = None, year: int = None, page: int = 1, page_size: int = 10
    ) -> List[dict]:
        async with self.session() as session:
            statement = select(TransactionModel).where(TransactionModel.tenant_id == self._maybe_uuid(tenant_id))
            result = await session.execute(statement.order_by(TransactionModel.date.desc(), TransactionModel.created_at.desc()))
            docs = [self._to_dict(item, self.fields) for item in result.scalars().all()]

        if month is not None or year is not None:
            filtered: list[dict] = []
            for doc in docs:
                doc_date = self._parse_date(doc.get("date"))
                if doc_date:
                    if month is not None and doc_date.month != month:
                        continue
                    if year is not None and doc_date.year != year:
                        continue
                    filtered.append(doc)
            docs = filtered

        start = (page - 1) * page_size
        end = start + page_size
        return docs[start:end]


financial_account_repository = FinancialAccountRepository()
transaction_category_repository = TransactionCategoryRepository()
transaction_repository = TransactionRepository()
