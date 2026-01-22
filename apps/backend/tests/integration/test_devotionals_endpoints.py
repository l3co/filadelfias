"""
Integration tests for devotionals endpoints.
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
class TestDevotionalsEndpoints:
    """Test devotionals API endpoints."""

    async def test_create_devotional(self, client: AsyncClient):
        """Test creating a new devotional."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.post("/devotionals", params={"tenant_id": tenant_id}, json={"title": "Devocional de Hoje", "verse_reference": "João 3:16", "verse_text": "Porque Deus amou o mundo...", "meditation": "Reflexão sobre o amor de Deus", "date": "2024-12-15"}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Devocional de Hoje"
        assert "id" in data

    async def test_list_devotionals(self, client: AsyncClient):
        """Test listing devotionals."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        await client.post("/devotionals", params={"tenant_id": tenant_id}, json={"title": "Devocional 1", "verse_reference": "Sl 23:1", "verse_text": "O Senhor é meu pastor", "meditation": "Meditação 1", "date": "2024-12-14"}, headers=headers)
        await client.post("/devotionals", params={"tenant_id": tenant_id}, json={"title": "Devocional 2", "verse_reference": "Sl 91:1", "verse_text": "Aquele que habita", "meditation": "Meditação 2", "date": "2024-12-15"}, headers=headers)

        response = await client.get("/devotionals", params={"tenant_id": tenant_id}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    async def test_get_devotional(self, client: AsyncClient):
        """Test getting a specific devotional."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        create_resp = await client.post("/devotionals", params={"tenant_id": tenant_id}, json={"title": "Devocional Específico", "verse_reference": "Jo 1:1", "verse_text": "No princípio era o Verbo", "meditation": "Meditação específica", "date": "2024-12-15"}, headers=headers)
        devot_id = create_resp.json()["id"]

        response = await client.get(f"/devotionals/{devot_id}", params={"tenant_id": tenant_id}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Devocional Específico"

    async def test_get_devotional_not_found(self, client: AsyncClient):
        """Test getting non-existent devotional returns 404."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        response = await client.get("/devotionals/nonexistent-id", params={"tenant_id": tenant_id}, headers=headers)
        assert response.status_code == 404

    async def test_get_devotional_by_date(self, client: AsyncClient):
        """Test getting devotional by date."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        await client.post("/devotionals", params={"tenant_id": tenant_id}, json={"title": "Devocional Data Específica", "verse_reference": "Lc 2:11", "verse_text": "Hoje vos nasceu", "meditation": "Meditação de Natal", "date": "2024-12-25"}, headers=headers)

        response = await client.get("/devotionals/date/2024-12-25", params={"tenant_id": tenant_id}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Devocional Data Específica"

    async def test_update_devotional(self, client: AsyncClient):
        """Test updating a devotional."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        create_resp = await client.post("/devotionals", params={"tenant_id": tenant_id}, json={"title": "Devocional Original", "verse_reference": "Rm 8:28", "verse_text": "Todas as coisas cooperam", "meditation": "Meditação original", "date": "2024-12-15"}, headers=headers)
        devot_id = create_resp.json()["id"]

        response = await client.patch(f"/devotionals/{devot_id}", params={"tenant_id": tenant_id}, json={"title": "Devocional Atualizado"}, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Devocional Atualizado"

    async def test_delete_devotional(self, client: AsyncClient):
        """Test deleting a devotional."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        create_resp = await client.post("/devotionals", params={"tenant_id": tenant_id}, json={"title": "Devocional a Deletar", "verse_reference": "Fp 4:13", "verse_text": "Tudo posso", "meditation": "Meditação a deletar", "date": "2024-12-15"}, headers=headers)
        devot_id = create_resp.json()["id"]

        response = await client.delete(f"/devotionals/{devot_id}", params={"tenant_id": tenant_id}, headers=headers)
        assert response.status_code == 200

        get_resp = await client.get(f"/devotionals/{devot_id}", params={"tenant_id": tenant_id}, headers=headers)
        assert get_resp.status_code == 404

    async def test_devotionals_require_auth(self, client: AsyncClient):
        """Test that devotionals endpoints require authentication."""
        response = await client.get("/devotionals", params={"tenant_id": "some-tenant-id"})
        assert response.status_code == 401
