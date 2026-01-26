"""
API endpoints for Tithe/Offering records.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from src.api.auth import get_current_user
from src.infra.repositories.member_repository import member_repository
from src.middleware.permissions import require_view_financial
from src.modules.financial.repository import transaction_category_repository, transaction_repository
from src.modules.tithe.repository import tithe_record_repository
from src.modules.tithe.schemas import (
    TitheRecordApprove,
    TitheRecordCreate,
    TitheRecordResponse,
    TitheSummary,
)

router = APIRouter(prefix="/tithe", tags=["Tithe - Dízimos e Ofertas"])


@router.post("/records", response_model=TitheRecordResponse)
async def submit_tithe_record(
    data: TitheRecordCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(get_current_user),
):
    """
    Submit a new tithe/offering record.
    Any authenticated member can submit their own records.
    """
    user_id = auth_context.get("id")

    # Find member_id for this specific tenant
    member = await member_repository.get_by_user_id(tenant_id, user_id)
    if not member:
        raise HTTPException(status_code=400, detail="Usuário não está vinculado a um membro nesta igreja")

    member_id = member.get("id")

    record = await tithe_record_repository.create(
        tenant_id=tenant_id,
        member_id=member_id,
        amount=data.amount,
        type=data.tithe_type.value,
        date=data.tithe_date,
        notes=data.notes,
        attachment_url=data.attachment_url,
    )

    return record


@router.get("/records/me", response_model=List[TitheRecordResponse])
async def list_my_tithe_records(
    tenant_id: str = Query(..., description="ID of the tenant"),
    year: Optional[int] = Query(None, description="Filter by year"),
    auth_context: dict = Depends(get_current_user),
):
    """
    List my own tithe/offering records.
    """
    user_id = auth_context.get("id")
    member = await member_repository.get_by_user_id(tenant_id, user_id)
    if not member:
        raise HTTPException(status_code=400, detail="Usuário não está vinculado a um membro nesta igreja")
    member_id = member.get("id")

    if year is None:
        year = datetime.now().year

    return await tithe_record_repository.get_by_member(tenant_id, member_id, year)


@router.get("/records/me/summary", response_model=TitheSummary)
async def get_my_tithe_summary(
    tenant_id: str = Query(..., description="ID of the tenant"),
    year: Optional[int] = Query(None, description="Year for summary"),
    auth_context: dict = Depends(get_current_user),
):
    """
    Get summary of my tithes/offerings for a year.
    """
    user_id = auth_context.get("id")
    member = await member_repository.get_by_user_id(tenant_id, user_id)
    if not member:
        raise HTTPException(status_code=400, detail="Usuário não está vinculado a um membro nesta igreja")
    member_id = member.get("id")

    if year is None:
        year = datetime.now().year

    return await tithe_record_repository.get_summary(tenant_id, member_id, year)


@router.delete("/records/{record_id}")
async def delete_my_tithe_record(
    record_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(get_current_user),
):
    """
    Delete my own pending tithe record.
    Only pending records can be deleted.
    """
    user_id = auth_context.get("id")
    member = await member_repository.get_by_user_id(tenant_id, user_id)
    if not member:
        raise HTTPException(status_code=400, detail="Usuário não está vinculado a um membro nesta igreja")
    member_id = member.get("id")

    record = await tithe_record_repository.get(tenant_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Registro não encontrado")

    if record.get("member_id") != member_id:
        raise HTTPException(status_code=403, detail="Você não pode excluir registros de outros membros")

    if record.get("status") != "PENDING":
        raise HTTPException(status_code=400, detail="Apenas registros pendentes podem ser excluídos")

    await tithe_record_repository.delete(tenant_id, record_id)
    return {"success": True, "message": "Registro excluído com sucesso"}


@router.get("/records/pending", response_model=List[TitheRecordResponse])
async def list_pending_tithe_records(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List all pending tithe records for approval.
    Requires: Tesoureiro or leadership (financial:view permission).
    """
    records = await tithe_record_repository.get_pending(tenant_id)

    for record in records:
        member = await member_repository.get(tenant_id, record.get("member_id"))
        record["member_name"] = member.get("full_name") if member else "Desconhecido"

    return records


@router.get("/records", response_model=List[TitheRecordResponse])
async def list_all_tithe_records(
    tenant_id: str = Query(..., description="ID of the tenant"),
    year: Optional[int] = Query(None, description="Filter by year"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List all tithe records.
    Requires: Tesoureiro or leadership (financial:view permission).
    """
    if year is None:
        year = datetime.now().year

    records = await tithe_record_repository.get_all(tenant_id, year)

    for record in records:
        member = await member_repository.get(tenant_id, record.get("member_id"))
        record["member_name"] = member.get("full_name") if member else "Desconhecido"

    return records


@router.post("/records/{record_id}/approve", response_model=TitheRecordResponse)
async def approve_tithe_record(
    record_id: str,
    data: TitheRecordApprove,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    Approve or reject a tithe record.
    Requires: Tesoureiro or leadership (financial:view permission).
    When approved, creates a transaction linked to the member.
    """
    record = await tithe_record_repository.get(tenant_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Registro não encontrado")

    if record.get("status") != "PENDING":
        raise HTTPException(status_code=400, detail="Este registro já foi processado")

    user_id = auth_context.get("user_id")

    if data.status.value == "APPROVED":
        categories = await transaction_category_repository.get_all(tenant_id)
        category_name = "Dízimos" if record.get("type") == "DIZIMO" else "Ofertas"
        category = next((c for c in categories if c.get("name") == category_name), None)

        transaction = await transaction_repository.create_transaction(
            tenant_id=tenant_id,
            account_id=None,
            category_id=category.get("id") if category else None,
            amount=record.get("amount"),
            transaction_type="CREDIT",
            transaction_date=record.get("date"),
            description=f"{category_name} - {record.get('member_id')}",
            member_id=record.get("member_id"),
        )

        updated = await tithe_record_repository.approve(tenant_id, record_id, user_id, transaction.get("id"))
    else:
        updated = await tithe_record_repository.reject(tenant_id, record_id, user_id, data.rejection_reason)

    if updated:
        member = await member_repository.get(tenant_id, updated.get("member_id"))
        updated["member_name"] = member.get("full_name") if member else "Desconhecido"

    return updated
