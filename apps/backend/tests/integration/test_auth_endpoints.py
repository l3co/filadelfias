"""
Integration tests for authentication endpoints.
"""

import pytest
import uuid
from httpx import AsyncClient

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
class TestAuthEndpoints:
    """Test authentication API endpoints."""

    async def test_register_new_user(self, client: AsyncClient):
        """Test user registration endpoint."""
        email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
        response = await client.post(
            "/auth/register",
            json={"email": email, "name": "New User", "password": "password123"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == email
        assert data["name"] == "New User"
        assert "id" in data
        assert "password" not in data
        assert "password_hash" not in data

    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test that registering with duplicate email fails."""
        email = f"duplicate_{uuid.uuid4().hex[:8]}@example.com"
        
        # Register first user
        await client.post(
            "/auth/register",
            json={"email": email, "name": "First User", "password": "password123"},
        )

        # Try to register second user with same email
        response = await client.post(
            "/auth/register",
            json={"email": email, "name": "Second User", "password": "password456"},
        )

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    async def test_login_success(self, client: AsyncClient):
        """Test successful login."""
        email = f"login_{uuid.uuid4().hex[:8]}@example.com"
        
        # Register user
        await client.post(
            "/auth/register",
            json={"email": email, "name": "Login User", "password": "password123"}
        )

        # Login
        response = await client.post(
            "/auth/login",
            data={"username": email, "password": "password123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient):
        """Test login with wrong password fails."""
        email = f"wrongpass_{uuid.uuid4().hex[:8]}@example.com"
        
        # Register user
        await client.post(
            "/auth/register",
            json={"email": email, "name": "Wrong Pass User", "password": "correctpassword"},
        )

        # Try to login with wrong password
        response = await client.post(
            "/auth/login",
            data={"username": email, "password": "wrongpassword"}
        )

        assert response.status_code == 401

    async def test_get_current_user(self, client: AsyncClient):
        """Test getting current user profile with valid token."""
        email = f"getme_{uuid.uuid4().hex[:8]}@example.com"
        
        # Register user
        await client.post(
            "/auth/register",
            json={"email": email, "name": "Get Me User", "password": "password123"}
        )

        # Login to get token
        login_response = await client.post(
            "/auth/login",
            data={"username": email, "password": "password123"}
        )
        token = login_response.json()["access_token"]

        # Get current user
        response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == email
        assert data["name"] == "Get Me User"

    async def test_get_current_user_without_token(self, client: AsyncClient):
        """Test that accessing /me without token fails."""
        response = await client.get("/auth/me")

        assert response.status_code == 401
