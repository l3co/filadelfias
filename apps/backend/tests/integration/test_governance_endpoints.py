"""
Integration tests for governance endpoints.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.mark.asyncio
class TestGovernanceEndpoints:
    """Test governance API endpoints."""

    async def get_auth_token(self, client, email="gov_user@test.com"):
        """Helper to register and login a user."""
        # Check if already exists by try/except login first? No, just register unique
        await client.post("/auth/register", json={"email": email, "name": "Gov User", "password": "password123"})

        response = await client.post("/auth/login", data={"username": email, "password": "password123"})
        return response.json()["access_token"]

    async def create_tenant(self, client, token, slug="gov-church"):
        """Helper to create a tenant."""
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/tenants", json={"name": "Governance Church", "slug": slug}, headers=headers)
        return response.json()

    async def test_create_and_list_councils(self):
        """
        Test creating and listing councils.
        """

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await self.get_auth_token(client, "council_test@test.com")
            headers = {"Authorization": f"Bearer {token}"}
            tenant = await self.create_tenant(client, token, "council-church")
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

        app.dependency_overrides.clear()

    async def test_create_and_list_meetings(self, db_session, override_get_db):
        """
        Test creating and listing meetings.
        """
        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await self.get_auth_token(client, "meeting_test@test.com")
            headers = {"Authorization": f"Bearer {token}"}
            tenant = await self.create_tenant(client, token, "meeting-church")
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
            resp = await client.get(f"/governance/councils/{council_id}/meetings", headers=headers)
            assert resp.status_code == 200
            meetings = resp.json()
            assert len(meetings) == 1
            assert meetings[0]["id"] == meeting_data["id"]

        app.dependency_overrides.clear()
