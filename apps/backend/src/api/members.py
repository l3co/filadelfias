from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.infra.database import get_db
from src.infra.models import Member, User
from src.infra.repositories import MemberRepository
from src.domain.schemas import MemberCreate, MemberResponse
from src.api.auth import get_current_user

router = APIRouter()


@router.post("/tenants/{tenant_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    tenant_id: UUID,
    member_data: MemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new member in a tenant.
    """
    # TODO: Implement RBAC to check if user can create members in this tenant
    
    repo = MemberRepository(db)
    
    # Create DB model
    member = Member(
        tenant_id=tenant_id,
        **member_data.model_dump(exclude_unset=True)
    )
    
    created_member = await repo.create(member)
    return created_member


@router.get("/tenants/{tenant_id}/members", response_model=List[MemberResponse])
async def list_members(
    tenant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all members of a tenant.
    """
    # TODO: Implement RBAC check
    
    repo = MemberRepository(db)
    members = await repo.get_by_tenant(tenant_id)
    return members
