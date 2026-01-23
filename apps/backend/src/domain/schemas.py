"""
Pydantic schemas for authentication and user management.
"""

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from src.domain.validators import validate_password_strength

from .enums import EcclesiasticalFunction, EcclesiasticalOffice, EcclesiasticalRole, Gender, MaritalStatus, MemberStatus


class TenantBase(BaseModel):
    """Base schema for tenant."""

    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=100)


class TenantResponse(TenantBase):
    """Schema for tenant response."""

    id: UUID
    logo_url: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Brasil"
    phone: Optional[str] = None
    email: Optional[str] = None

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


class MembershipUpdateRole(BaseModel):
    """Schema for updating membership role."""

    role: str = Field(..., pattern="^(ADMIN|MEMBER)$")


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """Schema for user registration."""

    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        return validate_password_strength(v)


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
    marriage_date: Optional[date] = None
    spouse_name: Optional[str] = None

    # Structured Address
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None

    # Ecclesiastical data
    status: MemberStatus = MemberStatus.Comungante
    role: EcclesiasticalRole = EcclesiasticalRole.Membro  # Deprecated
    office: EcclesiasticalOffice = EcclesiasticalOffice.Membro
    functions: Optional[List[EcclesiasticalFunction]] = None
    baptism_date: Optional[date] = None
    profession_of_faith_date: Optional[date] = None
    admission_date: Optional[date] = None
    admission_type: Optional[str] = None
    origin_church: Optional[str] = None


class MemberCreate(MemberBase):
    """Schema for creating a new member."""

    pass


class MemberUpdate(BaseModel):
    """Schema for updating a member."""

    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    marriage_date: Optional[date] = None
    spouse_name: Optional[str] = None

    # Structured Address
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None

    status: Optional[str] = None
    role: Optional[str] = None  # Deprecated
    office: Optional[str] = None
    functions: Optional[List[str]] = None
    baptism_date: Optional[date] = None
    profession_of_faith_date: Optional[date] = None
    admission_date: Optional[date] = None
    admission_type: Optional[str] = None
    origin_church: Optional[str] = None


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


# --- Church Registration Schemas ---


class ChurchRegistrationRequest(BaseModel):
    """Schema for church + admin registration via wizard."""

    # Church info
    church_name: str = Field(..., min_length=2, max_length=255)
    church_slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")

    # Address
    street: str = Field(..., min_length=1)
    number: str = Field(..., min_length=1)
    complement: Optional[str] = None
    neighborhood: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=2, max_length=2)
    postal_code: str = Field(..., min_length=8, max_length=10)

    # Admin info
    admin_name: str = Field(..., min_length=1, max_length=255)
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=8, max_length=100)
    admin_phone: Optional[str] = None

    @field_validator("admin_password")
    @classmethod
    def validate_password(cls, v):
        return validate_password_strength(v)


class ChurchRegistrationResponse(BaseModel):
    """Response for church registration."""

    tenant: TenantResponse
    user: "UserResponse"
    access_token: str
    token_type: str = "bearer"


# --- Governance Schemas ---


# --- Financial Schemas ---


# --- Missionary Schemas ---


# --- EBD Schemas ---
