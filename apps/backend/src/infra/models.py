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
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
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
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Ecclesiastical Info
    status: Mapped[str] = mapped_column(String(50), default="COMUNGANTE", nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="MEMBRO", nullable=False)
    baptism_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    tenant: Mapped["Tenant"] = relationship(back_populates="members")
    user: Mapped[Optional["User"]] = relationship(back_populates="member_profile")


class Council(Base):
    """
    Council model (e.g. Session, Board of Deacons, Assembly).
    Represents a governing body or committee within the church.
    """
    __tablename__ = "councils"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # SESSION, DEACONS, ASSEMBLY, COMMITTEE
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    tenant: Mapped["Tenant"] = relationship(back_populates="councils")
    members: Mapped[list["CouncilMember"]] = relationship(
        back_populates="council", cascade="all, delete-orphan"
    )
    meetings: Mapped[list["Meeting"]] = relationship(
        back_populates="council", cascade="all, delete-orphan"
    )


class CouncilMember(Base):
    """
    Association between Member and Council with a specific role and term.
    """
    __tablename__ = "council_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    council_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("councils.id", ondelete="CASCADE"), nullable=False
    )
    member_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. PRESIDENT, SECRETARY, MEMBER
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # Relationships
    council: Mapped["Council"] = relationship(back_populates="members")
    member: Mapped["Member"] = relationship()


class Meeting(Base):
    """
    Meeting model (e.g. Session Meeting, General Assembly).
    """
    __tablename__ = "meetings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    council_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("councils.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED", nullable=False) # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELED
    agenda: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    council: Mapped["Council"] = relationship(back_populates="meetings")
    minute: Mapped[Optional["MeetingMinute"]] = relationship(
        back_populates="meeting", uselist=False, cascade="all, delete-orphan"
    )


class MeetingMinute(Base):
    """
    Minutes of a meeting. Contains the official record.
    """
    __tablename__ = "meeting_minutes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False) # HTML/Rich Text content
    status: Mapped[str] = mapped_column(String(50), default="DRAFT", nullable=False) # DRAFT, APPROVED, PUBLISHED
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    meeting: Mapped["Meeting"] = relationship(back_populates="minute")





class Missionary(Base):
    """
    Missionary supported by the church.
    """
    __tablename__ = "missionaries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    field_name: Mapped[str] = mapped_column(String(255), nullable=False) # e.g. "Sertão", "Mozambique"
    country_code: Mapped[str] = mapped_column(String(2), nullable=False) # ISO 2 chars (BR, MZ)
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)
    
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    newsletter_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    
    # Relationships
    tenant: Mapped["Tenant"] = relationship(back_populates="missionaries")


# --- Education (EBD) Models ---

class EBDClass(Base):
    __tablename__ = "ebd_classes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    min_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # Sala 101
    
    # Relationships
    tenant: Mapped["Tenant"] = relationship(back_populates="ebd_classes")
    students: Mapped[list["EBDStudent"]] = relationship(back_populates="ebd_class", cascade="all, delete-orphan")
    lessons: Mapped[list["EBDLesson"]] = relationship(back_populates="ebd_class", cascade="all, delete-orphan")


class EBDStudent(Base):
    """Enrollment of a Member in an EBD Class."""
    __tablename__ = "ebd_students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ebd_class_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ebd_classes.id", ondelete="CASCADE"), nullable=False)
    member_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="STUDENT") # STUDENT, TEACHER
    
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ebd_class: Mapped["EBDClass"] = relationship(back_populates="students")
    member: Mapped["Member"] = relationship()


class EBDLesson(Base):
    __tablename__ = "ebd_lessons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ebd_class_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ebd_classes.id", ondelete="CASCADE"), nullable=False)
    
    date: Mapped[date] = mapped_column(Date, nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    homework_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    ebd_class: Mapped["EBDClass"] = relationship(back_populates="lessons")



