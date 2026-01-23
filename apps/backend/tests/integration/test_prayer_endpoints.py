"""
Integration tests for prayer request endpoints.
"""

import uuid

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


@pytest.mark.asyncio
class TestPrayerEndpoints:
    """Test prayer request API endpoints."""

    async def test_create_prayer_request(self, client: AsyncClient):
        """Test creating a new prayer request."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.post(
            "/prayer/requests",
            params={"tenant_id": tenant_id},
            json={"content": "Por favor, orem pela minha família.", "category": "family", "is_anonymous": False},
            headers=headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Por favor, orem pela minha família."
        assert "id" in data

    async def test_create_anonymous_prayer_request(self, client: AsyncClient):
        """Test creating an anonymous prayer request."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.post(
            "/prayer/requests",
            params={"tenant_id": tenant_id},
            json={"content": "Pedido confidencial.", "category": "spiritual", "is_anonymous": True},
            headers=headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_anonymous"] is True

    async def test_list_prayer_requests(self, client: AsyncClient):
        """Test listing prayer requests."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        await client.post(
            "/prayer/requests",
            params={"tenant_id": tenant_id},
            json={"content": "Pedido de oração 1", "category": "health"},
            headers=headers,
        )
        await client.post(
            "/prayer/requests",
            params={"tenant_id": tenant_id},
            json={"content": "Pedido de oração 2", "category": "work"},
            headers=headers,
        )

        response = await client.get("/prayer/requests", params={"tenant_id": tenant_id}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    async def test_pray_for_request(self, client: AsyncClient):
        """Test incrementing prayer count."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        create_resp = await client.post(
            "/prayer/requests",
            params={"tenant_id": tenant_id},
            json={"content": "Pedido para orar por saúde"},
            headers=headers,
        )
        request_id = create_resp.json()["id"]

        response = await client.post(
            f"/prayer/requests/{request_id}/pray", params={"tenant_id": tenant_id}, headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "prayer_count" in data
        assert data["prayer_count"] >= 1

    async def test_pray_for_request_not_found(self, client: AsyncClient):
        """Test praying for non-existent request returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.post(
            "/prayer/requests/nonexistent-id/pray", params={"tenant_id": tenant_id}, headers=headers
        )
        assert response.status_code == 404

    async def test_delete_prayer_request(self, client: AsyncClient):
        """Test deleting a prayer request."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        create_resp = await client.post(
            "/prayer/requests",
            params={"tenant_id": tenant_id},
            json={"content": "Pedido a ser deletado"},
            headers=headers,
        )
        request_id = create_resp.json()["id"]

        response = await client.delete(
            f"/prayer/requests/{request_id}", params={"tenant_id": tenant_id}, headers=headers
        )
        assert response.status_code == 200

        pray_resp = await client.post(
            f"/prayer/requests/{request_id}/pray", params={"tenant_id": tenant_id}, headers=headers
        )
        assert pray_resp.status_code == 404

    async def test_delete_prayer_request_not_found(self, client: AsyncClient):
        """Test deleting non-existent request returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.delete(
            "/prayer/requests/nonexistent-id", params={"tenant_id": tenant_id}, headers=headers
        )
        assert response.status_code == 404

    async def test_prayer_requests_require_auth(self, client: AsyncClient):
        """Test that prayer endpoints require authentication."""
        response = await client.get("/prayer/requests", params={"tenant_id": "some-tenant-id"})
        assert response.status_code == 401
