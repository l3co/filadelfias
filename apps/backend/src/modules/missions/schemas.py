from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MissionaryBase(BaseModel):
    name: str = Field(..., min_length=1)
    field_name: str
    country_code: str = Field(..., min_length=2, max_length=2)
    latitude: float
    longitude: float
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    newsletter_url: Optional[str] = None


class MissionaryCreate(MissionaryBase):
    pass


class MissionaryResponse(MissionaryBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
