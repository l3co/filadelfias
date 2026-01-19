"""
Integration tests for EBD endpoints.
"""
import pytest
from httpx import ASGITransport, AsyncClient

from src.infra.database import get_db
from src.main import app


@pytest.mark.asyncio
class TestEBDEndpoints:
    """Test EBD API endpoints."""

    async def get_auth_token(self, client, email="ebd_user@test.com"):
        try:
            await client.post(
                "/auth/register",
                json={
                    "email": email,
                    "name": "EBD User",
                    "password": "password123"
                }
            )
        except Exception:
            pass
        response = await client.post(
            "/auth/login",
            data={
                "username": email,
                "password": "password123"
            }
        )
        return response.json()["access_token"]

    async def create_tenant(self, client, token, slug="ebd-church"):
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post(
            "/tenants",
            json={"name": "EBD Church", "slug": slug},
            headers=headers
        )
        return response.json()

    async def create_member(self, client, token, tenant_id, name="Aluno Teste"):
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post(
            f"/tenants/{tenant_id}/members",
            json={
                "full_name": name,
                "email": "aluno@test.com",
                "status": "COMUNGANTE",
                "gender": "M",
                "role": "MEMBRO"
            },
            headers=headers
        )
        return response.json()

    async def test_ebd_full_flow(self, db_session, override_get_db):
        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await self.get_auth_token(client, "ebd_admin@test.com")
            headers = {"Authorization": f"Bearer {token}"}
            tenant = await self.create_tenant(client, token, "ebd-main")
            tenant_id = tenant["id"]

            # 1. Create Class
            class_resp = await client.post(
                "/ebd/classes",
                params={"tenant_id": tenant_id},
                json={"name": "Jardim de Infância", "min_age": 3, "max_age": 5},
                headers=headers
            )
            assert class_resp.status_code == 200
            ebd_class = class_resp.json()
            class_id = ebd_class["id"]

            # 2. Create Member
            member = await self.create_member(client, token, tenant_id)
            member_id = member["id"]

            # 3. Enroll Student
            enroll_resp = await client.post(
                f"/ebd/classes/{class_id}/students",
                json={"member_id": member_id, "role": "STUDENT"},
                headers=headers
            )
            assert enroll_resp.status_code == 200

            # 4. Create Lesson
            lesson_resp = await client.post(
                f"/ebd/classes/{class_id}/lessons",
                json={
                    "ebd_class_id": class_id,
                    "date": "2023-12-31",
                    "topic": "A Criação",
                    "description": "Deus criou tudo."
                },
                headers=headers
            )
            assert lesson_resp.status_code == 200

            # 5. List Classes
            list_resp = await client.get("/ebd/classes", params={"tenant_id": tenant_id}, headers=headers)
            classes = list_resp.json()
            assert len(classes) >= 1

        app.dependency_overrides.clear()
