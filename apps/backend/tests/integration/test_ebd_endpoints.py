"""
Integration tests for EBD endpoints.
"""

import uuid

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def get_auth_token(client: AsyncClient):
    """Helper to register and login a user."""
    email = f"user_{uuid.uuid4().hex[:8]}@test.com"
    await client.post("/auth/register", json={"email": email, "name": "Test User", "password": "S3cureP@ssword!"})
    response = await client.post("/auth/login", data={"username": email, "password": "S3cureP@ssword!"})
    return response.json()["access_token"]


async def create_tenant(client: AsyncClient, token: str):
    """Helper to create a tenant."""
    slug = f"church-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post("/tenants", json={"name": "Test Church", "slug": slug}, headers=headers)
    return response.json()


async def create_member(client: AsyncClient, token: str, tenant_id: str):
    """Helper to create a member."""
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post(
        f"/tenants/{tenant_id}/members",
        json={
            "full_name": "Aluno Teste",
            "email": f"aluno_{uuid.uuid4().hex[:8]}@test.com",
            "status": "COMUNGANTE",
            "gender": "M",
            "office": "MEMBRO",
        },
        headers=headers,
    )
    return response.json()


@pytest.mark.asyncio
class TestEBDEndpoints:
    """Test EBD API endpoints."""

    async def test_ebd_full_flow(self, client: AsyncClient):
        """Test complete EBD flow."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # 1. Create Class
        class_resp = await client.post(
            "/ebd/classes",
            params={"tenant_id": tenant_id},
            json={"name": "Jardim de Infância", "min_age": 3, "max_age": 5},
            headers=headers,
        )
        assert class_resp.status_code == 200
        ebd_class = class_resp.json()
        class_id = ebd_class["id"]

        # 2. Create Member
        member = await create_member(client, token, tenant_id)
        member_id = member["id"]

        # 3. Enroll Student
        enroll_resp = await client.post(
            f"/ebd/classes/{class_id}/students",
            params={"tenant_id": tenant_id},
            json={"member_id": member_id, "role": "STUDENT"},
            headers=headers,
        )
        assert enroll_resp.status_code == 200

        # 4. Create Lesson
        lesson_resp = await client.post(
            f"/ebd/classes/{class_id}/lessons",
            params={"tenant_id": tenant_id},
            json={
                "ebd_class_id": class_id,
                "date": "2023-12-31",
                "topic": "A Criação",
                "description": "Deus criou tudo.",
            },
            headers=headers,
        )
        assert lesson_resp.status_code == 200

        # 5. List Classes
        list_resp = await client.get("/ebd/classes", params={"tenant_id": tenant_id}, headers=headers)
        classes = list_resp.json()
        assert len(classes) >= 1
