from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.infra.database import get_db
from src.api.auth import get_current_user
from src.infra.models import User
from src.services.financial_service import FinancialService
from src.domain.schemas import (
    FinancialAccountCreate, FinancialAccountResponse,
    TransactionCategoryCreate, TransactionCategoryResponse,
    TransactionCreate, TransactionResponse
)

router = APIRouter(prefix="/financial", tags=["Financial - Treasury"])

@router.post("/accounts", response_model=FinancialAccountResponse)
async def create_account(
    data: FinancialAccountCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FinancialService(db)
    return await service.create_account(tenant_id, data)

@router.get("/accounts", response_model=List[FinancialAccountResponse])
async def list_accounts(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FinancialService(db)
    return await service.list_accounts(tenant_id)

@router.post("/categories", response_model=TransactionCategoryResponse)
async def create_category(
    data: TransactionCategoryCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FinancialService(db)
    return await service.create_category(tenant_id, data)

@router.get("/categories", response_model=List[TransactionCategoryResponse])
async def list_categories(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FinancialService(db)
    return await service.list_categories(tenant_id)

@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    data: TransactionCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FinancialService(db)
    return await service.create_transaction(tenant_id, data)

@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FinancialService(db)
    return await service.list_transactions(tenant_id)
