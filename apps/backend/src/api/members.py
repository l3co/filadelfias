from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import get_current_user
from src.domain.schemas import MemberCreate, MemberResponse, MemberUpdate
from src.infra.database import get_db
from src.infra.models import Member, User
from src.infra.repositories import MemberRepository

router = APIRouter()


@router.post("/tenants/{tenant_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    tenant_id: UUID,
    member_data: MemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new member in a tenant.
    """
    # TODO: Implement RBAC to check if user can create members in this tenant

    repo = MemberRepository(db)

    # Create DB model
    member = Member(tenant_id=tenant_id, **member_data.model_dump(exclude_unset=True))

    created_member = await repo.create(member)
    return created_member


@router.get("/tenants/{tenant_id}/members", response_model=List[MemberResponse])
async def list_members(
    tenant_id: UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    List all members of a tenant.
    """
    # TODO: Implement RBAC check

    repo = MemberRepository(db)
    members = await repo.get_by_tenant(tenant_id)
    return members


@router.get("/tenants/{tenant_id}/members/{member_id}", response_model=MemberResponse)
async def get_member(
    tenant_id: UUID, member_id: UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    Get a specific member by ID.
    """
    repo = MemberRepository(db)
    member = await repo.get(member_id)

    if not member or member.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado")

    return member


@router.patch("/tenants/{tenant_id}/members/{member_id}", response_model=MemberResponse)
async def update_member(
    tenant_id: UUID,
    member_id: UUID,
    member_data: MemberUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a member's data.
    """
    repo = MemberRepository(db)
    member = await repo.get(member_id)

    if not member or member.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado")

    # Update fields
    update_data = member_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)

    await db.commit()
    await db.refresh(member)

    return member
