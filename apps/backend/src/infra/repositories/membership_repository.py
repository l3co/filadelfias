"""
User Church Membership repository for Firestore.
"""

from datetime import datetime
from typing import Optional

from src.infra.firestore_repository import FirestoreRepository


class MembershipRepository(FirestoreRepository):
    """Repository for user_memberships collection."""

    def __init__(self):
        super().__init__("user_memberships")

    async def get_by_user_and_tenant(self, user_id: str, tenant_id: str) -> Optional[dict]:
        """Get membership by user and tenant."""
        memberships = await self.query("user_id", "==", user_id)
        for m in memberships:
            if m.get("tenant_id") == tenant_id:
                return m
        return None

    async def get_user_memberships(self, user_id: str) -> list[dict]:
        """Get all memberships for a user."""
        return await self.query("user_id", "==", user_id)

    async def get_tenant_memberships(self, tenant_id: str) -> list[dict]:
        """Get all memberships for a tenant."""
        return await self.query("tenant_id", "==", tenant_id)

    async def create_membership(
        self,
        user_id: str,
        tenant_id: str,
        role: str = "ATTENDEE",
        status: str = "ACTIVE",
        invited_by: Optional[str] = None,
    ) -> dict:
        """Create a new user-church membership."""
        data = {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": role,
            "status": status,
            "joined_at": datetime.utcnow(),
            "invited_by": invited_by,
        }
        return await self.create(data)

    async def update_role(self, membership_id: str, role: str) -> Optional[dict]:
        """Update membership role."""
        return await self.update(membership_id, {"role": role})

    async def update_status(self, membership_id: str, status: str) -> Optional[dict]:
        """Update membership status."""
        return await self.update(membership_id, {"status": status})


# Singleton instance
membership_repository = MembershipRepository()
