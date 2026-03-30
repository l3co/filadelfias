from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CouncilBase(BaseModel):
    name: str = Field(..., min_length=1)
    type: str  # SESSION, DEACONS, ASSEMBLY, COMMITTEE
    description: Optional[str] = None


class CouncilCreate(CouncilBase):
    pass


class CouncilUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None


class CouncilMemberAdd(BaseModel):
    member_id: str


class CouncilResponse(CouncilBase):
    id: UUID
    tenant_id: UUID
    member_ids: list[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingBase(BaseModel):
    """
    Base schema for meeting data.

    Defines core fields shared across create/update/response schemas.
    Status follows presbyterian meeting lifecycle: SCHEDULED -> IN_PROGRESS -> COMPLETED/CANCELLED.
    Meeting type distinguishes between regular (ORDINARY) and special (EXTRAORDINARY) meetings.
    """

    date: datetime
    status: str = "SCHEDULED"  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    agenda: Optional[str] = None
    location: Optional[str] = None
    meeting_type: str = "ORDINARY"  # ORDINARY | EXTRAORDINARY


class MeetingCreate(MeetingBase):
    """Schema for creating a new meeting."""

    council_id: UUID


class MeetingUpdate(BaseModel):
    """
    Schema for updating meeting data.

    All fields are optional to allow partial updates.
    Used for editing meeting details, recording minutes, and marking attendance.
    """

    date: Optional[datetime] = None
    status: Optional[str] = None
    agenda: Optional[str] = None
    location: Optional[str] = None
    meeting_type: Optional[str] = None
    minutes: Optional[str] = None  # Meeting minutes/notes (ata)
    attendees: Optional[list[str]] = None  # List of member IDs present


class MeetingResponse(MeetingBase):
    """
    Complete meeting response with all fields.

    Includes computed/derived fields for display in the frontend.
    """

    id: UUID
    council_id: UUID
    created_at: datetime
    minutes: Optional[str] = None
    attendees: list[str] = []
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VoteCastRequest(BaseModel):
    choice: str = Field(..., pattern="^(yes|no|abstain)$")


class VotingItemResponse(BaseModel):
    id: str
    title: str
    description: str
    assembly_id: str
    yes_count: int
    no_count: int
    abstain_count: int
    total_votes: int
    status: str
    user_vote: Optional[str] = None
