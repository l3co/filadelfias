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
    password = "S3cureP@ssword!"
    await client.post("/auth/register", json={"email": email, "name": "Test User", "password": password})
    response = await client.post("/auth/login", data={"username": email, "password": password})
    return response.json()["access_token"]


async def create_tenant(client: AsyncClient, token: str):
    """Helper to create a tenant."""
    slug = f"church-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post("/tenants", json={"name": "Test Church", "slug": slug}, headers=headers)
    return response.json()


async def create_council_and_meeting(client: AsyncClient, headers: dict, tenant_id: str):
    """Helper to create a council and a meeting for testing."""
    # Create Council
    c_resp = await client.post(
        "/governance/councils",
        params={"tenant_id": tenant_id},
        json={"name": "Conselho de Teste", "type": "SESSION"},
        headers=headers,
    )
    council_id = c_resp.json()["id"]

    # Create Meeting
    m_resp = await client.post(
        "/governance/meetings",
        params={"tenant_id": tenant_id},
        json={
            "council_id": council_id,
            "date": "2026-02-15T19:30:00",
            "agenda": "Pauta de Teste",
            "location": "Sala Principal",
            "meeting_type": "ORDINARY",
        },
        headers=headers,
    )
    meeting_data = m_resp.json()
    return council_id, meeting_data


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
        resp = await client.get(
            f"/governance/councils/{council_id}/meetings", params={"tenant_id": tenant_id}, headers=headers
        )
        assert resp.status_code == 200
        meetings = resp.json()
        assert len(meetings) == 1
        assert meetings[0]["id"] == meeting_data["id"]

    async def test_create_meeting_with_type(self, client: AsyncClient):
        """Test creating a meeting with meeting_type field."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        # Create Council
        c_resp = await client.post(
            "/governance/councils",
            params={"tenant_id": tenant_id},
            json={"name": "Conselho", "type": "SESSION"},
            headers=headers,
        )
        council_id = c_resp.json()["id"]

        # Create Ordinary Meeting
        resp = await client.post(
            "/governance/meetings",
            params={"tenant_id": tenant_id},
            json={
                "council_id": council_id,
                "date": "2026-01-15T19:30:00",
                "agenda": "Reunião Ordinária Mensal",
                "meeting_type": "ORDINARY",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["meeting_type"] == "ORDINARY"

        # Create Extraordinary Meeting
        resp = await client.post(
            "/governance/meetings",
            params={"tenant_id": tenant_id},
            json={
                "council_id": council_id,
                "date": "2026-01-20T10:00:00",
                "agenda": "Reunião Extraordinária - Assunto Urgente",
                "meeting_type": "EXTRAORDINARY",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["meeting_type"] == "EXTRAORDINARY"

    async def test_get_meeting_by_id(self, client: AsyncClient):
        """Test retrieving a single meeting by ID."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        council_id, meeting_data = await create_council_and_meeting(client, headers, tenant_id)

        # Get Meeting by ID
        resp = await client.get(
            f"/governance/meetings/{meeting_data['id']}", params={"tenant_id": tenant_id}, headers=headers
        )
        assert resp.status_code == 200
        fetched = resp.json()
        assert fetched["id"] == meeting_data["id"]
        assert fetched["council_id"] == council_id
        assert fetched["agenda"] == "Pauta de Teste"

    async def test_get_meeting_not_found(self, client: AsyncClient):
        """Test 404 when meeting is not found."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        fake_id = str(uuid.uuid4())
        resp = await client.get(f"/governance/meetings/{fake_id}", params={"tenant_id": tenant_id}, headers=headers)
        assert resp.status_code == 404

    async def test_update_meeting(self, client: AsyncClient):
        """Test updating meeting details (minutes and attendees)."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        council_id, meeting_data = await create_council_and_meeting(client, headers, tenant_id)
        meeting_id = meeting_data["id"]

        # Update Meeting with minutes and attendees
        resp = await client.patch(
            f"/governance/meetings/{meeting_id}",
            params={"tenant_id": tenant_id},
            json={
                "minutes": "Ata da reunião: Discutimos temas importantes.",
                "attendees": ["member-1", "member-2", "member-3"],
            },
            headers=headers,
        )
        assert resp.status_code == 200
        updated = resp.json()
        assert updated["minutes"] == "Ata da reunião: Discutimos temas importantes."
        assert updated["attendees"] == ["member-1", "member-2", "member-3"]

        # Update agenda
        resp = await client.patch(
            f"/governance/meetings/{meeting_id}",
            params={"tenant_id": tenant_id},
            json={"agenda": "Nova pauta atualizada"},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["agenda"] == "Nova pauta atualizada"

    async def test_complete_meeting(self, client: AsyncClient):
        """Test completing/finalizing a meeting."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        council_id, meeting_data = await create_council_and_meeting(client, headers, tenant_id)
        meeting_id = meeting_data["id"]

        # Complete the meeting
        resp = await client.post(
            f"/governance/meetings/{meeting_id}/complete", params={"tenant_id": tenant_id}, headers=headers
        )
        assert resp.status_code == 200
        completed = resp.json()
        assert completed["status"] == "COMPLETED"
        assert completed["completed_at"] is not None

    async def test_cannot_update_completed_meeting(self, client: AsyncClient):
        """Test that completed meetings cannot be updated."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        council_id, meeting_data = await create_council_and_meeting(client, headers, tenant_id)
        meeting_id = meeting_data["id"]

        # Complete the meeting first
        await client.post(
            f"/governance/meetings/{meeting_id}/complete", params={"tenant_id": tenant_id}, headers=headers
        )

        # Try to update the completed meeting
        resp = await client.patch(
            f"/governance/meetings/{meeting_id}",
            params={"tenant_id": tenant_id},
            json={"minutes": "Tentativa de alteração"},
            headers=headers,
        )
        assert resp.status_code == 400
        assert "Cannot update a completed meeting" in resp.json()["detail"]

    async def test_cannot_complete_already_completed_meeting(self, client: AsyncClient):
        """Test that already completed meetings cannot be completed again."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        council_id, meeting_data = await create_council_and_meeting(client, headers, tenant_id)
        meeting_id = meeting_data["id"]

        # Complete the meeting
        await client.post(
            f"/governance/meetings/{meeting_id}/complete", params={"tenant_id": tenant_id}, headers=headers
        )

        # Try to complete again
        resp = await client.post(
            f"/governance/meetings/{meeting_id}/complete", params={"tenant_id": tenant_id}, headers=headers
        )
        assert resp.status_code == 400
        assert "already completed" in resp.json()["detail"]

    async def test_list_and_cast_votes(self, client: AsyncClient):
        """Test listing voting items and casting a vote for a meeting agenda item."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        _, meeting_data = await create_council_and_meeting(client, headers, tenant_id)
        meeting_id = meeting_data["id"]

        resp = await client.get(f"/governance/meetings/{meeting_id}/votes", params={"tenant_id": tenant_id}, headers=headers)
        assert resp.status_code == 200
        voting_items = resp.json()
        assert len(voting_items) == 1
        assert voting_items[0]["yes_count"] == 0
        assert voting_items[0]["user_vote"] is None

        resp = await client.post(
            f"/governance/meetings/{meeting_id}/votes/1",
            params={"tenant_id": tenant_id},
            json={"choice": "yes"},
            headers=headers,
        )
        assert resp.status_code == 200
        voted_item = resp.json()
        assert voted_item["yes_count"] == 1
        assert voted_item["no_count"] == 0
        assert voted_item["abstain_count"] == 0
        assert voted_item["user_vote"] == "yes"

        resp = await client.post(
            f"/governance/meetings/{meeting_id}/votes/1",
            params={"tenant_id": tenant_id},
            json={"choice": "abstain"},
            headers=headers,
        )
        assert resp.status_code == 200
        updated_item = resp.json()
        assert updated_item["yes_count"] == 0
        assert updated_item["abstain_count"] == 1
        assert updated_item["user_vote"] == "abstain"

    async def test_cannot_vote_on_completed_meeting(self, client: AsyncClient):
        """Test voting is blocked after a meeting is completed."""
        token = await get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        tenant = await create_tenant(client, token)
        tenant_id = tenant["id"]

        _, meeting_data = await create_council_and_meeting(client, headers, tenant_id)
        meeting_id = meeting_data["id"]

        resp = await client.post(
            f"/governance/meetings/{meeting_id}/complete", params={"tenant_id": tenant_id}, headers=headers
        )
        assert resp.status_code == 200

        resp = await client.post(
            f"/governance/meetings/{meeting_id}/votes/1",
            params={"tenant_id": tenant_id},
            json={"choice": "yes"},
            headers=headers,
        )
        assert resp.status_code == 400
        assert "Voting is closed" in resp.json()["detail"]
