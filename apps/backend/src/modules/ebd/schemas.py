from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class EBDClassBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    location: Optional[str] = None

class EBDClassCreate(EBDClassBase):
    pass

class EBDClassResponse(EBDClassBase):
    id: UUID
    tenant_id: UUID

    class Config:
        from_attributes = True

class EBDStudentBase(BaseModel):
    member_id: UUID
    role: str = "STUDENT"

class EBDStudentCreate(EBDStudentBase):
    pass

class EBDStudentResponse(EBDStudentBase):
    id: UUID
    ebd_class_id: UUID
    enrolled_at: datetime
    # We might want member details here later

    class Config:
        from_attributes = True

class EBDLessonBase(BaseModel):
    date: date
    topic: str
    description: Optional[str] = None
    homework_url: Optional[str] = None

class EBDLessonCreate(EBDLessonBase):
    ebd_class_id: UUID

class EBDLessonResponse(EBDLessonBase):
    id: UUID
    ebd_class_id: UUID

    class Config:
        from_attributes = True
