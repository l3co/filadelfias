"""
Integration tests for bible endpoints backed by PostgreSQL.
"""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
class TestBibleEndpoints:
    async def test_list_versions_from_database(self, client: AsyncClient):
        from src.scripts.import_bible_data import _run as import_bible_data

        await import_bible_data("nvi", dry_run=False)

        response = await client.get("/bible/versions")

        assert response.status_code == 200
        data = response.json()
        assert any(item["id"] == "nvi" for item in data)
        assert any(item["id"] == "ara" for item in data)

    async def test_get_books_and_chapter_from_database(self, client: AsyncClient):
        from src.scripts.import_bible_data import _run as import_bible_data

        await import_bible_data("nvi", dry_run=False)

        books_response = await client.get("/bible/books", params={"version": "nvi"})
        chapter_response = await client.get("/bible/gn/1", params={"version": "nvi"})

        assert books_response.status_code == 200
        assert chapter_response.status_code == 200

        books = books_response.json()
        chapter = chapter_response.json()
        assert books[0]["abbrev"] == "gn"
        assert books[0]["testament"] == "old"
        assert chapter["book_abbrev"] == "gn"
        assert chapter["chapter"] == 1
        assert isinstance(chapter["verses"], list)
        assert len(chapter["verses"]) > 0

    async def test_search_and_verse_endpoint(self, client: AsyncClient):
        from src.scripts.import_bible_data import _run as import_bible_data

        await import_bible_data("nvi", dry_run=False)

        search_response = await client.get("/bible/search", params={"q": "Deus", "version": "nvi", "limit": 5})
        verse_response = await client.get("/bible/gn/1/1", params={"version": "nvi"})

        assert search_response.status_code == 200
        assert verse_response.status_code == 200

        search_data = search_response.json()
        verse_data = verse_response.json()
        assert search_data["total"] >= 1
        assert len(search_data["results"]) >= 1
        assert verse_data["reference"] == "Gênesis 1:1"

    async def test_metrics_endpoint_returns_table_sizes_and_index_usage(
        self, client: AsyncClient, tenant_with_admin: dict
    ):
        from src.scripts.import_bible_data import _run as import_bible_data

        await import_bible_data("nvi", dry_run=False)

        response = await client.get("/bible/metrics", headers=tenant_with_admin["headers"])

        assert response.status_code == 200
        data = response.json()
        assert data["database"] in {"postgresql", "sqlite"}
        assert any(item["table_name"] == "bible_verses" for item in data["table_sizes"])
        assert "index_usage" in data

    async def test_notes_and_highlights_crud(self, client: AsyncClient, tenant_with_admin: dict):
        from src.scripts.import_bible_data import _run as import_bible_data

        await import_bible_data("nvi", dry_run=False)
        tenant_id = tenant_with_admin["tenant_id"]
        headers = tenant_with_admin["headers"]

        create_note = await client.post(
            "/bible/notes",
            headers=headers,
            json={
                "tenant_id": tenant_id,
                "version_code": "nvi",
                "book_abbrev": "gn",
                "chapter": 1,
                "verse": 1,
                "content": "Anotação de teste",
                "is_public": False,
            },
        )
        assert create_note.status_code == 201
        note = create_note.json()

        list_notes = await client.get("/bible/notes", headers=headers, params={"tenant_id": tenant_id, "book": "gn"})
        assert list_notes.status_code == 200
        assert len(list_notes.json()) == 1

        update_note = await client.put(
            f"/bible/notes/{note['id']}",
            headers=headers,
            json={"content": "Anotação atualizada"},
        )
        assert update_note.status_code == 200
        assert update_note.json()["content"] == "Anotação atualizada"

        create_highlight = await client.post(
            "/bible/highlights",
            headers=headers,
            json={
                "tenant_id": tenant_id,
                "version_code": "nvi",
                "book_abbrev": "gn",
                "chapter": 1,
                "verse": 1,
                "color": "yellow",
                "category": "promise",
            },
        )
        assert create_highlight.status_code == 201
        highlight = create_highlight.json()

        list_highlights = await client.get(
            "/bible/highlights",
            headers=headers,
            params={"tenant_id": tenant_id, "version": "nvi"},
        )
        assert list_highlights.status_code == 200
        assert len(list_highlights.json()) == 1

        delete_highlight = await client.delete(f"/bible/highlights/{highlight['id']}", headers=headers)
        delete_note = await client.delete(f"/bible/notes/{note['id']}", headers=headers)

        assert delete_highlight.status_code == 204
        assert delete_note.status_code == 204

    async def test_reading_plan_progress_rejects_days_outside_plan_range(
        self, client: AsyncClient, tenant_with_admin: dict
    ):
        tenant_id = tenant_with_admin["tenant_id"]
        headers = tenant_with_admin["headers"]

        create_plan = await client.post(
            "/bible/reading-plans",
            headers=headers,
            json={
                "tenant_id": tenant_id,
                "name": "Plano curto",
                "description": "Teste de validacao de progresso",
                "duration_days": 3,
                "readings": [
                    {"day": 1, "title": "Dia 1", "references": ["Gn 1"]},
                    {"day": 2, "title": "Dia 2", "references": ["Gn 2"]},
                    {"day": 3, "title": "Dia 3", "references": ["Gn 3"]},
                ],
                "is_public": True,
            },
        )
        assert create_plan.status_code == 201
        plan_id = create_plan.json()["id"]

        start_plan = await client.post(f"/bible/reading-plans/{plan_id}/start", headers=headers)
        assert start_plan.status_code == 200
        assert start_plan.json()["current_day"] == 1

        invalid_low_day = await client.post(
            f"/bible/reading-plans/{plan_id}/progress",
            headers=headers,
            json={"day": 0},
        )
        assert invalid_low_day.status_code == 422

        invalid_high_day = await client.post(
            f"/bible/reading-plans/{plan_id}/progress",
            headers=headers,
            json={"day": 4},
        )
        assert invalid_high_day.status_code == 400
        assert "between 1 and 3" in invalid_high_day.json()["detail"]

        progress = await client.get(f"/bible/reading-plans/{plan_id}/progress", headers=headers)
        assert progress.status_code == 200
        progress_data = progress.json()
        assert progress_data["current_day"] == 1
        assert progress_data["completed_readings"] == []
