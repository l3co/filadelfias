"""
Schemas for Expense Request module.
"""

from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ExpenseStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ExpenseCategory(str, Enum):
    MATERIAL = "MATERIAL"  # Material de escritório, didático
    CLEANING = "CLEANING"  # Material de limpeza
    TRANSPORT = "TRANSPORT"  # Transporte, combustível
    FOOD = "FOOD"  # Alimentação para eventos
    MAINTENANCE = "MAINTENANCE"  # Manutenção predial
    UTILITIES = "UTILITIES"  # Contas (água, luz, internet)
    OTHER = "OTHER"  # Outros


class ExpenseRequestCreate(BaseModel):
    """Schema for creating an expense request."""

    amount: float = Field(..., gt=0, description="Expense amount")
    category: ExpenseCategory = Field(..., description="Expense category")
    description: str = Field(..., min_length=3, max_length=500, description="Description of the expense")
    expense_date: date = Field(..., description="Date when the expense occurred")
    receipt_url: Optional[str] = Field(None, description="URL to receipt image/document")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class ExpenseRequestApprove(BaseModel):
    """Schema for approving/rejecting an expense request."""

    status: ExpenseStatus = Field(..., description="New status (APPROVED or REJECTED)")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection")


class ExpenseRequestResponse(BaseModel):
    """Schema for expense request response."""

    id: str
    member_id: str
    member_name: Optional[str] = None
    amount: float
    category: str
    description: str
    expense_date: str
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: str
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    transaction_id: Optional[str] = None

    class Config:
        from_attributes = True
