"""
Integration tests for members management endpoints.
"""

import uuid

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def get_auth_token(client: AsyncClient):
    """Helper to register and login a user."""
    email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    await client.post(
        "/auth/register",
        json={"email": email, "name": "Test User", "password": "password123"}
    )
    response = await client.post(
        "/auth/login",
        data={"username": email, "password": "password123"}
    )
    return response.json()["access_token"]


async def create_tenant(client: AsyncClient, token: str):
    """Helper to create a tenant."""
    slug = f"church-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post(
        "/tenants",
        json={"name": "Test Church", "slug": slug},
        headers=headers
    )
    return response.json()


@pytest.mark.asyncio
class TestMembersEndpoints:
    """Test members API endpoints."""

    async def test_create_member(self, client: AsyncClient):
        """Test creating a new member."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.post(
            f"/tenants/{tenant_id}/members",
            json={
                "full_name": "Novo Membro",
                "email": f"membro_{uuid.uuid4().hex[:8]}@example.com",
                "status": "COMUNGANTE",
                "gender": "M",
                "office": "MEMBRO",
            },
            headers=headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["full_name"] == "Novo Membro"
        assert "id" in data

    async def test_list_members(self, client: AsyncClient):
        """Test listing members of a tenant."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create a member first
        await client.post(
            f"/tenants/{tenant_id}/members",
            json={
                "full_name": "Membro Lista",
                "email": f"lista_{uuid.uuid4().hex[:8]}@example.com",
                "status": "COMUNGANTE",
                "gender": "F",
                "office": "MEMBRO",
            },
            headers=headers,
        )

        response = await client.get(
            f"/tenants/{tenant_id}/members",
            headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
