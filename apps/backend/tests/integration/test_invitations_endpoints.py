"""
Integration tests for invitation and password endpoints.
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def get_auth_token(client: AsyncClient):
    """Helper to register and login a user."""
    email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    await client.post("/auth/register", json={"email": email, "name": "Test User", "password": "password123"})
    response = await client.post("/auth/login", data={"username": email, "password": "password123"})
    return response.json()["access_token"]


async def create_tenant(client: AsyncClient, token: str):
    """Helper to create a tenant."""
    slug = f"church-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post("/tenants", json={"name": "Test Church", "slug": slug}, headers=headers)
    return response.json()


async def create_member(client: AsyncClient, token: str, tenant_id: str, email: str = None):
    """Helper to create a member."""
    if email is None:
        email = f"member_{uuid.uuid4().hex[:8]}@test.com"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post(
        f"/tenants/{tenant_id}/members",
        json={
            "full_name": "Membro Para Convite",
            "email": email,
            "status": "COMUNGANTE",
            "gender": "M",
            "office": "MEMBRO",
        },
        headers=headers,
    )
    return response.json()


@pytest.mark.asyncio
class TestInvitationEndpoints:
    """Test member invitation endpoints."""

    async def test_invite_member_creates_user(self, client: AsyncClient):
        """Test that inviting a member creates a user account."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        member_email = f"newmember_{uuid.uuid4().hex[:8]}@test.com"
        member = await create_member(client, token, tenant_id, member_email)
        member_id = member["id"]

        with patch("src.services.email_service.email_service.send_welcome_email", new_callable=AsyncMock) as mock_email:
            mock_email.return_value = True
            response = await client.post(f"/tenants/{tenant_id}/members/{member_id}/invite", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "temporary_password" in data
        assert len(data["temporary_password"]) >= 8

    async def test_invite_member_sends_email(self, client: AsyncClient):
        """Test that inviting a member sends welcome email."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        member_email = f"newmember_{uuid.uuid4().hex[:8]}@test.com"
        member = await create_member(client, token, tenant_id, member_email)
        member_id = member["id"]

        with patch("src.services.email_service.email_service.send_welcome_email", new_callable=AsyncMock) as mock_email:
            mock_email.return_value = True
            response = await client.post(f"/tenants/{tenant_id}/members/{member_id}/invite", headers=headers)
            mock_email.assert_called_once()
            call_args = mock_email.call_args
            assert call_args[1]["to_email"] == member_email
            assert "Membro Para Convite" in call_args[1]["member_name"]

        data = response.json()
        assert data["email_sent"] is True

    async def test_invite_member_no_email(self, client: AsyncClient):
        """Test that inviting member without email fails."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        member_resp = await client.post(
            f"/tenants/{tenant_id}/members",
            json={"full_name": "Membro Sem Email", "status": "COMUNGANTE", "gender": "M", "role": "MEMBRO"},
            headers=headers,
        )
        member_id = member_resp.json()["id"]

        response = await client.post(f"/tenants/{tenant_id}/members/{member_id}/invite", headers=headers)

        assert response.status_code == 400
        assert "email" in response.json()["detail"].lower()

    async def test_invite_member_already_has_account(self, client: AsyncClient):
        """Test that inviting member with existing account fails."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        member_email = f"already_{uuid.uuid4().hex[:8]}@test.com"
        member = await create_member(client, token, tenant_id, member_email)
        member_id = member["id"]

        with patch("src.services.email_service.email_service.send_welcome_email", new_callable=AsyncMock) as mock_email:
            mock_email.return_value = True
            await client.post(f"/tenants/{tenant_id}/members/{member_id}/invite", headers=headers)

        response = await client.post(f"/tenants/{tenant_id}/members/{member_id}/invite", headers=headers)

        assert response.status_code == 400
        assert "conta" in response.json()["detail"].lower() or "account" in response.json()["detail"].lower()

    async def test_invite_member_not_found(self, client: AsyncClient):
        """Test that inviting non-existent member fails."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.post(f"/tenants/{tenant_id}/members/nonexistent-id/invite", headers=headers)
        assert response.status_code == 404


@pytest.mark.asyncio
class TestForgotPasswordEndpoints:
    """Test forgot password endpoints."""

    async def test_forgot_password_existing_user(self, client: AsyncClient):
        """Test forgot password for existing user."""
        email = f"forgot_{uuid.uuid4().hex[:8]}@test.com"
        await client.post("/auth/register", json={"email": email, "name": "Forgot User", "password": "password123"})

        with patch(
            "src.services.email_service.email_service.send_password_reset_email", new_callable=AsyncMock
        ) as mock_email:
            mock_email.return_value = True
            response = await client.post("/auth/forgot-password", json={"email": email})
            mock_email.assert_called_once()

        assert response.status_code == 200
        assert "email" in response.json()["message"].lower()

    async def test_forgot_password_nonexistent_user_no_leak(self, client: AsyncClient):
        """Test that forgot password doesn't leak user existence."""
        response = await client.post("/auth/forgot-password", json={"email": "nonexistent@test.com"})
        assert response.status_code == 200
        assert "email" in response.json()["message"].lower()


@pytest.mark.asyncio
class TestResetPasswordEndpoints:
    """Test reset password endpoints."""

    async def test_reset_password_invalid_token(self, client: AsyncClient):
        """Test reset password with invalid token fails."""
        response = await client.post(
            "/auth/reset-password", json={"token": "invalid-token", "new_password": "newpass123"}
        )
        assert response.status_code == 400
        assert "token" in response.json()["detail"].lower()


@pytest.mark.asyncio
class TestChangePasswordEndpoints:
    """Test change password endpoints."""

    async def test_change_password_success(self, client: AsyncClient):
        """Test changing password successfully."""
        email = f"change_{uuid.uuid4().hex[:8]}@test.com"
        await client.post("/auth/register", json={"email": email, "name": "Change User", "password": "password123"})
        login_resp = await client.post("/auth/login", data={"username": email, "password": "password123"})
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/auth/change-password",
            json={"current_password": "password123", "new_password": "newpassword456"},
            headers=headers,
        )

        assert response.status_code == 200
        assert "sucesso" in response.json()["message"].lower() or "success" in response.json()["message"].lower()

        login_resp = await client.post("/auth/login", data={"username": email, "password": "newpassword456"})
        assert login_resp.status_code == 200

    async def test_change_password_wrong_current(self, client: AsyncClient):
        """Test changing password with wrong current password fails."""
        email = f"change_{uuid.uuid4().hex[:8]}@test.com"
        await client.post("/auth/register", json={"email": email, "name": "Change User", "password": "password123"})
        login_resp = await client.post("/auth/login", data={"username": email, "password": "password123"})
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/auth/change-password",
            json={"current_password": "wrongpassword", "new_password": "newpassword456"},
            headers=headers,
        )

        assert response.status_code == 400
        assert "incorreta" in response.json()["detail"].lower() or "incorrect" in response.json()["detail"].lower()

    async def test_change_password_requires_auth(self, client: AsyncClient):
        """Test that changing password requires authentication."""
        response = await client.post(
            "/auth/change-password", json={"current_password": "password123", "new_password": "newpassword456"}
        )
        assert response.status_code == 401
