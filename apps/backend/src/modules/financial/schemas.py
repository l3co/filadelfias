from datetime import date, datetime
from typing import Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field


class FinancialAccountBase(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = "BANK"
    balance: float = 0.0


class FinancialAccountCreate(FinancialAccountBase):
    pass


class FinancialAccountResponse(FinancialAccountBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionCategoryBase(BaseModel):
    name: str
    type: str  # INCOME, EXPENSE
    parent_id: Optional[UUID] = None


class TransactionCategoryCreate(TransactionCategoryBase):
    pass


class TransactionCategoryResponse(TransactionCategoryBase):
    id: UUID
    tenant_id: UUID

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    account_id: UUID
    category_id: Optional[UUID] = None
    member_id: Optional[UUID] = None
    amount: float
    type: str  # CREDIT, DEBIT
    description: str
    date: date
    attachment_url: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    category: Optional[Union[TransactionCategoryResponse, str]] = None
    account: Optional[Union[FinancialAccountResponse, str]] = None

    class Config:
        from_attributes = True


class AssetBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = None
    condition: str = Field(default="GOOD", min_length=1, max_length=50)
    quantity: int = Field(default=1, ge=1)
    purchase_value: Optional[float] = Field(default=None, ge=0)
    acquired_date: Optional[date] = None
    notes: Optional[str] = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    location: Optional[str] = None
    condition: Optional[str] = Field(default=None, min_length=1, max_length=50)
    quantity: Optional[int] = Field(default=None, ge=1)
    purchase_value: Optional[float] = Field(default=None, ge=0)
    acquired_date: Optional[date] = None
    notes: Optional[str] = None


class AssetResponse(AssetBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MonthlyReportBreakdownItem(BaseModel):
    category: str
    amount: float
    count: int


class MonthlyReportAccountBalance(BaseModel):
    id: str
    name: str
    type: str
    balance: float


class MonthlyReportResponse(BaseModel):
    month: int
    year: int
    total_income: float
    total_expenses: float
    net_balance: float
    transaction_count: int
    income_breakdown: list[MonthlyReportBreakdownItem]
    expense_breakdown: list[MonthlyReportBreakdownItem]
    accounts: list[MonthlyReportAccountBalance]
    pending_tithes: int
    pending_expenses: int
