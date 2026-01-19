"""
Pydantic schemas for authentication and user management.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID

from src.modules.financial.schemas import (
    FinancialAccountBase, FinancialAccountCreate, FinancialAccountResponse,
    TransactionCategoryCreate, TransactionCategoryResponse,
    TransactionCreate, TransactionResponse
)
from src.modules.missions.schemas import MissionaryBase, MissionaryCreate, MissionaryResponse
from src.modules.ebd.schemas import (
    EBDClassBase, EBDClassCreate, EBDClassResponse,
    EBDStudentBase, EBDStudentCreate, EBDStudentResponse,
    EBDLessonBase, EBDLessonCreate, EBDLessonResponse
)
from src.modules.governance.schemas import (
    CouncilBase, CouncilCreate, CouncilResponse,
    MeetingBase, MeetingCreate, MeetingResponse
)
from .enums import MemberStatus, EcclesiasticalRole, Gender, MaritalStatus


class TenantResponse(BaseModel):
    """Schema for tenant response."""
    id: UUID
    name: str
    slug: str
    logo_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class MembershipResponse(BaseModel):
    """Schema for membership response."""
    id: UUID
    tenant: TenantResponse
    role: str
    status: str
    joined_at: datetime
    
    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response."""
    id: UUID
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    memberships: List[MembershipResponse] = []

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    user_id: Optional[UUID] = None
    email: Optional[str] = None


# --- Member Schemas ---

class MemberBase(BaseModel):
    """Base schema for church members."""
    full_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    address: Optional[str] = None
    
    # Ecclesiastical data
    status: MemberStatus = MemberStatus.Comungante
    role: EcclesiasticalRole = EcclesiasticalRole.Membro
    baptism_date: Optional[date] = None


class MemberCreate(MemberBase):
    """Schema for creating a new member."""
    pass


class MemberUpdate(BaseModel):
    """Schema for updating a member."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    address: Optional[str] = None
    status: Optional[MemberStatus] = None
    role: Optional[EcclesiasticalRole] = None
    baptism_date: Optional[date] = None


class MemberResponse(MemberBase):
    """Schema for member response."""
    id: UUID
    tenant_id: UUID
    user_id: Optional[UUID] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Governance Schemas ---




# --- Financial Schemas ---



# --- Missionary Schemas ---




# --- EBD Schemas ---





