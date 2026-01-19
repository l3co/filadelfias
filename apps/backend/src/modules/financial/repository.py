from typing import Optional, Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.financial.models import FinancialAccount, Transaction, TransactionCategory


class FinancialRepository:
    """Repository for Financial operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_account(self, account_id: UUID) -> Optional[FinancialAccount]:
        return await self.session.get(FinancialAccount, account_id)

    def add(self, obj):
        self.session.add(obj)

    async def create_account(self, account: FinancialAccount) -> FinancialAccount:
        self.session.add(account)
        await self.session.commit()
        await self.session.refresh(account)
        return account

    async def get_accounts(self, tenant_id: UUID) -> Sequence[FinancialAccount]:
        result = await self.session.execute(
            select(FinancialAccount).where(FinancialAccount.tenant_id == tenant_id)
        )
        return result.scalars().all()

    async def create_category(self, category: TransactionCategory) -> TransactionCategory:
        self.session.add(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def get_categories(self, tenant_id: UUID) -> Sequence[TransactionCategory]:
        result = await self.session.execute(
            select(TransactionCategory).where(TransactionCategory.tenant_id == tenant_id)
        )
        return result.scalars().all()

    async def create_transaction(self, transaction: Transaction) -> Transaction:
        self.session.add(transaction)
        await self.session.commit()
        await self.session.refresh(transaction)
        # Load relationships
        return await self.get_transaction(transaction.id)

    async def get_transaction(self, transaction_id: UUID) -> Optional[Transaction]:
        result = await self.session.execute(
            select(Transaction)
            .where(Transaction.id == transaction_id)
            .options(
                selectinload(Transaction.account),
                selectinload(Transaction.category)
            )
        )
        return result.scalar_one_or_none()

    async def get_transactions(self, tenant_id: UUID, limit: int = 50) -> Sequence[Transaction]:
        result = await self.session.execute(
            select(Transaction)
            .where(Transaction.tenant_id == tenant_id)
            .order_by(Transaction.date.desc())
            .limit(limit)
            .options(
                selectinload(Transaction.account),
                selectinload(Transaction.category)
            )
        )
        return result.scalars().all()
