"""
Unit tests for UserRepository.
"""

import pytest

from src.infra.repositories import UserRepository


@pytest.mark.asyncio
class TestUserRepository:
    """Test UserRepository database operations."""

    async def test_create_user(self, db_session):
        """
        Test creating a new user.
        """
        repo = UserRepository(db_session)

        user = await repo.create(email="test@example.com", name="Test User", password="password123")

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.password_hash != "password123"  # Should be hashed
        assert user.is_active is True
        assert user.created_at is not None

    async def test_get_user_by_email(self, db_session):
        """
        Test retrieving user by email.
        """
        repo = UserRepository(db_session)

        # Create user
        created_user = await repo.create(email="find@example.com", name="Find Me", password="password123")

        # Find user
        found_user = await repo.get_by_email("find@example.com")

        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == "find@example.com"

    async def test_get_user_by_email_not_found(self, db_session):
        """
        Test retrieving non-existent user returns None.
        """
        repo = UserRepository(db_session)

        user = await repo.get_by_email("nonexistent@example.com")

        assert user is None

    async def test_get_user_by_id(self, db_session):
        """
        Test retrieving user by ID.
        """
        repo = UserRepository(db_session)

        # Create user
        created_user = await repo.create(email="findbyid@example.com", name="Find By ID", password="password123")

        # Find user by ID
        found_user = await repo.get_by_id(created_user.id)

        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == "findbyid@example.com"

    async def test_exists_by_email_true(self, db_session):
        """
        Test that exists_by_email returns True for existing user.
        """
        repo = UserRepository(db_session)

        await repo.create(email="exists@example.com", name="Exists", password="password123")

        exists = await repo.exists_by_email("exists@example.com")

        assert exists is True

    async def test_exists_by_email_false(self, db_session):
        """
        Test that exists_by_email returns False for non-existent user.
        """
        repo = UserRepository(db_session)

        exists = await repo.exists_by_email("doesnotexist@example.com")

        assert exists is False

    async def test_create_duplicate_email_fails(self, db_session):
        """
        Test that creating user with duplicate email fails.
        """
        from sqlalchemy.exc import IntegrityError

        repo = UserRepository(db_session)

        # Create first user
        await repo.create(email="duplicate@example.com", name="First User", password="password123")

        # Try to create second user with same email
        with pytest.raises(IntegrityError):
            await repo.create(email="duplicate@example.com", name="Second User", password="password456")
