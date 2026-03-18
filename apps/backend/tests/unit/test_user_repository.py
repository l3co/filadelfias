"""
Unit tests for UserRepository structure.
"""

import pytest

from src.infra.repositories import UserRepository

pytestmark = pytest.mark.unit


class TestUserRepositoryStructure:
    """Test UserRepository structure."""

    def test_repository_has_required_methods(self):
        """Test that UserRepository has all required methods."""
        repo = UserRepository()
        assert hasattr(repo, "get_by_email")
        assert hasattr(repo, "get_by_id")
        assert hasattr(repo, "exists_by_email")
        assert hasattr(repo, "create_user")
        assert hasattr(repo, "get_by_reset_token")
        assert hasattr(repo, "set_password_reset_token")
        assert hasattr(repo, "clear_password_reset_token")
        assert hasattr(repo, "update_password")
