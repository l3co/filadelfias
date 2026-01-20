"""
Financial repositories for Firestore.
"""

from typing import Optional
from datetime import date
from decimal import Decimal

from src.infra.firestore_repository import TenantScopedRepository


class FinancialAccountRepository(TenantScopedRepository):
    """Repository for financial accounts subcollection under tenants."""

    def __init__(self):
        super().__init__("financial_accounts")

    async def create_account(
        self,
        tenant_id: str,
        name: str,
        account_type: str = "CHECKING",
        initial_balance: float = 0.0,
        description: Optional[str] = None,
    ) -> dict:
        """Create a new financial account."""
        data = {
            "name": name,
            "account_type": account_type,
            "balance": initial_balance,
            "description": description,
            "is_active": True,
        }
        return await self.create(tenant_id, data)


class TransactionCategoryRepository(TenantScopedRepository):
    """Repository for transaction categories subcollection under tenants."""

    def __init__(self):
        super().__init__("transaction_categories")

    async def create_category(
        self,
        tenant_id: str,
        name: str,
        category_type: str,  # INCOME or EXPENSE
        description: Optional[str] = None,
    ) -> dict:
        """Create a new transaction category."""
        data = {
            "name": name,
            "category_type": category_type,
            "description": description,
            "is_active": True,
        }
        return await self.create(tenant_id, data)

    async def get_by_type(self, tenant_id: str, category_type: str) -> list[dict]:
        """Get categories by type (INCOME or EXPENSE)."""
        return await self.query(tenant_id, "category_type", "==", category_type)


class TransactionRepository(TenantScopedRepository):
    """Repository for financial transactions subcollection under tenants."""

    def __init__(self):
        super().__init__("transactions")

    async def create_transaction(
        self,
        tenant_id: str,
        account_id: str,
        category_id: str,
        amount: float,
        transaction_type: str,  # INCOME or EXPENSE
        transaction_date: date,
        description: Optional[str] = None,
        reference: Optional[str] = None,
    ) -> dict:
        """Create a new transaction."""
        data = {
            "account_id": account_id,
            "category_id": category_id,
            "amount": amount,
            "transaction_type": transaction_type,
            "transaction_date": transaction_date.isoformat(),
            "description": description,
            "reference": reference,
        }
        return await self.create(tenant_id, data)

    async def get_by_account(self, tenant_id: str, account_id: str) -> list[dict]:
        """Get all transactions for an account."""
        return await self.query(tenant_id, "account_id", "==", account_id)

    async def get_by_category(self, tenant_id: str, category_id: str) -> list[dict]:
        """Get all transactions for a category."""
        return await self.query(tenant_id, "category_id", "==", category_id)


# Singleton instances
financial_account_repository = FinancialAccountRepository()
transaction_category_repository = TransactionCategoryRepository()
transaction_repository = TransactionRepository()
