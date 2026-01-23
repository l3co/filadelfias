from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from src.api.auth import get_current_user
from src.domain.schemas import MemberCreate, MemberResponse, MemberUpdate
from src.infra.repositories import member_repository
from src.middleware.permissions import verify_permission

router = APIRouter()


@router.post("/tenants/{tenant_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    tenant_id: str,
    member_data: MemberCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new member in a tenant.
    Requires: Pastor, Presbítero, Diácono or Secretário (members:create permission).
    """
    await verify_permission(tenant_id, current_user, "members", "create")

    member_dict = member_data.model_dump(exclude_unset=True)
    # Map deprecated 'role' field to 'office' if present
    if "role" in member_dict and "office" not in member_dict:
        member_dict["office"] = member_dict.pop("role")
    elif "role" in member_dict:
        member_dict.pop("role")

    created_member = await member_repository.create_member(tenant_id=tenant_id, **member_dict)
    return created_member


@router.get("/tenants/{tenant_id}/members", response_model=List[MemberResponse])
async def list_members(
    tenant_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    List all members of a tenant.
    Requires: members:view permission (all members have this).
    """
    await verify_permission(tenant_id, current_user, "members", "view")

    members = await member_repository.get_all(tenant_id)
    return members


@router.get("/tenants/{tenant_id}/members/{member_id}", response_model=MemberResponse)
async def get_member(
    tenant_id: str,
    member_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Get a specific member by ID.
    Requires: members:view permission.
    """
    await verify_permission(tenant_id, current_user, "members", "view")

    member = await member_repository.get(tenant_id, member_id)

    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado")

    return member


@router.patch("/tenants/{tenant_id}/members/{member_id}", response_model=MemberResponse)
async def update_member(
    tenant_id: str,
    member_id: str,
    member_data: MemberUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update a member's data.
    Requires: Pastor, Presbítero or Secretário (members:edit permission).
    """
    await verify_permission(tenant_id, current_user, "members", "edit")

    member = await member_repository.get(tenant_id, member_id)

    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado")

    update_data = member_data.model_dump(exclude_unset=True)
    updated_member = await member_repository.update(tenant_id, member_id, update_data)

    return updated_member
