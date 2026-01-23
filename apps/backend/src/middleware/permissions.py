"""
Middleware de Permissões para FastAPI
Verifica permissões RBAC baseado no Manual Presbiteriano
"""


from fastapi import Depends, HTTPException, Query, status

from src.api.auth import get_current_user
from src.infra.repositories import member_repository, membership_repository
from src.lib.permissions import (
    check_permission,
    get_member_permissions,
    is_leadership,
    is_ordained_officer,
)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _action_label(action: str) -> str:
    labels = {
        "view": "visualizar",
        "create": "criar",
        "edit": "editar",
        "delete": "excluir",
        "manage": "gerenciar",
    }
    return labels.get(action, action)


def _resource_label(resource: str) -> str:
    labels = {
        "members": "membros",
        "governance": "governança",
        "financial": "finanças",
        "ebd": "EBD",
        "missions": "missões",
        "events": "eventos",
        "settings": "configurações",
        "reports": "relatórios",
    }
    return labels.get(resource, resource)


async def verify_permission(
    tenant_id: str,
    current_user: dict,
    resource: str,
    action: str,
) -> dict:
    """
    Verifica se o usuário tem permissão para a ação.

    Args:
        tenant_id: ID do tenant
        current_user: Usuário autenticado
        resource: Recurso (members, governance, etc.)
        action: Ação (view, create, edit, delete, manage)

    Returns:
        dict com user, member, permissions

    Raises:
        HTTPException 403 se não tiver permissão
    """
    user_id = current_user["id"]

    # Busca membership do usuário no tenant
    membership = await membership_repository.get_by_user_and_tenant(user_id, tenant_id)
    system_role = membership.get("role", "ATTENDEE") if membership else "ATTENDEE"

    # Busca membro vinculado ao usuário
    member = await member_repository.get_by_user_id(tenant_id, user_id)

    # Verifica permissão
    has_access = check_permission(member, system_role, resource, action)

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Você não tem permissão para {_action_label(action)} {_resource_label(resource)}",
        )

    # Retorna contexto enriquecido
    return {
        "user": current_user,
        "member": member,
        "membership": membership,
        "system_role": system_role,
        "permissions": get_member_permissions(member, system_role),
    }


# ============================================================================
# PERMISSION CHECKER (for Query params - governance, financial, ebd, missions)
# ============================================================================

class PermissionChecker:
    """
    Dependency que verifica permissões do usuário.
    Usa tenant_id como Query parameter.

    Uso:
        @router.post("/councils")
        async def create_council(
            data: CouncilCreate,
            tenant_id: str = Query(...),
            auth_context: dict = Depends(PermissionChecker("governance", "create")),
        ):
            ...
    """

    def __init__(self, resource: str, action: str):
        self.resource = resource
        self.action = action

    async def __call__(
        self,
        tenant_id: str = Query(..., description="ID of the tenant/church"),
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        return await verify_permission(tenant_id, current_user, self.resource, self.action)


class RequireLeadership:
    """
    Dependency que exige que o usuário seja Pastor ou Presbítero.

    Uso:
        @router.post("/councils")
        async def create_council(
            _: dict = Depends(RequireLeadership()),
        ):
            ...
    """

    async def __call__(
        self,
        tenant_id: str = Query(..., description="ID of the tenant/church"),
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_id = current_user["id"]

        # Busca membro vinculado ao usuário
        member = await member_repository.get_by_user_id(tenant_id, user_id)

        if not member or not is_leadership(member.get("office")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas pastores e presbíteros podem realizar esta ação",
            )

        membership = await membership_repository.get_by_user_and_tenant(user_id, tenant_id)

        return {
            "user": current_user,
            "member": member,
            "membership": membership,
        }


class RequireOfficer:
    """
    Dependency que exige que o usuário seja um oficial ordenado
    (Pastor, Presbítero ou Diácono).
    """

    async def __call__(
        self,
        tenant_id: str = Query(..., description="ID of the tenant/church"),
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_id = current_user["id"]

        member = await member_repository.get_by_user_id(tenant_id, user_id)

        if not member or not is_ordained_officer(member.get("office")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas oficiais ordenados podem realizar esta ação",
            )

        membership = await membership_repository.get_by_user_and_tenant(user_id, tenant_id)

        return {
            "user": current_user,
            "member": member,
            "membership": membership,
        }


# Aliases para uso mais conveniente
def require_permission(resource: str, action: str) -> PermissionChecker:
    """Factory para criar PermissionChecker."""
    return PermissionChecker(resource, action)


# Instâncias pré-configuradas para permissões comuns
require_view_members = PermissionChecker("members", "view")
require_manage_members = PermissionChecker("members", "manage")
require_view_governance = PermissionChecker("governance", "view")
require_manage_governance = PermissionChecker("governance", "manage")
require_create_governance = PermissionChecker("governance", "create")
require_view_financial = PermissionChecker("financial", "view")
require_manage_financial = PermissionChecker("financial", "manage")
require_create_financial = PermissionChecker("financial", "create")
require_view_ebd = PermissionChecker("ebd", "view")
require_manage_ebd = PermissionChecker("ebd", "manage")
require_view_missions = PermissionChecker("missions", "view")
require_manage_missions = PermissionChecker("missions", "manage")
require_view_settings = PermissionChecker("settings", "view")
require_manage_settings = PermissionChecker("settings", "manage")


class RequireAuthenticated:
    """
    Dependency que apenas exige que o usuário esteja autenticado.
    Não verifica permissões específicas.

    Uso:
        @router.get("/events")
        async def list_events(
            auth_context: dict = Depends(require_authenticated),
        ):
            ...
    """

    async def __call__(
        self,
        tenant_id: str = Query(..., description="ID of the tenant/church"),
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_id = current_user["id"]

        membership = await membership_repository.get_by_user_and_tenant(user_id, tenant_id)
        member = await member_repository.get_by_user_id(tenant_id, user_id)

        return {
            "user": current_user,
            "member": member,
            "membership": membership,
        }


require_authenticated = RequireAuthenticated()
