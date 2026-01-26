"""
Schemas for Tithe/Offering records.
"""

from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TitheType(str, Enum):
    DIZIMO = "DIZIMO"
    OFERTA = "OFERTA"


class TitheStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class TitheRecordCreate(BaseModel):
    """Schema for creating a tithe record."""

    amount: float = Field(..., gt=0, description="Valor do dízimo/oferta")
    tithe_type: TitheType = Field(..., alias="type", description="Tipo: DIZIMO ou OFERTA")
    tithe_date: date = Field(..., alias="date", description="Data do dízimo/oferta")
    notes: Optional[str] = Field(None, max_length=500, description="Observações")
    attachment_url: Optional[str] = Field(None, description="URL do comprovante")

    model_config = {"populate_by_name": True}


class TitheRecordUpdate(BaseModel):
    """Schema for updating a tithe record (before approval)."""

    amount: Optional[float] = Field(None, gt=0)
    tithe_type: Optional[TitheType] = Field(None, alias="type")
    tithe_date: Optional[date] = Field(None, alias="date")
    notes: Optional[str] = Field(None, max_length=500)
    attachment_url: Optional[str] = None

    model_config = {"populate_by_name": True}


class TitheRecordApprove(BaseModel):
    """Schema for approving/rejecting a tithe record."""

    status: TitheStatus = Field(..., description="APPROVED ou REJECTED")
    rejection_reason: Optional[str] = Field(None, max_length=500, description="Motivo da rejeição")


class TitheRecordResponse(BaseModel):
    """Schema for tithe record response."""

    id: UUID
    tenant_id: str
    member_id: str
    member_name: Optional[str] = None
    amount: float
    tithe_type: TitheType = Field(alias="type")
    tithe_date: date = Field(alias="date")
    status: TitheStatus
    notes: Optional[str] = None
    attachment_url: Optional[str] = None
    rejection_reason: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"populate_by_name": True, "from_attributes": True}


class TitheSummary(BaseModel):
    """Summary of tithes for a member in a period."""

    total_dizimo: float = 0.0
    total_oferta: float = 0.0
    total: float = 0.0
    count_dizimo: int = 0
    count_oferta: int = 0
    count_pending: int = 0
    year: int
