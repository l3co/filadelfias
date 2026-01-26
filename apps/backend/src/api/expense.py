"""
API endpoints for Expense Request records.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from src.api.auth import get_current_user
from src.infra.repositories.member_repository import member_repository
from src.middleware.permissions import require_treasurer, require_view_financial
from src.modules.expense.repository import expense_request_repository
from src.modules.expense.schemas import (
    ExpenseRequestApprove,
    ExpenseRequestCreate,
    ExpenseRequestResponse,
)
from src.modules.financial.repository import (
    financial_account_repository,
    transaction_category_repository,
    transaction_repository,
)

router = APIRouter(prefix="/expense", tags=["Expense - Solicitações de Despesa"])

# Functions that can submit expense requests
ALLOWED_FUNCTIONS = [
    "TESOUREIRO",
    "SECRETARIO",
    "PROFESSOR_EBD",
    "LIDER_LOUVOR",
    "LIDER_JOVENS",
    "LIDER_MULHERES",
    "LIDER_HOMENS",
    "LIDER_CRIANCAS",
]

# Offices that can submit expense requests
ALLOWED_OFFICES = ["PASTOR", "PRESBITERO", "DIACONO"]


@router.post("/requests", response_model=ExpenseRequestResponse)
async def submit_expense_request(
    data: ExpenseRequestCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(get_current_user),
):
    """
    Submit a new expense request for reimbursement.
    Allowed: Officers (Pastor, Presbítero, Diácono) and members with specific functions.
    """
    user_id = auth_context.get("id")

    # Find member_id for this specific tenant
    member = await member_repository.get_by_user_id(tenant_id, user_id)
    if not member:
        raise HTTPException(status_code=400, detail="Usuário não está vinculado a um membro nesta igreja")

    # Check if member has permission to submit expenses
    member_office = member.get("office", "")
    member_functions = member.get("functions", [])

    has_office_permission = member_office in ALLOWED_OFFICES
    has_function_permission = any(fn in ALLOWED_FUNCTIONS for fn in member_functions)

    if not has_office_permission and not has_function_permission:
        raise HTTPException(
            status_code=403,
            detail="Apenas oficiais ordenados ou membros com funções específicas podem solicitar reembolso",
        )

    member_id = member.get("id")

    record = await expense_request_repository.create(
        tenant_id=tenant_id,
        member_id=member_id,
        amount=data.amount,
        category=data.category.value,
        description=data.description,
        expense_date=data.expense_date,
        receipt_url=data.receipt_url,
        notes=data.notes,
    )

    record["member_name"] = member.get("full_name")
    return record


@router.get("/requests/my", response_model=List[ExpenseRequestResponse])
async def get_my_expense_requests(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(get_current_user),
):
    """
    Get expense requests submitted by the current user.
    """
    user_id = auth_context.get("id")

    member = await member_repository.get_by_user_id(tenant_id, user_id)
    if not member:
        return []

    records = await expense_request_repository.get_by_member(tenant_id, member.get("id"))

    for record in records:
        record["member_name"] = member.get("full_name")

    return sorted(records, key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/requests/pending", response_model=List[ExpenseRequestResponse])
async def get_pending_expense_requests(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List all pending expense requests.
    Requires: financial:view permission.
    """
    records = await expense_request_repository.get_pending(tenant_id)

    for record in records:
        member = await member_repository.get(tenant_id, record.get("member_id"))
        record["member_name"] = member.get("full_name") if member else "Desconhecido"

    return sorted(records, key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/requests", response_model=List[ExpenseRequestResponse])
async def list_expense_requests(
    tenant_id: str = Query(..., description="ID of the tenant"),
    year: Optional[int] = Query(None, description="Filter by year"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List all expense requests.
    Requires: financial:view permission.
    """
    if year is None:
        year = datetime.now().year

    records = await expense_request_repository.get_all(tenant_id, year)

    for record in records:
        member = await member_repository.get(tenant_id, record.get("member_id"))
        record["member_name"] = member.get("full_name") if member else "Desconhecido"

    return records


@router.post("/requests/{record_id}/approve", response_model=ExpenseRequestResponse)
async def approve_expense_request(
    record_id: str,
    data: ExpenseRequestApprove,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_treasurer),
):
    """
    Approve or reject an expense request.
    Requires: TESOUREIRO function (only treasurer can approve/reject).
    When approved, creates a transaction (DEBIT) automatically.
    """
    record = await expense_request_repository.get(tenant_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")

    if record.get("status") != "PENDING":
        raise HTTPException(status_code=400, detail="Esta solicitação já foi processada")

    user_id = auth_context.get("user_id")

    if data.status.value == "APPROVED":
        # Get default account
        accounts = await financial_account_repository.get_all(tenant_id)
        default_account = accounts[0] if accounts else None
        if not default_account:
            raise HTTPException(
                status_code=400, detail="Nenhuma conta financeira cadastrada. Cadastre uma conta antes de aprovar."
            )

        # Get member name for description
        member = await member_repository.get(tenant_id, record.get("member_id"))
        member_name = member.get("full_name") if member else "Membro"

        # Map category to transaction category
        category_map = {
            "MATERIAL": "Material",
            "CLEANING": "Limpeza",
            "TRANSPORT": "Transporte",
            "FOOD": "Alimentação",
            "MAINTENANCE": "Manutenção",
            "UTILITIES": "Contas",
            "OTHER": "Outros",
        }
        category_name = category_map.get(record.get("category"), "Outros")

        # Try to find matching category
        categories = await transaction_category_repository.get_all(tenant_id)
        category = next((c for c in categories if c.get("name") == category_name), None)

        # Create transaction (DEBIT)
        transaction = await transaction_repository.create_transaction(
            tenant_id=tenant_id,
            account_id=default_account.get("id"),
            category_id=category.get("id") if category else None,
            amount=record.get("amount"),
            transaction_type="DEBIT",
            transaction_date=record.get("expense_date"),
            description=f"Reembolso: {record.get('description')} - {member_name}",
            member_id=record.get("member_id"),
        )

        updated = await expense_request_repository.approve(tenant_id, record_id, user_id, transaction.get("id"))
    else:
        updated = await expense_request_repository.reject(tenant_id, record_id, user_id, data.rejection_reason)

    if updated:
        member = await member_repository.get(tenant_id, updated.get("member_id"))
        updated["member_name"] = member.get("full_name") if member else "Desconhecido"

    return updated


@router.delete("/requests/{record_id}")
async def delete_expense_request(
    record_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(get_current_user),
):
    """
    Delete a pending expense request.
    Only the member who created it can delete, and only if still pending.
    """
    user_id = auth_context.get("id")

    member = await member_repository.get_by_user_id(tenant_id, user_id)
    if not member:
        raise HTTPException(status_code=400, detail="Usuário não está vinculado a um membro")

    record = await expense_request_repository.get(tenant_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")

    if record.get("member_id") != member.get("id"):
        raise HTTPException(status_code=403, detail="Você só pode excluir suas próprias solicitações")

    if record.get("status") != "PENDING":
        raise HTTPException(status_code=400, detail="Não é possível excluir solicitações já processadas")

    deleted = await expense_request_repository.delete(tenant_id, record_id)
    if not deleted:
        raise HTTPException(status_code=400, detail="Não foi possível excluir a solicitação")

    return {"message": "Solicitação excluída com sucesso"}
