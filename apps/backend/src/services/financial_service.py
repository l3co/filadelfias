from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.repositories import FinancialRepository
from src.infra.models import FinancialAccount, TransactionCategory, Transaction
from src.domain.schemas import FinancialAccountCreate, TransactionCategoryCreate, TransactionCreate

class FinancialService:
    def __init__(self, db: AsyncSession):
        self.repo = FinancialRepository(db)

    async def create_account(self, tenant_id: UUID, data: FinancialAccountCreate) -> FinancialAccount:
        account = FinancialAccount(
            tenant_id=tenant_id,
            name=data.name,
            type=data.type,
            balance=data.balance
        )
        return await self.repo.create_account(account)

    async def list_accounts(self, tenant_id: UUID) -> List[FinancialAccount]:
        return await self.repo.get_accounts(tenant_id)
        
    async def create_category(self, tenant_id: UUID, data: TransactionCategoryCreate) -> TransactionCategory:
        category = TransactionCategory(
            tenant_id=tenant_id,
            name=data.name,
            type=data.type,
            parent_id=data.parent_id
        )
        return await self.repo.create_category(category)
        
    async def list_categories(self, tenant_id: UUID) -> List[TransactionCategory]:
        return await self.repo.get_categories(tenant_id)
        
    async def create_transaction(self, tenant_id: UUID, data: TransactionCreate) -> Transaction:
        transaction = Transaction(
            tenant_id=tenant_id,
            account_id=data.account_id,
            category_id=data.category_id,
            member_id=data.member_id,
            amount=data.amount,
            type=data.type,
            description=data.description,
            date=data.date,
            attachment_url=data.attachment_url
        )
        return await self.repo.create_transaction(transaction)
        
    async def list_transactions(self, tenant_id: UUID) -> List[Transaction]:
        return await self.repo.get_transactions(tenant_id)
