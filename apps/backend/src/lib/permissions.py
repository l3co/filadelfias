"""
Sistema de Permissões RBAC
Baseado no Manual Presbiteriano da IPB

Hierarquia Eclesiástica (Ofícios - apenas um por membro):
- PASTOR: Ministro ordenado, preside o Conselho, autoridade máxima
- PRESBITERO: Governa a igreja com o pastor, participa do Conselho
- DIACONO: Serviço assistencial, pode participar de reuniões
- MEMBRO: Membro comungante com direito a voto em Assembleias

Funções (podem ter múltiplas):
- TESOUREIRO: Gerencia finanças
- SECRETARIO: Gerencia documentação
- EVANGELISTA: Evangelismo
- MISSIONARIO: Missões
"""

from enum import Enum
from typing import Optional, Set


class Resource(str, Enum):
    MEMBERS = "members"
    GOVERNANCE = "governance"
    FINANCIAL = "financial"
    EBD = "ebd"
    MISSIONS = "missions"
    EVENTS = "events"
    SETTINGS = "settings"
    REPORTS = "reports"


class Action(str, Enum):
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    MANAGE = "manage"


# Permissões por ofício eclesiástico
OFFICE_PERMISSIONS: dict[str, Set[str]] = {
    "PASTOR": {
        # Membros
        "members:view",
        "members:create",
        "members:edit",
        "members:delete",
        "members:manage",
        # Governança
        "governance:view",
        "governance:create",
        "governance:edit",
        "governance:delete",
        "governance:manage",
        # Financeiro
        "financial:view",
        "financial:create",
        "financial:edit",
        "financial:delete",
        "financial:manage",
        # EBD
        "ebd:view",
        "ebd:create",
        "ebd:edit",
        "ebd:delete",
        "ebd:manage",
        # Missões
        "missions:view",
        "missions:create",
        "missions:edit",
        "missions:delete",
        "missions:manage",
        # Eventos
        "events:view",
        "events:create",
        "events:edit",
        "events:delete",
        "events:manage",
        # Configurações
        "settings:view",
        "settings:edit",
        "settings:manage",
        # Relatórios
        "reports:view",
        "reports:manage",
    },
    "PRESBITERO": {
        # Membros
        "members:view",
        "members:create",
        "members:edit",
        "members:manage",
        # Governança - acesso total (compõe o Conselho)
        "governance:view",
        "governance:create",
        "governance:edit",
        "governance:delete",
        "governance:manage",
        # Financeiro
        "financial:view",
        "financial:create",
        "financial:edit",
        # EBD
        "ebd:view",
        "ebd:create",
        "ebd:edit",
        "ebd:manage",
        # Missões
        "missions:view",
        "missions:create",
        "missions:edit",
        # Eventos
        "events:view",
        "events:create",
        "events:edit",
        # Configurações
        "settings:view",
        # Relatórios
        "reports:view",
    },
    "DIACONO": {
        # Membros
        "members:view",
        "members:create",
        # Governança - pode visualizar
        "governance:view",
        # Financeiro
        "financial:view",
        # EBD
        "ebd:view",
        "ebd:create",
        # Missões
        "missions:view",
        # Eventos
        "events:view",
        "events:create",
        # Relatórios
        "reports:view",
    },
    "MEMBRO": {
        # Membros - apenas visualizar
        "members:view",
        # Governança - visualizar conselhos e membros
        "governance:view",
        # EBD
        "ebd:view",
        # Missões
        "missions:view",
        # Eventos
        "events:view",
    },
}

# Permissões extras por função
FUNCTION_PERMISSIONS: dict[str, Set[str]] = {
    "TESOUREIRO": {
        "financial:view",
        "financial:create",
        "financial:edit",
        "financial:delete",
        "financial:manage",
        "reports:view",
    },
    "SECRETARIO": {
        "members:view",
        "members:create",
        "members:edit",
        "governance:view",
        "governance:create",
        "reports:view",
        "reports:manage",
    },
    "EVANGELISTA": {
        "missions:view",
        "missions:create",
        "events:view",
        "events:create",
    },
    "MISSIONARIO": {
        "missions:view",
        "missions:create",
        "missions:edit",
    },
}

# Permissões por role do sistema (membership.role)
SYSTEM_ROLE_PERMISSIONS: dict[str, Set[str]] = {
    "ADMIN": {
        "settings:view",
        "settings:edit",
        "settings:manage",
        "members:manage",
        "financial:manage",
        "governance:manage",
        "ebd:manage",
        "missions:manage",
        "events:manage",
        "reports:manage",
    },
    "MODERATOR": {
        "settings:view",
        "members:view",
        "members:create",
        "members:edit",
    },
    "MEMBER": {
        "members:view",
        "governance:view",
        "ebd:view",
        "missions:view",
        "events:view",
    },
    "ATTENDEE": set(),
}


def get_member_permissions(member: Optional[dict], system_role: str = "ATTENDEE") -> Set[str]:
    """
    Calcula todas as permissões de um membro.

    Args:
        member: Dados do membro (office, functions)
        system_role: Role do sistema (ADMIN, MODERATOR, ATTENDEE)

    Returns:
        Set de permissões no formato 'resource:action'
    """
    permissions: Set[str] = set()

    # 1. Adiciona permissões do role do sistema
    role_perms = SYSTEM_ROLE_PERMISSIONS.get(system_role.upper(), set())
    permissions.update(role_perms)

    if not member:
        return permissions

    # 2. Adiciona permissões do ofício eclesiástico
    office = member.get("office", "MEMBRO")
    office_perms = OFFICE_PERMISSIONS.get(office.upper(), OFFICE_PERMISSIONS["MEMBRO"])
    permissions.update(office_perms)

    # 3. Adiciona permissões das funções
    functions = member.get("functions") or []
    for func in functions:
        func_perms = FUNCTION_PERMISSIONS.get(func.upper(), set())
        permissions.update(func_perms)

    return permissions


def has_permission(permissions: Set[str], resource: str, action: str) -> bool:
    """
    Verifica se tem uma permissão específica.

    Args:
        permissions: Set de permissões do usuário
        resource: Recurso (members, governance, financial, etc.)
        action: Ação (view, create, edit, delete, manage)

    Returns:
        True se tem permissão
    """
    permission = f"{resource}:{action}"

    # Verifica permissão exata
    if permission in permissions:
        return True

    # 'manage' implica todas as outras ações
    if f"{resource}:manage" in permissions:
        return True

    return False


def check_permission(member: Optional[dict], system_role: str, resource: str, action: str) -> bool:
    """
    Verifica se um membro tem permissão para uma ação.

    Args:
        member: Dados do membro
        system_role: Role do sistema
        resource: Recurso
        action: Ação

    Returns:
        True se tem permissão
    """
    permissions = get_member_permissions(member, system_role)
    return has_permission(permissions, resource, action)


def is_leadership(office: Optional[str]) -> bool:
    """Verifica se é um ofício de liderança (Pastor ou Presbítero)."""
    if not office:
        return False
    return office.upper() in ("PASTOR", "PRESBITERO")


def is_ordained_officer(office: Optional[str]) -> bool:
    """Verifica se é um oficial ordenado (Pastor, Presbítero ou Diácono)."""
    if not office:
        return False
    return office.upper() in ("PASTOR", "PRESBITERO", "DIACONO")
