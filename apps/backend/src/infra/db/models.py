"""
Core relational models for the PostgreSQL migration.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infra.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    password_reset_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    memberships: Mapped[list["MembershipModel"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    members: Mapped[list["MemberModel"]] = relationship(back_populates="user")


class TenantModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    street: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    complement: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    neighborhood: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="Brasil", nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    longitude: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    memberships: Mapped[list["MembershipModel"]] = relationship(
        back_populates="tenant",
        cascade="all, delete-orphan",
    )
    members: Mapped[list["MemberModel"]] = relationship(
        back_populates="tenant",
        cascade="all, delete-orphan",
    )


class MembershipModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("user_id", "tenant_id", name="uq_memberships_user_id_tenant_id"),)

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), default="ATTENDEE", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    invited_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped["UserModel"] = relationship(back_populates="memberships")
    tenant: Mapped["TenantModel"] = relationship(back_populates="memberships")


class MemberModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "members"
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_members_tenant_id_email"),
        UniqueConstraint("tenant_id", "user_id", name="uq_members_tenant_id_user_id"),
    )

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    birth_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    marital_status: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    marriage_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    spouse_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    street: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    complement: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    neighborhood: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="COMUNGANTE", nullable=False)
    office: Mapped[str] = mapped_column(String(50), default="MEMBRO", nullable=False)
    system_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    functions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    baptism_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    profession_of_faith_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    admission_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    admission_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    origin_church: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    tenant: Mapped["TenantModel"] = relationship(back_populates="members")
    user: Mapped[Optional["UserModel"]] = relationship(back_populates="members")


class EventModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "events"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    all_day: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class PrayerRequestModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "prayer_requests"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    member_id: Mapped[str] = mapped_column(String(255), nullable=False)
    missionary_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    social_project_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="other", nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    prayer_count: Mapped[int] = mapped_column(default=0, nullable=False)
    prayed_by: Mapped[str] = mapped_column(Text, default="[]", nullable=False)


class DevotionalModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "devotionals"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    verse_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    verse_text: Mapped[str] = mapped_column(Text, nullable=False)
    meditation: Mapped[str] = mapped_column(Text, nullable=False)
    reflection: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prayer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class CountryModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "countries"
    __table_args__ = (UniqueConstraint("tenant_id", "code", name="uq_countries_tenant_id_code"),)

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)


class MissionaryModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "missionaries"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    field_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country_code: Mapped[str] = mapped_column(String(10), nullable=False)
    state: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    longitude: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    newsletter_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class SocialProjectModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "social_projects"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="PLANNING", index=True)
    target_audience: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    coordinator_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)


class ExpenseRequestModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "expense_requests"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    member_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    expense_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    receipt_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False, index=True)
    approved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    transaction_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class TitheRecordModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tithe_records"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    member_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False, index=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attachment_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    transaction_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class FinancialAccountModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "financial_accounts"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="BANK", nullable=False)
    balance: Mapped[float] = mapped_column(nullable=False, default=0.0)


class TransactionCategoryModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "transaction_categories"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    parent_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("transaction_categories.id", ondelete="SET NULL"), nullable=True
    )


class TransactionModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "transactions"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    account_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("financial_accounts.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    category_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("transaction_categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    member_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    amount: Mapped[float] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    attachment_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class AssetModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "assets"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    condition: Mapped[str] = mapped_column(String(50), nullable=False, default="GOOD", index=True)
    quantity: Mapped[int] = mapped_column(nullable=False, default=1)
    purchase_value: Mapped[Optional[float]] = mapped_column(nullable=True)
    acquired_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class CouncilModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "councils"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    member_ids: Mapped[str] = mapped_column(Text, nullable=False, default="[]")


class MeetingModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "meetings"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    council_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("councils.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="SCHEDULED")
    agenda: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meeting_type: Mapped[str] = mapped_column(String(50), nullable=False, default="ORDINARY")
    minutes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attendees: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class EBDClassModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ebd_classes"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    min_age: Mapped[Optional[int]] = mapped_column(nullable=True)
    max_age: Mapped[Optional[int]] = mapped_column(nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class EBDStudentModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ebd_students"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ebd_class_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("ebd_classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    member_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="STUDENT")
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )


class EBDLessonModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ebd_lessons"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ebd_class_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("ebd_classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    homework_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bible_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class EBDCommentModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ebd_comments"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ebd_class_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("ebd_classes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lesson_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("ebd_lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    member_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    parent_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("ebd_comments.id", ondelete="CASCADE"), nullable=True
    )


class BibleVersionModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_versions"

    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    books: Mapped[list["BibleBookModel"]] = relationship(
        back_populates="version",
        cascade="all, delete-orphan",
    )


class BibleBookModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_books"
    __table_args__ = (UniqueConstraint("version_id", "abbrev", name="uq_bible_books_version_id_abbrev"),)

    version_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bible_versions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    abbrev: Mapped[str] = mapped_column(String(10), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    testament: Mapped[str] = mapped_column(String(10), nullable=False)
    book_order: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    version: Mapped["BibleVersionModel"] = relationship(back_populates="books")
    chapters: Mapped[list["BibleChapterModel"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan",
    )


class BibleChapterModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_chapters"
    __table_args__ = (UniqueConstraint("book_id", "chapter_number", name="uq_bible_chapters_book_id_chapter_number"),)

    book_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bible_books.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chapter_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    book: Mapped["BibleBookModel"] = relationship(back_populates="chapters")
    verses: Mapped[list["BibleVerseModel"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
        order_by="BibleVerseModel.verse_number",
    )


class BibleVerseModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_verses"
    __table_args__ = (UniqueConstraint("chapter_id", "verse_number", name="uq_bible_verses_chapter_id_verse_number"),)

    chapter_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bible_chapters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    verse_number: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    chapter: Mapped["BibleChapterModel"] = relationship(back_populates="verses")


class BibleNoteModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_notes"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_code: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    book_abbrev: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    chapter: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    verse: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class BibleHighlightModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_highlights"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "tenant_id",
            "version_code",
            "book_abbrev",
            "chapter",
            "verse",
            name="uq_bible_highlights_user_id_tenant_id",
        ),
    )

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_code: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    book_abbrev: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    chapter: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    verse: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    color: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class ReadingPlanModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reading_plans"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    creator_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    readings: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)


class UserReadingProgressModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "user_reading_progress"
    __table_args__ = (UniqueConstraint("user_id", "plan_id", name="uq_user_reading_progress_user_id_plan_id"),)

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("reading_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    current_day: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    completed_readings: Mapped[list[int]] = mapped_column(JSONB, nullable=False, default=list)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
