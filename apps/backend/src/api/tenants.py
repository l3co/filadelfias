from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from src.infra.database import get_db
from src.infra.models import Tenant, User, UserChurchMembership
from src.infra.repositories import TenantRepository
from src.domain.schemas import TenantResponse
from src.api.auth import get_current_user

router = APIRouter()


class TenantCreate(BaseModel):
    name: str = Field(..., min_length=2)
    slug: str = Field(..., min_length=2)


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
