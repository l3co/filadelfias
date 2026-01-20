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
            "is_active": True,
        }
        return await self.create(tenant_id, data)

    async def get_by_type(self, tenant_id: str, council_type: str) -> list[dict]:
        """Get councils by type."""
        return await self.query(tenant_id, "council_type", "==", council_type)


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
