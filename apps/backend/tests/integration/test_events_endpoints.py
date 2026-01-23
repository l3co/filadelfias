"""
Integration tests for events endpoints.
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
class TestEventsEndpoints:
    """Test events API endpoints."""

    async def test_create_event(self, client: AsyncClient):
        """Test creating a new event."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.post(
            "/events",
            params={"tenant_id": tenant_id},
            json={
                "title": "Culto de Domingo",
                "description": "Culto dominical às 19h",
                "start_date": "2024-12-15T19:00:00",
                "end_date": "2024-12-15T21:00:00",
                "location": "Templo Principal"
            },
            headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Culto de Domingo"
        assert "id" in data

    async def test_list_events(self, client: AsyncClient):
        """Test listing events."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create events
        await client.post("/events", params={"tenant_id": tenant_id}, json={"title": "Evento 1", "start_date": "2024-12-15T19:00:00"}, headers=headers)
        await client.post("/events", params={"tenant_id": tenant_id}, json={"title": "Evento 2", "start_date": "2024-12-16T19:00:00"}, headers=headers)

        # List events
        response = await client.get("/events", params={"tenant_id": tenant_id}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    async def test_get_event(self, client: AsyncClient):
        """Test getting a specific event."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create event
        create_resp = await client.post("/events", params={"tenant_id": tenant_id}, json={"title": "Evento Específico", "start_date": "2024-12-15T19:00:00"}, headers=headers)
        event_id = create_resp.json()["id"]

        # Get event
        response = await client.get(f"/events/{event_id}", params={"tenant_id": tenant_id}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Evento Específico"
        assert data["id"] == event_id

    async def test_get_event_not_found(self, client: AsyncClient):
        """Test getting non-existent event returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.get("/events/nonexistent-id", params={"tenant_id": tenant_id}, headers=headers)
        assert response.status_code == 404

    async def test_update_event(self, client: AsyncClient):
        """Test updating an event."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create event
        create_resp = await client.post("/events", params={"tenant_id": tenant_id}, json={"title": "Evento Original", "start_date": "2024-12-15T19:00:00"}, headers=headers)
        event_id = create_resp.json()["id"]

        # Update event
        response = await client.patch(f"/events/{event_id}", params={"tenant_id": tenant_id}, json={"title": "Evento Atualizado"}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Evento Atualizado"

    async def test_update_event_not_found(self, client: AsyncClient):
        """Test updating non-existent event returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.patch("/events/nonexistent-id", params={"tenant_id": tenant_id}, json={"title": "New Title"}, headers=headers)
        assert response.status_code == 404

    async def test_delete_event(self, client: AsyncClient):
        """Test deleting an event."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create event
        create_resp = await client.post("/events", params={"tenant_id": tenant_id}, json={"title": "Evento a Deletar", "start_date": "2024-12-15T19:00:00"}, headers=headers)
        event_id = create_resp.json()["id"]

        # Delete event
        response = await client.delete(f"/events/{event_id}", params={"tenant_id": tenant_id}, headers=headers)
        assert response.status_code == 200

        # Verify deleted
        get_resp = await client.get(f"/events/{event_id}", params={"tenant_id": tenant_id}, headers=headers)
        assert get_resp.status_code == 404

    async def test_delete_event_not_found(self, client: AsyncClient):
        """Test deleting non-existent event returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.delete("/events/nonexistent-id", params={"tenant_id": tenant_id}, headers=headers)
        assert response.status_code == 404

    async def test_events_require_auth(self, client: AsyncClient):
        """Test that events endpoints require authentication."""
        response = await client.get("/events", params={"tenant_id": "some-tenant-id"})
        assert response.status_code == 401
