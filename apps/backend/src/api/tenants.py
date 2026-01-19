from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import get_current_user
from src.domain.schemas import TenantResponse
from src.infra.database import get_db
from src.infra.models import Tenant, User, UserChurchMembership
from src.infra.repositories import TenantRepository

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new tenant (Church).
    The creator will be assigned as ADMIN.
    """
    repo = TenantRepository(db)

    # Check if slug exists
    existing = await repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization with this slug already exists"
        )

    # Create Tenant
    tenant = Tenant(name=data.name, slug=data.slug)
    await repo.create(tenant)

    # Link Creator as Admin
    membership = UserChurchMembership(
        user_id=current_user.id,
        tenant_id=tenant.id,
        role="ADMIN"
    )
    db.add(membership)
    await db.commit()

    return tenant


@router.patch("/tenants/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: UUID,
    data: TenantUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update tenant (Church) data.
    Only ADMIN can update.
    """
    repo = TenantRepository(db)

    # Get tenant
    tenant = await repo.get(tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Igreja não encontrada"
        )

    # Check if user is admin of this tenant
    from sqlalchemy import select
    result = await db.execute(
        select(UserChurchMembership).where(
            UserChurchMembership.user_id == current_user.id,
            UserChurchMembership.tenant_id == tenant_id,
            UserChurchMembership.role == "ADMIN"
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem editar os dados da igreja"
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)

    await db.commit()
    await db.refresh(tenant)

    return tenant
