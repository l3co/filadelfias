from fastapi import APIRouter, Depends, HTTPException, status

from src.api.auth import get_current_user
from src.domain.schemas import MembershipResponse, MembershipUpdateRole
from src.infra.repositories import membership_repository, tenant_repository
from src.middleware.permissions import verify_permission

router = APIRouter(tags=["Memberships"])


@router.get("/tenants/{tenant_id}/memberships", response_model=list[MembershipResponse])
async def list_memberships(
    tenant_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    List all memberships for a tenant.
    Requires: settings:manage permission (Admins).
    Used to manage system access roles.
    """
    await verify_permission(tenant_id, current_user, "settings", "manage")
    tenant = await tenant_repository.get(tenant_id)
    memberships = await membership_repository.get_tenant_memberships(tenant_id)
    return [
        {
            "id": membership["id"],
            "tenant": tenant,
            "role": membership["role"],
            "status": membership["status"],
            "joined_at": membership["joined_at"],
        }
        for membership in memberships
    ]


@router.put("/tenants/{tenant_id}/memberships/{user_id}/role", response_model=MembershipResponse)
async def update_membership_role(
    tenant_id: str,
    user_id: str,
    data: MembershipUpdateRole,
    current_user: dict = Depends(get_current_user),
):
    """
    Update a user's system role (ADMIN/MEMBER).
    Requires: settings:manage permission (Admins).
    """
    await verify_permission(tenant_id, current_user, "settings", "manage")
    # Prevent self-demotion if it's the last admin (optional safety check, maybe later)
    # Check if target membership exists
    membership = await membership_repository.get_by_user_and_tenant(user_id, tenant_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não é membro desta igreja")

    # Update role
    await membership_repository.update_role(membership["id"], data.role)

    # Return updated
    updated = await membership_repository.get_by_user_and_tenant(user_id, tenant_id)
    tenant = await tenant_repository.get(tenant_id)
    return {
        "id": updated["id"],
        "tenant": tenant,
        "role": updated["role"],
        "status": updated["status"],
        "joined_at": updated["joined_at"],
    }
