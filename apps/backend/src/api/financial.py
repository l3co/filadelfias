from typing import List

from fastapi import APIRouter, Depends, Query

from src.middleware.permissions import (
    require_create_financial,
    require_manage_financial,
    require_view_financial,
)
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
    auth_context: dict = Depends(require_manage_financial),
):
    """
    Create a new financial account.
    Requires: Tesoureiro or leadership (financial:manage permission).
    """
    return await financial_account_repository.create_account(
        tenant_id=tenant_id,
        name=data.name,
        type=data.type,
        balance=float(data.balance) if data.balance else 0.0,
    )


@router.get("/accounts", response_model=List[FinancialAccountResponse])
async def list_accounts(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List all financial accounts.
    Requires: Pastor, Presbítero, Diácono or Tesoureiro (financial:view permission).
    """
    return await financial_account_repository.get_all(tenant_id)


@router.post("/categories", response_model=TransactionCategoryResponse)
async def create_category(
    data: TransactionCategoryCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_manage_financial),
):
    """
    Create a new transaction category.
    Requires: Tesoureiro or leadership (financial:manage permission).
    """
    return await transaction_category_repository.create_category(
        tenant_id=tenant_id,
        name=data.name,
        type=data.type,
        parent_id=str(data.parent_id) if data.parent_id else None,
    )


@router.get("/categories", response_model=List[TransactionCategoryResponse])
async def list_categories(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List all transaction categories.
    Requires: financial:view permission.
    """
    return await transaction_category_repository.get_all(tenant_id)


@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    data: TransactionCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_financial),
):
    """
    Create a new transaction (income or expense).
    Requires: Pastor, Presbítero or Tesoureiro (financial:create permission).
    """
    return await transaction_repository.create_transaction(
        tenant_id=tenant_id,
        account_id=str(data.account_id),
        category_id=str(data.category_id) if data.category_id else None,
        amount=float(data.amount),
        transaction_type=data.type,
        transaction_date=data.date,
        description=data.description,
        member_id=str(data.member_id) if data.member_id else None,
        attachment_url=data.attachment_url,
    )


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List all transactions.
    Requires: financial:view permission.
    """
    return await transaction_repository.get_all(tenant_id)
