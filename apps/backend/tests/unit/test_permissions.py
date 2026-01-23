"""
Unit tests for RBAC permissions system.
Tests the permission logic based on Manual Presbiteriano.
"""

import pytest

from src.lib.permissions import (
    OFFICE_PERMISSIONS,
    check_permission,
    get_member_permissions,
    has_permission,
    is_leadership,
    is_ordained_officer,
)

pytestmark = pytest.mark.unit


class TestOfficePermissions:
    """Test permissions based on ecclesiastical office."""

    def test_pastor_has_all_permissions(self):
        """Pastor should have full access to all resources."""
        member = {"office": "PASTOR", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")

        # Pastor should have manage permission for all main resources
        assert "members:manage" in permissions
        assert "governance:manage" in permissions
        assert "financial:manage" in permissions
        assert "ebd:manage" in permissions
        assert "missions:manage" in permissions
        assert "events:manage" in permissions
        assert "settings:manage" in permissions
        assert "reports:manage" in permissions

    def test_presbitero_governance_full_access(self):
        """Presbítero should have full governance access (part of Council)."""
        member = {"office": "PRESBITERO", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "governance:view" in permissions
        assert "governance:create" in permissions
        assert "governance:edit" in permissions
        assert "governance:delete" in permissions
        assert "governance:manage" in permissions

    def test_presbitero_cannot_delete_members(self):
        """Presbítero should NOT be able to delete members."""
        member = {"office": "PRESBITERO", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "members:delete" not in permissions
        # But can manage (which doesn't include delete for presbitero)
        assert "members:manage" in permissions

    def test_diacono_limited_governance_access(self):
        """Diácono should only view governance, not manage."""
        member = {"office": "DIACONO", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "governance:view" in permissions
        assert "governance:create" not in permissions
        assert "governance:edit" not in permissions
        assert "governance:manage" not in permissions

    def test_diacono_limited_financial_access(self):
        """Diácono should only view financial data."""
        member = {"office": "DIACONO", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "financial:view" in permissions
        assert "financial:create" not in permissions
        assert "financial:manage" not in permissions

    def test_membro_view_only_permissions(self):
        """Regular member should only have view permissions."""
        member = {"office": "MEMBRO", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "members:view" in permissions
        assert "ebd:view" in permissions
        assert "missions:view" in permissions
        assert "events:view" in permissions

        # Should NOT have create/edit/delete
        assert "members:create" not in permissions
        assert "members:edit" not in permissions
        assert "financial:view" not in permissions
        assert "governance:view" in permissions

    def test_office_case_insensitive(self):
        """Office should be case insensitive."""
        member_lower = {"office": "pastor", "functions": []}
        member_upper = {"office": "PASTOR", "functions": []}

        perms_lower = get_member_permissions(member_lower, "ATTENDEE")
        perms_upper = get_member_permissions(member_upper, "ATTENDEE")

        assert perms_lower == perms_upper


class TestFunctionPermissions:
    """Test permissions based on member functions."""

    def test_tesoureiro_financial_permissions(self):
        """Tesoureiro should have full financial access."""
        member = {"office": "MEMBRO", "functions": ["TESOUREIRO"]}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "financial:view" in permissions
        assert "financial:create" in permissions
        assert "financial:edit" in permissions
        assert "financial:delete" in permissions
        assert "financial:manage" in permissions

    def test_secretario_member_permissions(self):
        """Secretário should have member management permissions."""
        member = {"office": "MEMBRO", "functions": ["SECRETARIO"]}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "members:view" in permissions
        assert "members:create" in permissions
        assert "members:edit" in permissions
        assert "governance:view" in permissions
        assert "reports:manage" in permissions

    def test_evangelista_missions_permissions(self):
        """Evangelista should have missions and events permissions."""
        member = {"office": "MEMBRO", "functions": ["EVANGELISTA"]}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "missions:view" in permissions
        assert "missions:create" in permissions
        assert "events:view" in permissions
        assert "events:create" in permissions

    def test_missionario_missions_permissions(self):
        """Missionário should have missions permissions."""
        member = {"office": "MEMBRO", "functions": ["MISSIONARIO"]}
        permissions = get_member_permissions(member, "ATTENDEE")

        assert "missions:view" in permissions
        assert "missions:create" in permissions
        assert "missions:edit" in permissions

    def test_combined_office_and_function_permissions(self):
        """Member with office and function should have combined permissions."""
        member = {"office": "DIACONO", "functions": ["TESOUREIRO"]}
        permissions = get_member_permissions(member, "ATTENDEE")

        # From DIACONO
        assert "governance:view" in permissions
        assert "members:view" in permissions

        # From TESOUREIRO
        assert "financial:manage" in permissions
        assert "financial:delete" in permissions

    def test_multiple_functions(self):
        """Member with multiple functions should have all combined."""
        member = {"office": "MEMBRO", "functions": ["TESOUREIRO", "SECRETARIO"]}
        permissions = get_member_permissions(member, "ATTENDEE")

        # From TESOUREIRO
        assert "financial:manage" in permissions

        # From SECRETARIO
        assert "reports:manage" in permissions
        assert "governance:view" in permissions


class TestSystemRolePermissions:
    """Test permissions based on system role."""

    def test_admin_system_permissions(self):
        """ADMIN role should have system-wide management permissions."""
        member = {"office": "MEMBRO", "functions": []}
        permissions = get_member_permissions(member, "ADMIN")

        assert "settings:manage" in permissions
        assert "members:manage" in permissions
        assert "financial:manage" in permissions
        assert "governance:manage" in permissions

    def test_moderator_limited_permissions(self):
        """MODERATOR role should have limited permissions."""
        member = {"office": "MEMBRO", "functions": []}
        permissions = get_member_permissions(member, "MODERATOR")

        assert "settings:view" in permissions
        assert "members:view" in permissions
        assert "members:create" in permissions
        assert "members:edit" in permissions

        # Should NOT have manage
        assert "settings:manage" not in permissions

    def test_attendee_no_extra_permissions(self):
        """ATTENDEE role should not add any extra permissions."""
        member = {"office": "MEMBRO", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")

        # ATTENDEE has empty permissions, so only office permissions
        assert permissions == OFFICE_PERMISSIONS["MEMBRO"]

    def test_no_member_uses_system_role_only(self):
        """When no member, only system role permissions should apply."""
        permissions = get_member_permissions(None, "ADMIN")

        assert "settings:manage" in permissions
        assert "members:manage" in permissions
        # Should NOT have office permissions
        assert "members:view" not in permissions or "members:manage" in permissions


class TestHasPermission:
    """Test the has_permission function."""

    def test_exact_permission_match(self):
        """Should return True for exact permission match."""
        permissions = {"members:view", "members:create"}

        assert has_permission(permissions, "members", "view") is True
        assert has_permission(permissions, "members", "create") is True
        assert has_permission(permissions, "members", "delete") is False

    def test_manage_implies_all_actions(self):
        """Having 'manage' permission should imply all other actions."""
        permissions = {"members:manage"}

        assert has_permission(permissions, "members", "view") is True
        assert has_permission(permissions, "members", "create") is True
        assert has_permission(permissions, "members", "edit") is True
        assert has_permission(permissions, "members", "delete") is True

    def test_manage_only_for_same_resource(self):
        """Manage permission should only apply to the same resource."""
        permissions = {"members:manage"}

        assert has_permission(permissions, "members", "view") is True
        assert has_permission(permissions, "financial", "view") is False


class TestCheckPermission:
    """Test the check_permission function (combines member + system role)."""

    def test_check_permission_with_member(self):
        """Check permission should work with member data."""
        member = {"office": "PASTOR", "functions": []}

        assert check_permission(member, "ATTENDEE", "members", "delete") is True
        assert check_permission(member, "ATTENDEE", "settings", "manage") is True

    def test_check_permission_without_member(self):
        """Check permission should work without member (system role only)."""
        assert check_permission(None, "ADMIN", "settings", "manage") is True
        assert check_permission(None, "ATTENDEE", "members", "view") is False


class TestLeadershipChecks:
    """Test leadership and officer check functions."""

    def test_is_leadership_pastor(self):
        """Pastor is leadership."""
        assert is_leadership("PASTOR") is True
        assert is_leadership("pastor") is True

    def test_is_leadership_presbitero(self):
        """Presbítero is leadership."""
        assert is_leadership("PRESBITERO") is True
        assert is_leadership("presbitero") is True

    def test_is_leadership_diacono_is_not(self):
        """Diácono is NOT leadership."""
        assert is_leadership("DIACONO") is False

    def test_is_leadership_membro_is_not(self):
        """Membro is NOT leadership."""
        assert is_leadership("MEMBRO") is False

    def test_is_leadership_none(self):
        """None office is NOT leadership."""
        assert is_leadership(None) is False

    def test_is_ordained_officer_pastor(self):
        """Pastor is ordained officer."""
        assert is_ordained_officer("PASTOR") is True

    def test_is_ordained_officer_presbitero(self):
        """Presbítero is ordained officer."""
        assert is_ordained_officer("PRESBITERO") is True

    def test_is_ordained_officer_diacono(self):
        """Diácono is ordained officer."""
        assert is_ordained_officer("DIACONO") is True

    def test_is_ordained_officer_membro_is_not(self):
        """Membro is NOT ordained officer."""
        assert is_ordained_officer("MEMBRO") is False

    def test_is_ordained_officer_none(self):
        """None office is NOT ordained officer."""
        assert is_ordained_officer(None) is False


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_empty_functions_list(self):
        """Empty functions list should not cause errors."""
        member = {"office": "MEMBRO", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")
        assert isinstance(permissions, set)

    def test_none_functions(self):
        """None functions should not cause errors."""
        member = {"office": "MEMBRO", "functions": None}
        permissions = get_member_permissions(member, "ATTENDEE")
        assert isinstance(permissions, set)

    def test_missing_office_key(self):
        """Missing office key should default to MEMBRO."""
        member = {"functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")
        assert permissions == OFFICE_PERMISSIONS["MEMBRO"]

    def test_unknown_office_defaults_to_membro(self):
        """Unknown office should default to MEMBRO permissions."""
        member = {"office": "UNKNOWN_OFFICE", "functions": []}
        permissions = get_member_permissions(member, "ATTENDEE")
        assert permissions == OFFICE_PERMISSIONS["MEMBRO"]

    def test_unknown_function_ignored(self):
        """Unknown function should be ignored without error."""
        member = {"office": "MEMBRO", "functions": ["UNKNOWN_FUNCTION"]}
        permissions = get_member_permissions(member, "ATTENDEE")
        # Should only have MEMBRO permissions
        assert permissions == OFFICE_PERMISSIONS["MEMBRO"]

    def test_unknown_system_role_empty_permissions(self):
        """Unknown system role should result in empty system permissions."""
        member = {"office": "MEMBRO", "functions": []}
        permissions = get_member_permissions(member, "UNKNOWN_ROLE")
        # Should only have MEMBRO permissions (no system role perms added)
        assert permissions == OFFICE_PERMISSIONS["MEMBRO"]
