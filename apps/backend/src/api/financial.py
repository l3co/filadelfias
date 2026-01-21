from typing import List

from fastapi import APIRouter, Depends, Query

from src.api.auth import get_current_user
from src.modules.financial.repository import (
    financial_account_repository,
    transaction_category_repository,
    transaction_repository,
)
from src.modules.financial.schemas import (
    FinancialAccountCreate,
    FinancialAccountResponse,
    TransactionCategoryCreate,
    TransactionCategoryResponse,
    TransactionCreate,
    TransactionResponse,
)

router = APIRouter(prefix="/financial", tags=["Financial - Treasury"])


@router.post("/accounts", response_model=FinancialAccountResponse)
async def create_account(
    data: FinancialAccountCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    # Schema uses 'type' and 'balance'
    return await financial_account_repository.create_account(
        tenant_id=tenant_id,
        name=data.name,
        type=data.type,
        balance=float(data.balance) if data.balance else 0.0,
        # description not in schema base, checking schema...
        # Schema FinancialAccountBase: name, type, balance. No description.
        # So providing description will depend on Repo kwargs, ok.
    )


@router.get("/accounts", response_model=List[FinancialAccountResponse])
async def list_accounts(
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    return await financial_account_repository.get_all(tenant_id)


@router.post("/categories", response_model=TransactionCategoryResponse)
async def create_category(
    data: TransactionCategoryCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    # Schema TransactionCategoryBase: name, type, parent_id.
    return await transaction_category_repository.create_category(
        tenant_id=tenant_id,
        name=data.name,
        type=data.type,
        parent_id=str(data.parent_id) if data.parent_id else None,
    )


@router.get("/categories", response_model=List[TransactionCategoryResponse])
async def list_categories(
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    return await transaction_category_repository.get_all(tenant_id)


@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    data: TransactionCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    # Schema TransactionBase: account_id, amount, type, description, date...
    return await transaction_repository.create_transaction(
        tenant_id=tenant_id,
        account_id=str(data.account_id),
        category_id=str(data.category_id) if data.category_id else None,
        amount=float(data.amount),
        transaction_type=data.type,  # Schema uses 'type'
        transaction_date=data.date,  # Schema uses 'date'
        description=data.description,
        # reference not in schema base.
        member_id=str(data.member_id) if data.member_id else None,
        attachment_url=data.attachment_url,
    )


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    return await transaction_repository.get_all(tenant_id)
