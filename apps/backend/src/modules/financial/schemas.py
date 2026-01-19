from uuid import UUID
from datetime import datetime, date
from typing import Optional
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
    type: str # INCOME, EXPENSE
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
    type: str # CREDIT, DEBIT
    description: str
    date: date
    attachment_url: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    category: Optional[TransactionCategoryResponse] = None
    account: Optional[FinancialAccountResponse] = None
    
    class Config:
        from_attributes = True
