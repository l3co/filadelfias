from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PrayerRequestCreate(BaseModel):
    content: str
    category: str = "other"  # health, family, work, spiritual, other
    is_anonymous: bool = False


class PrayerRequestUpdate(BaseModel):
    content: Optional[str] = None
    category: Optional[str] = None


class PrayerRequestResponse(BaseModel):
    id: str
    tenant_id: str
    member_id: str
    author_name: str
    content: str
    category: str
    is_anonymous: bool
    prayer_count: int
    prayed_by: list[str] = []
    created_at: datetime
    updated_at: datetime
