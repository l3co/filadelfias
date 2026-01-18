"""
User repository for database operations.
"""
from typing import Optional, Sequence
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.models import User, Member, Tenant
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
        await self.session.refresh(user)
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            email: User email
            
        Returns:
            Optional[User]: User instance or None if not found
        """
        result = await self.session.execute(
            select(User).where(User.email == email)
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
            select(User).where(User.id == user_id)
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
