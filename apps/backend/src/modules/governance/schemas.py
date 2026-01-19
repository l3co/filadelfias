from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class CouncilBase(BaseModel):
    name: str = Field(..., min_length=1)
    type: str # SESSION, DEACONS, ASSEMBLY, COMMITTEE
    description: Optional[str] = None

class CouncilCreate(CouncilBase):
    pass

class CouncilResponse(CouncilBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
        
class MeetingBase(BaseModel):
    date: datetime
    status: str = "SCHEDULED"
    agenda: Optional[str] = None
    location: Optional[str] = None

class MeetingCreate(MeetingBase):
    council_id: UUID

class MeetingResponse(MeetingBase):
    id: UUID
    council_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
