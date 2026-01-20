"""
Unit tests for UserRepository.

Note: These tests require Firestore credentials and are marked with @pytest.mark.firestore.
They are skipped in CI. Run locally with: pytest -m firestore
"""

from src.infra.repositories import UserRepository


class TestUserRepositoryStructure:
    """Test UserRepository structure (no Firestore required)."""

    def test_repository_has_collection_name(self):
        """Test that UserRepository has correct collection name."""
        repo = UserRepository()
        assert repo.collection_name == "users"

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
