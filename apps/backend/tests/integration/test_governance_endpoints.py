"""
Integration tests for governance endpoints.
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
class TestGovernanceEndpoints:
    """Test governance API endpoints."""

    async def test_create_and_list_councils(self, client: AsyncClient):
        """Test creating and listing councils."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create Council
        resp = await client.post(
            "/governance/councils",
            params={"tenant_id": tenant_id},
            json={"name": "Conselho de Teste", "type": "SESSION", "description": "Conselho principal"},
            headers=headers,
        )
        assert resp.status_code == 200
        council_data = resp.json()
        assert council_data["name"] == "Conselho de Teste"
        assert council_data["type"] == "SESSION"

        # List Councils
        resp = await client.get("/governance/councils", params={"tenant_id": tenant_id}, headers=headers)
        assert resp.status_code == 200
        councils = resp.json()
        assert len(councils) > 0
        assert councils[0]["id"] == council_data["id"]

    async def test_create_and_list_meetings(self, client: AsyncClient):
        """Test creating and listing meetings."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create Council
        c_resp = await client.post(
            "/governance/councils",
            params={"tenant_id": tenant_id},
            json={"name": "Junta Diaconal", "type": "DEACONS"},
            headers=headers,
        )
        council_id = c_resp.json()["id"]

        # Create Meeting
        resp = await client.post(
            "/governance/meetings",
            params={"tenant_id": tenant_id},
            json={
                "council_id": council_id,
                "date": "2023-12-25T10:00:00",
                "agenda": "Reunião de Natal",
                "location": "Sala 1",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        meeting_data = resp.json()
        assert meeting_data["council_id"] == council_id
        assert meeting_data["status"] == "SCHEDULED"

        # List Meetings
        resp = await client.get(f"/governance/councils/{council_id}/meetings", params={"tenant_id": tenant_id}, headers=headers)
        assert resp.status_code == 200
        meetings = resp.json()
        assert len(meetings) == 1
        assert meetings[0]["id"] == meeting_data["id"]
