from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.api.auth import get_current_user
from src.domain.schemas import TenantResponse
from src.infra.repositories import membership_repository, tenant_repository
from src.services.deletion_service import delete_tenant_data

router = APIRouter()


class TenantCreate(BaseModel):
    name: str = Field(..., min_length=2)
    slug: str = Field(..., min_length=2)


class TenantUpdate(BaseModel):
    name: str | None = None
    street: str | None = None
    number: str | None = None
    complement: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    phone: str | None = None
    email: str | None = None


@router.post("/tenants", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    data: TenantCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new tenant (Church).
    The creator will be assigned as ADMIN.
    """
    # Check if slug exists
    existing = await tenant_repository.get_by_slug(data.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Organization with this slug already exists"
        )

    # Create Tenant
    tenant = await tenant_repository.create_tenant(name=data.name, slug=data.slug)

    # Link Creator as Admin
    await membership_repository.create_membership(user_id=current_user["id"], tenant_id=tenant["id"], role="ADMIN")

    return tenant


@router.patch("/tenants/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: str,
    data: TenantUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update tenant (Church) data.
    Only ADMIN can update.
    """
    # Get tenant
    tenant = await tenant_repository.get(tenant_id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Igreja não encontrada")

    # Check if user is admin of this tenant
    membership = await membership_repository.get_by_user_and_tenant(user_id=current_user["id"], tenant_id=tenant_id)
    if not membership or membership.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem editar os dados da igreja"
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    updated_tenant = await tenant_repository.update(tenant_id, update_data)

    return updated_tenant


@router.delete("/tenants/{tenant_id}")
async def delete_tenant(
    tenant_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a tenant (Church) and ALL associated data.
    Only ADMIN can delete.

    WARNING: This action is irreversible and will delete:
    - All members
    - All EBD classes, students, and lessons
    - All financial accounts, categories, and transactions
    - All councils and meetings
    - All user memberships linked to this church
    """
    # Get tenant
    tenant = await tenant_repository.get(tenant_id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Igreja não encontrada")

    # Check if user is admin of this tenant
    membership = await membership_repository.get_by_user_and_tenant(user_id=current_user["id"], tenant_id=tenant_id)
    if not membership or membership.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem excluir a igreja"
        )

    # Delete all tenant data
    deleted = await delete_tenant_data(tenant_id)

    return {"message": f"Igreja '{tenant['name']}' e todos os dados associados foram excluídos", "deleted": deleted}
