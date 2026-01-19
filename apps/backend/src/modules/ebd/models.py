import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from src.infra.base import Base

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
