"""
Database models using SQLAlchemy ORM.
"""
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, JSON, Date, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from src.infra.base import Base
from src.modules.financial.models import FinancialAccount, TransactionCategory, Transaction
from src.modules.missions.models import Missionary
from src.modules.ebd.models import EBDClass, EBDStudent, EBDLesson
from src.modules.governance.models import Council, Meeting, MeetingMinute, CouncilMember


class User(Base):
    """
    Global user model.
    A user exists in the platform independently of any church.
    """
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Password management
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_reset_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    memberships: Mapped[list["UserChurchMembership"]] = relationship(
        back_populates="user", 
        foreign_keys="UserChurchMembership.user_id",
        cascade="all, delete-orphan"
    )
    member_profile: Mapped[list["Member"]] = relationship(back_populates="user")


class Tenant(Base):
    """
    Church/Organization model (Multi-tenant).
    Each tenant represents a church using the platform.
    """
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Structured Address
    street: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    complement: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    neighborhood: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)  # UF
    postal_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # CEP
    country: Mapped[str] = mapped_column(String(50), default="Brasil", nullable=False)
    
    # Geolocation
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    
    # Contact
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Settings
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    memberships: Mapped[list["UserChurchMembership"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )
    members: Mapped[list["Member"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )
    councils: Mapped[list["Council"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )
    accounts: Mapped[list["FinancialAccount"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )
    categories: Mapped[list["TransactionCategory"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )
    missionaries: Mapped[list["Missionary"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )
    ebd_classes: Mapped[list["EBDClass"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )


class UserChurchMembership(Base):
    """
    Association between User and Church with role.
    A user can be associated with multiple churches with different roles.
    """
    __tablename__ = "user_church_memberships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), default="ATTENDEE", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    invited_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="memberships", foreign_keys=[user_id])
    tenant: Mapped["Tenant"] = relationship(back_populates="memberships")

    __table_args__ = (
        # Unique constraint: a user can only have one membership per church
        {"schema": None},
    )


class Member(Base):
    """
    Church Member model.
    Represents a person associated with a Tenant (Church).
    """
    __tablename__ = "members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    
    # Personal Info
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    birth_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    marital_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    marriage_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    spouse_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Structured Address
    street: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    complement: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    neighborhood: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)  # UF
    postal_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # CEP
    
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Ecclesiastical Info
    status: Mapped[str] = mapped_column(String(50), default="COMUNGANTE", nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="MEMBRO", nullable=False)  # Deprecated, use office
    office: Mapped[str] = mapped_column(String(50), default="MEMBRO", nullable=False)  # MEMBRO, DIACONO, PRESBITERO, PASTOR
    functions: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # ["TESOUREIRO", "SECRETARIO"]
    baptism_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    profession_of_faith_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    admission_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    admission_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # PROFISSAO_FE, TRANSFERENCIA, JURISDICAO
    origin_church: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    tenant: Mapped["Tenant"] = relationship(back_populates="members")
    user: Mapped[Optional["User"]] = relationship(back_populates="member_profile")











# --- Education (EBD) Models ---





