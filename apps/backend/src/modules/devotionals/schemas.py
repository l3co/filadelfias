from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class DevotionalCreate(BaseModel):
    title: str
    date: date
    verse_reference: str  # Ex: "João 3:16"
    verse_text: str
    meditation: str
    reflection: Optional[str] = None
    prayer: Optional[str] = None
    author: Optional[str] = None


class DevotionalUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[date] = None
    verse_reference: Optional[str] = None
    verse_text: Optional[str] = None
    meditation: Optional[str] = None
    reflection: Optional[str] = None
    prayer: Optional[str] = None
    author: Optional[str] = None


class DevotionalResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    date: date
    verse_reference: str
    verse_text: str
    meditation: str
    reflection: Optional[str] = None
    prayer: Optional[str] = None
    author: Optional[str] = None
    created_at: datetime
    updated_at: datetime
