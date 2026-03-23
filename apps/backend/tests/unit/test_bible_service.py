"""
Unit tests for BibleService fallback and transformation behavior.
"""

from unittest.mock import AsyncMock, patch

import pytest

from src.services.bible_service import BibleService

pytestmark = pytest.mark.unit


@pytest.fixture
def service() -> BibleService:
    instance = BibleService()
    instance.repository = AsyncMock()
    return instance


class TestBibleService:
    @pytest.mark.asyncio
    async def test_get_versions_falls_back_to_metadata_when_repository_fails(self, service: BibleService):
        service.repository.get_versions.side_effect = Exception("db unavailable")

        versions = await service.get_versions()

        assert any(version.id == "nvi" for version in versions)
        assert any(version.id == "ara" and version.is_remote is True for version in versions)

    @pytest.mark.asyncio
    async def test_get_chapter_returns_repository_navigation_when_available(self, service: BibleService):
        service.repository.get_chapter.return_value = {
            "book_abbrev": "gn",
            "book_name": "Gênesis",
            "chapter": 1,
            "title": None,
            "verses": ["No princípio criou Deus os céus e a terra."],
            "previous_chapter": None,
            "next_chapter": {"book": "gn", "chapter": 2},
        }

        chapter = await service.get_chapter("gn", 1, "nvi")

        assert chapter is not None
        assert chapter.book_abbrev == "gn"
        assert chapter.book_name == "Gênesis"
        assert chapter.verses == ["No princípio criou Deus os céus e a terra."]
        assert chapter.next_chapter == {"book": "gn", "chapter": 2}

    @pytest.mark.asyncio
    async def test_get_chapter_uses_remote_fallback_for_remote_versions(self, service: BibleService):
        service.repository.get_chapter.side_effect = Exception("db unavailable")

        with patch.object(service, "_fetch_remote_chapter", AsyncMock(return_value=["Verso remoto 1"])) as fetch_remote:
            chapter = await service.get_chapter("gn", 1, "ara")

        assert chapter is not None
        assert chapter.book_abbrev == "gn"
        assert chapter.chapter == 1
        assert chapter.verses == ["Verso remoto 1"]
        fetch_remote.assert_awaited_once_with("ara", "gn", 1)

    @pytest.mark.asyncio
    async def test_search_verses_falls_back_to_json_and_honors_testament_filter(self, service: BibleService):
        service.repository.search_verses.side_effect = Exception("db unavailable")

        response = await service.search_verses("jesus", version="nvi", testament="NT", limit=5, offset=0)

        assert response.total > 0
        assert len(response.results) <= 5
        assert all(result.book_abbrev in {"mt", "mc", "lc", "jo", "at", "rm", "1co", "2co", "gl", "ef", "fp", "cl", "1ts", "2ts", "1tm", "2tm", "tt", "fm", "hb", "tg", "1pe", "2pe", "1jo", "2jo", "3jo", "jd", "ap"} for result in response.results)

    @pytest.mark.asyncio
    async def test_search_verses_returns_empty_results_when_query_is_not_found(self, service: BibleService):
        service.repository.search_verses.return_value = ([], 0)

        response = await service.search_verses("termo-inexistente-total", version="nvi", limit=10, offset=0)

        assert response.total == 0
        assert response.results == []

    @pytest.mark.asyncio
    async def test_get_metrics_delegates_to_repository(self, service: BibleService):
        service.repository.get_metrics.return_value = {
            "database": "postgresql",
            "table_sizes": [{"table_name": "bible_verses", "row_count": 31105}],
            "index_usage": [],
        }

        metrics = await service.get_metrics()

        assert metrics["database"] == "postgresql"
        assert metrics["table_sizes"][0]["table_name"] == "bible_verses"
        service.repository.get_metrics.assert_awaited_once()
