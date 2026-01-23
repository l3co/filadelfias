"""
Member repository for Firestore (tenant-scoped).
"""

from datetime import date, datetime
from typing import Optional

from src.infra.firestore_repository import TenantScopedRepository


class MemberRepository(TenantScopedRepository):
    """Repository for members subcollection under tenants."""

    def __init__(self):
        super().__init__("members")

    async def get_by_email(self, tenant_id: str, email: str) -> Optional[dict]:
        """Get member by email within a tenant."""
        members = await self.query(tenant_id, "email", "==", email, limit=1)
        return members[0] if members else None

    async def get_by_user_id(self, tenant_id: str, user_id: str) -> Optional[dict]:
        """Get member by user_id within a tenant."""
        members = await self.query(tenant_id, "user_id", "==", user_id, limit=1)
        return members[0] if members else None

    async def create_member(
        self,
        tenant_id: str,
        full_name: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        birth_date: Optional[date] = None,
        gender: Optional[str] = None,
        status: str = "COMUNGANTE",
        office: str = "MEMBRO",
        user_id: Optional[str] = None,
        **kwargs,
    ) -> dict:
        """Create a new member."""
        # Base data with defaults
        data = {
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "birth_date": birth_date.isoformat() if birth_date else None,
            "gender": gender,
            "status": status,
            "role": office,
            "office": office,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
        }

        # Convert date objects in kwargs to ISO format strings
        for key, value in kwargs.items():
            if isinstance(value, (date, datetime)):
                kwargs[key] = value.isoformat()

        # Merge additional fields (address, ecclesiastical, system_role, etc.)
        # This fixes the bug where address/marriage data was being discarded on creation
        data.update(kwargs)

        return await self.create(tenant_id, data)

    async def get_by_status(self, tenant_id: str, status: str) -> list[dict]:
        """Get all members with a specific status."""
        return await self.query(tenant_id, "status", "==", status)

    async def get_by_office(self, tenant_id: str, office: str) -> list[dict]:
        """Get all members with a specific office."""
        return await self.query(tenant_id, "office", "==", office)

    async def link_user(self, tenant_id: str, member_id: str, user_id: str) -> Optional[dict]:
        """Link a user account to a member."""
        return await self.update(tenant_id, member_id, {"user_id": user_id})


# Singleton instance
member_repository = MemberRepository()
