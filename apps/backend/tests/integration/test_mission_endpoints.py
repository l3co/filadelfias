"""
Integration tests for mission endpoints.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from src.infra.database import get_db
from src.main import app


@pytest.mark.asyncio
class TestMissionEndpoints:
    """Test mission API endpoints."""

    async def get_auth_token(self, client, email="mission_user@test.com"):
        try:
            await client.post(
                "/auth/register", json={"email": email, "name": "Mission User", "password": "password123"}
            )
        except Exception:
            pass
        response = await client.post("/auth/login", data={"username": email, "password": "password123"})
        return response.json()["access_token"]

    async def create_tenant(self, client, token, slug="miss-church"):
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/tenants", json={"name": "Mission Church", "slug": slug}, headers=headers)
        return response.json()

    async def test_create_and_list_missionaries(self, db_session, override_get_db):
        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await self.get_auth_token(client, "mission@church.com")
            headers = {"Authorization": f"Bearer {token}"}
            tenant = await self.create_tenant(client, token, "mission-church")
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

        app.dependency_overrides.clear()
