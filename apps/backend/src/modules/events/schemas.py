from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    all_day: bool = False
    category: Optional[str] = None  # culto, reuniao, evento_social, conferencia, etc


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    all_day: Optional[bool] = None
    category: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    all_day: bool = False
    category: Optional[str] = None
    created_at: datetime
    updated_at: datetime
