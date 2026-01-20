"""
Member repository for Firestore (tenant-scoped).
"""

from typing import Optional
from datetime import date

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
    ) -> dict:
        """Create a new member."""
        data = {
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "birth_date": birth_date.isoformat() if birth_date else None,
            "gender": gender,
            "marital_status": None,
            "marriage_date": None,
            "spouse_name": None,
            "street": None,
            "number": None,
            "complement": None,
            "neighborhood": None,
            "city": None,
            "state": None,
            "postal_code": None,
            "photo_url": None,
            "status": status,
            "role": office,
            "office": office,
            "functions": [],
            "baptism_date": None,
            "profession_of_faith_date": None,
            "admission_date": None,
            "admission_type": None,
            "origin_church": None,
            "user_id": user_id,
        }
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
