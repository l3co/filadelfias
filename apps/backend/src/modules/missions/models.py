import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from src.infra.base import Base

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
