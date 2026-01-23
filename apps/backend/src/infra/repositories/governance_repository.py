"""
Governance repositories for Firestore.
"""

from datetime import datetime
from typing import Optional

from src.infra.firestore_repository import FirestoreRepository, TenantScopedRepository


class CouncilRepository(TenantScopedRepository):
    """Repository for councils subcollection under tenants."""

    def __init__(self):
        super().__init__("councils")

    async def create_council(
        self,
        tenant_id: str,
        name: str,
        council_type: str,  # SESSION, BOARD, ASSEMBLY
        description: Optional[str] = None,
    ) -> dict:
        """Create a new council."""
        data = {
            "name": name,
            "council_type": council_type,
            "description": description,
            "member_ids": [],
            "is_active": True,
        }
        return await self.create(tenant_id, data)

    async def get_by_type(self, tenant_id: str, council_type: str) -> list[dict]:
        """Get councils by type."""
        return await self.query(tenant_id, "council_type", "==", council_type)

    async def add_member(self, tenant_id: str, council_id: str, member_id: str) -> Optional[dict]:
        """Add a member to a council."""
        council = await self.get(council_id, tenant_id)
        if not council:
            return None

        member_ids = council.get("member_ids", [])
        if member_id not in member_ids:
            member_ids.append(member_id)
            await self.update(council_id, {"member_ids": member_ids}, tenant_id)

        return await self.get(council_id, tenant_id)

    async def remove_member(self, tenant_id: str, council_id: str, member_id: str) -> Optional[dict]:
        """Remove a member from a council."""
        council = await self.get(council_id, tenant_id)
        if not council:
            return None

        member_ids = council.get("member_ids", [])
        if member_id in member_ids:
            member_ids.remove(member_id)
            await self.update(council_id, {"member_ids": member_ids}, tenant_id)

        return await self.get(council_id, tenant_id)


class MeetingRepository(FirestoreRepository):
    """Repository for meetings."""

    def __init__(self):
        super().__init__("meetings")

    async def create_meeting(
        self,
        council_id: str,
        title: str,
        scheduled_date: datetime,
        location: Optional[str] = None,
        description: Optional[str] = None,
    ) -> dict:
        """Create a new meeting."""
        data = {
            "council_id": council_id,
            "title": title,
            "scheduled_date": scheduled_date,
            "location": location,
            "description": description,
            "status": "SCHEDULED",
        }
        return await self.create(data)

    async def get_by_council(self, council_id: str) -> list[dict]:
        """Get all meetings for a council."""
        return await self.query("council_id", "==", council_id)


# Singleton instances
council_repository = CouncilRepository()
meeting_repository = MeetingRepository()
