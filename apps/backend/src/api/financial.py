import csv
import io
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import StreamingResponse

from src.middleware.permissions import (
    require_create_financial,
    require_manage_financial,
    require_view_financial,
)
from src.modules.expense.repository import expense_request_repository
from src.modules.financial.repository import (
    asset_repository,
    financial_account_repository,
    transaction_category_repository,
    transaction_repository,
)
from src.modules.financial.schemas import (
    AssetCreate,
    AssetResponse,
    AssetUpdate,
    FinancialAccountCreate,
    FinancialAccountResponse,
    MonthlyReportResponse,
    TransactionCategoryCreate,
    TransactionCategoryResponse,
    TransactionCreate,
    TransactionResponse,
)
from src.modules.tithe.repository import tithe_record_repository

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
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, description="Filter by year"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List transactions with optional month/year filter and pagination.
    Requires: financial:view permission.
    """
    return await transaction_repository.get_all(tenant_id, month=month, year=year, page=page, page_size=page_size)


@router.get("/reports/monthly", response_model=MonthlyReportResponse)
async def get_monthly_report(
    tenant_id: str = Query(..., description="ID of the tenant"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Report month"),
    year: Optional[int] = Query(None, description="Report year"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    Build a monthly financial report with totals and category breakdowns.
    Requires: financial:view permission.
    """
    today = date.today()
    report_month = month or today.month
    report_year = year or today.year

    report = await transaction_repository.build_monthly_report(tenant_id, report_month, report_year)
    report["pending_tithes"] = len(await tithe_record_repository.get_pending(tenant_id))
    report["pending_expenses"] = len(await expense_request_repository.get_pending(tenant_id))
    return report


@router.post("/assets", response_model=AssetResponse)
async def create_asset(
    data: AssetCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_manage_financial),
):
    """
    Create an asset for the church inventory.
    Requires: financial:manage permission.
    """
    return await asset_repository.create(tenant_id, **data.model_dump())


@router.get("/assets", response_model=List[AssetResponse])
async def list_assets(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    List church inventory assets.
    Requires: financial:view permission.
    """
    return await asset_repository.get_all(tenant_id)


@router.put("/assets/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: str,
    data: AssetUpdate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_manage_financial),
):
    """
    Update an asset from the church inventory.
    Requires: financial:manage permission.
    """
    updated = await asset_repository.update(tenant_id, asset_id, **data.model_dump(exclude_unset=True))
    if not updated:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Bem patrimonial não encontrado")
    return updated


@router.delete("/assets/{asset_id}")
async def delete_asset(
    asset_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_manage_financial),
):
    """
    Delete an asset from the church inventory.
    Requires: financial:manage permission.
    """
    deleted = await asset_repository.delete(tenant_id, asset_id)
    if not deleted:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Bem patrimonial não encontrado")
    return {"success": True}


@router.get("/transactions/csv/template")
async def download_csv_template(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_financial),
):
    """
    Download CSV template for importing transactions.
    Includes headers and example rows with available accounts and categories.
    """
    accounts = await financial_account_repository.get_all(tenant_id)
    categories = await transaction_category_repository.get_all(tenant_id)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["data", "tipo", "descricao", "valor", "conta", "categoria"])

    income_categories = [c["name"] for c in categories if c.get("type") == "INCOME"]
    expense_categories = [c["name"] for c in categories if c.get("type") == "EXPENSE"]
    account_names = [a["name"] for a in accounts]

    if account_names and income_categories:
        writer.writerow(
            [
                date.today().strftime("%Y-%m-%d"),
                "RECEITA",
                "Exemplo: Oferta de Domingo",
                "150.00",
                account_names[0] if account_names else "Caixa Geral",
                income_categories[0] if income_categories else "Ofertas",
            ]
        )

    if account_names and expense_categories:
        writer.writerow(
            [
                date.today().strftime("%Y-%m-%d"),
                "DESPESA",
                "Exemplo: Conta de Luz",
                "350.00",
                account_names[0] if account_names else "Caixa Geral",
                expense_categories[0] if expense_categories else "Energia Elétrica",
            ]
        )

    writer.writerow([])
    writer.writerow(["# CONTAS DISPONÍVEIS:"] + account_names)
    writer.writerow(["# CATEGORIAS DE RECEITA:"] + income_categories)
    writer.writerow(["# CATEGORIAS DE DESPESA:"] + expense_categories)

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=transacoes_template_{date.today().strftime('%Y%m%d')}.csv"
        },
    )


@router.post("/transactions/csv/import")
async def import_csv_transactions(
    tenant_id: str = Query(..., description="ID of the tenant"),
    file: UploadFile = File(...),
    auth_context: dict = Depends(require_create_financial),
):
    """
    Import transactions from CSV file.
    Expected columns: data, tipo, descricao, valor, conta, categoria
    """
    accounts = await financial_account_repository.get_all(tenant_id)
    categories = await transaction_category_repository.get_all(tenant_id)

    account_map = {a["name"].lower(): a["id"] for a in accounts}
    category_map = {c["name"].lower(): c["id"] for c in categories}

    content = await file.read()
    decoded = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))

    created = []
    errors = []
    row_num = 1

    for row in reader:
        row_num += 1

        if row.get("data", "").startswith("#"):
            continue

        try:
            tx_date_str = row.get("data", "").strip()
            tx_type = row.get("tipo", "").strip().upper()
            description = row.get("descricao", "").strip()
            amount_str = row.get("valor", "").strip().replace(",", ".")
            account_name = row.get("conta", "").strip().lower()
            category_name = row.get("categoria", "").strip().lower()

            if not all([tx_date_str, tx_type, description, amount_str, account_name]):
                errors.append({"row": row_num, "error": "Campos obrigatórios faltando"})
                continue

            tx_date = datetime.strptime(tx_date_str, "%Y-%m-%d").date()
            amount = float(amount_str)

            if tx_type not in ["RECEITA", "DESPESA", "CREDIT", "DEBIT"]:
                errors.append({"row": row_num, "error": f"Tipo inválido: {tx_type}"})
                continue

            transaction_type = "CREDIT" if tx_type in ["RECEITA", "CREDIT"] else "DEBIT"

            account_id = account_map.get(account_name)
            if not account_id:
                errors.append({"row": row_num, "error": f"Conta não encontrada: {account_name}"})
                continue

            category_id = category_map.get(category_name) if category_name else None

            tx = await transaction_repository.create_transaction(
                tenant_id=tenant_id,
                account_id=account_id,
                category_id=category_id,
                amount=amount,
                transaction_type=transaction_type,
                transaction_date=tx_date,
                description=description,
            )
            created.append(tx)

        except ValueError as e:
            errors.append({"row": row_num, "error": str(e)})
        except Exception as e:
            errors.append({"row": row_num, "error": f"Erro inesperado: {str(e)}"})

    return {
        "success": True,
        "imported": len(created),
        "errors": errors,
        "message": f"{len(created)} transações importadas com sucesso" + (f", {len(errors)} erros" if errors else ""),
    }
