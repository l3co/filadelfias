"""
Integration tests for mission endpoints.
"""

import pytest
import uuid
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
class TestMissionEndpoints:
    """Test mission API endpoints."""

    async def test_create_missionary(self, client: AsyncClient):
        """Test creating a new missionary."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create Missionary
        resp = await client.post(
            "/missions/missionaries",
            params={"tenant_id": tenant_id},
            json={
                "name": "João Missionário",
                "field_name": "Moçambique",
                "country_code": "MZ",
                "latitude": -18.66,
                "longitude": 35.53,
                "bio": "Trabalhando com plantação de igrejas.",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "João Missionário"
        assert data["country_code"] == "MZ"

        # List Missionaries
        resp = await client.get("/missions/missionaries", params={"tenant_id": tenant_id}, headers=headers)
        assert resp.status_code == 200
        missionaries = resp.json()
        assert len(missionaries) == 1
        assert missionaries[0]["id"] == data["id"]
