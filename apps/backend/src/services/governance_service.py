from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.governance.repository import GovernanceRepository
from src.modules.governance.models import Council, Meeting
from src.modules.governance.schemas import CouncilCreate, MeetingCreate

class GovernanceService:
    def __init__(self, db: AsyncSession):
        self.repo = GovernanceRepository(db)

    async def create_council(self, tenant_id: UUID, data: CouncilCreate) -> Council:
        """Create a new council for a tenant."""
        council = Council(
            tenant_id=tenant_id,
            name=data.name,
            type=data.type,
            description=data.description
        )
        return await self.repo.create_council(council)

    async def list_councils(self, tenant_id: UUID) -> List[Council]:
        """List all councils for a tenant."""
        return await self.repo.get_councils(tenant_id)
        
    async def create_meeting(self, data: MeetingCreate) -> Meeting:
        """Create a new meeting."""
        meeting = Meeting(
            council_id=data.council_id,
            date=data.date,
            status=data.status,
            agenda=data.agenda,
            location=data.location
        )
        return await self.repo.create_meeting(meeting)
        
    async def list_meetings(self, council_id: UUID) -> List[Meeting]:
        """List meetings for a council."""
        return await self.repo.get_meetings(council_id)
