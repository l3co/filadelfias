from typing import Sequence, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.governance.models import Council, Meeting

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
