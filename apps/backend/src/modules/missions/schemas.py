from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CountryCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=10)
    name: str = Field(..., min_length=1)


class CountryResponse(BaseModel):
    id: str
    code: str
    name: str
    tenant_id: str
    created_at: datetime


class MissionaryBase(BaseModel):
    name: str = Field(..., min_length=1)
    field_name: str
    country_code: str = Field(..., min_length=2, max_length=10)
    state: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    newsletter_url: Optional[str] = None


class MissionaryCreate(MissionaryBase):
    pass


class MissionaryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    field_name: Optional[str] = None
    country_code: Optional[str] = Field(default=None, min_length=2, max_length=10)
    state: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    newsletter_url: Optional[str] = None


class MissionaryResponse(MissionaryBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SocialProjectBase(BaseModel):
    title: str = Field(..., min_length=1)
    summary: str = Field(..., min_length=1)
    location: Optional[str] = None
    status: str = Field(default="PLANNING", min_length=1, max_length=50)
    target_audience: Optional[str] = None
    coordinator_name: Optional[str] = None
    contact_info: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SocialProjectCreate(SocialProjectBase):
    pass


class SocialProjectResponse(SocialProjectBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
