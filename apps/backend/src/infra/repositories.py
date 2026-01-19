"""
User repository for database operations.
"""
from typing import Optional, Sequence
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.infra.models import (
    User, Member, Tenant, UserChurchMembership, 
    Council, Meeting, MeetingMinute, CouncilMember,
    FinancialAccount, Transaction, TransactionCategory
)
from src.infra.security import get_password_hash


class UserRepository:
    """Repository for User database operations."""

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with database session.
        
        Args:
            session: Async database session
        """
        self.session = session

    async def create(self, email: str, name: str, password: str) -> User:
        """
        Create a new user.
        
        Args:
            email: User email
            name: User name
            password: Plain text password (will be hashed)
            
        Returns:
            User: Created user instance
        """
        user = User(
            email=email,
            name=name,
            password_hash=get_password_hash(password),
        )
        self.session.add(user)
        await self.session.commit()
        # Refetch to get relationships loaded
        return await self.get_by_email(email)

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email with eager loaded memberships.
        
        Args:
            email: User email
            
        Returns:
            Optional[User]: User instance or None if not found
        """
        result = await self.session.execute(
            select(User)
            .where(User.email == email)
            .options(
                selectinload(User.memberships).selectinload(UserChurchMembership.tenant)
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User UUID
            
        Returns:
            Optional[User]: User instance or None if not found
        """
        result = await self.session.execute(
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.memberships).selectinload(UserChurchMembership.tenant)
            )
        )
        return result.scalar_one_or_none()

    async def exists_by_email(self, email: str) -> bool:
        """
        Check if user exists by email.
        
        Args:
            email: User email
            
        Returns:
            bool: True if user exists, False otherwise
        """
        user = await self.get_by_email(email)
        return user is not None


class MemberRepository:
    """Repository for Member database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, member: Member) -> Member:
        """Create a new member."""
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member

    async def get_by_tenant(self, tenant_id: UUID) -> Sequence[Member]:
        """List members by tenant."""
        result = await self.session.execute(
            select(Member).where(Member.tenant_id == tenant_id)
        )
        return result.scalars().all()


class TenantRepository:
    """Repository for Tenant database operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def create(self, tenant: Tenant) -> Tenant:
        """Create a new tenant."""
        self.session.add(tenant)
        await self.session.commit()
        await self.session.refresh(tenant)
        return tenant
        
    async def get_by_slug(self, slug: str) -> Optional[Tenant]:
        """Get tenant by slug."""
        result = await self.session.execute(select(Tenant).where(Tenant.slug == slug))
        return result.scalar_one_or_none()


class GovernanceRepository:
    """Repository for Governance operations (Councils, Meetings)."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def create_council(self, council: Council) -> Council:
        """Create a new council."""
        self.session.add(council)
        await self.session.commit()
        await self.session.refresh(council)
        return council
        
    async def get_councils(self, tenant_id: UUID) -> Sequence[Council]:
        """List councils by tenant."""
        result = await self.session.execute(
            select(Council).where(Council.tenant_id == tenant_id)
        )
        return result.scalars().all()
        
    async def get_council_by_id(self, council_id: UUID) -> Optional[Council]:
        """Get council by ID."""
        result = await self.session.execute(
            select(Council).where(Council.id == council_id)
        )
        return result.scalar_one_or_none()
        
    async def create_meeting(self, meeting: Meeting) -> Meeting:
        """Create a new meeting."""
        self.session.add(meeting)
        await self.session.commit()
        await self.session.refresh(meeting)
        return meeting
        
    async def get_meetings(self, council_id: UUID) -> Sequence[Meeting]:
        """List meetings by council."""
        result = await self.session.execute(
            select(Meeting).where(Meeting.council_id == council_id).order_by(Meeting.date.desc())
        )
        return result.scalars().all()


class FinancialRepository:
    """Repository for Financial operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session

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
        
        # Update account balance simple logic
        account = await self.session.get(FinancialAccount, transaction.account_id)
        if account:
            if transaction.type == "CREDIT":
                account.balance += transaction.amount
            else:
                account.balance -= transaction.amount
            self.session.add(account)

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

