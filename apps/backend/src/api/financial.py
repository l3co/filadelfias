from typing import List

from fastapi import APIRouter, Depends, Query

from src.api.auth import get_current_user
from src.infra.repositories import (
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
    return await financial_account_repository.create_account(
        tenant_id=tenant_id,
        name=data.name,
        account_type=data.account_type,
        initial_balance=float(data.initial_balance) if data.initial_balance else 0.0,
        description=data.description,
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
    return await transaction_category_repository.create_category(
        tenant_id=tenant_id,
        name=data.name,
        category_type=data.category_type,
        description=data.description,
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
    return await transaction_repository.create_transaction(
        tenant_id=tenant_id,
        account_id=str(data.account_id),
        category_id=str(data.category_id),
        amount=float(data.amount),
        transaction_type=data.transaction_type,
        transaction_date=data.transaction_date,
        description=data.description,
        reference=data.reference,
    )


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    return await transaction_repository.get_all(tenant_id)
