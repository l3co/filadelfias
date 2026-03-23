import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx
from pydantic import BaseModel

from src.infra.repositories.bible_repository import BibleRepository
from src.services.bible_metadata import ALL_VERSIONS, BOOK_NAMES, DEFAULT_VERSION
from src.services.logging_service import log_error, log_info, log_warning


class BibleBookSummary(BaseModel):
    abbrev: str
    name: str
    chapters_count: int
    testament: str


class BibleChapterContent(BaseModel):
    book_abbrev: str
    book_name: str
    chapter: int
    title: Optional[str] = None
    verses: List[str]
    previous_chapter: Optional[Dict[str, Any]] = None
    next_chapter: Optional[Dict[str, Any]] = None


class BibleVersion(BaseModel):
    id: str
    code: str = ""
    name: str
    description: str
    is_remote: bool = False


class BibleSearchResult(BaseModel):
    book: str
    book_abbrev: str
    chapter: int
    verse: int
    text: str
    reference: str


class BibleSearchResponse(BaseModel):
    results: List[BibleSearchResult]
    total: int
    query: str
    version: str


class BibleNote(BaseModel):
    id: str
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    content: str
    is_public: bool
    created_at: str
    updated_at: str


class BibleHighlight(BaseModel):
    id: str
    version_code: str
    book_abbrev: str
    chapter: int
    verse: int
    color: Optional[str] = None
    category: Optional[str] = None
    created_at: str


class BibleService:
    _versions_cache: Dict[str, List[Dict]] = {}
    DEFAULT_VERSION = DEFAULT_VERSION

    def __init__(self):
        self.repository = BibleRepository()

    def _get_local_data(self, version: str) -> List[Dict]:
        target_version = version if version in self._local_version_ids() else self.DEFAULT_VERSION
        if target_version not in self._versions_cache:
            self._load_version(target_version)
        return self._versions_cache.get(target_version, [])

    @staticmethod
    def _local_version_ids() -> set[str]:
        return {item["code"] for item in ALL_VERSIONS if not item["is_remote"]}

    @classmethod
    def _load_version(cls, version: str) -> None:
        path = Path(__file__).resolve().parents[1] / "assets" / f"bible_{version}.json"
        try:
            with path.open("r", encoding="utf-8-sig") as handle:
                cls._versions_cache[version] = json.load(handle)
            log_info("Bible version loaded", version=version, books_count=len(cls._versions_cache[version]))
        except FileNotFoundError:
            log_error(f"Bible version data not found at {path}", version=version)
            cls._versions_cache[version] = []

    async def get_versions(self) -> List[BibleVersion]:
        try:
            versions = await self.repository.get_versions()
            if versions:
                return [BibleVersion(**version) for version in versions]
        except Exception as exc:
            log_warning("Bible versions unavailable in PostgreSQL; using fallback metadata", error=str(exc))
        return self._get_fallback_versions()

    def _get_fallback_versions(self) -> List[BibleVersion]:
        return [
            BibleVersion(
                id=item["code"],
                code=item["code"],
                name=item["name"],
                description=item["description"],
                is_remote=item["is_remote"],
            )
            for item in ALL_VERSIONS
        ]

    async def get_books(self, version: str = DEFAULT_VERSION) -> List[BibleBookSummary]:
        try:
            books = await self.repository.get_books(version)
            if books:
                return [BibleBookSummary(**book) for book in books]
        except Exception as exc:
            log_warning("Bible books unavailable in PostgreSQL; using JSON fallback", error=str(exc), version=version)

        data = self._get_local_data(version)
        books: list[BibleBookSummary] = []
        for i, book in enumerate(data):
            books.append(
                BibleBookSummary(
                    abbrev=book["abbrev"],
                    name=BOOK_NAMES.get(book["abbrev"], book["abbrev"].title()),
                    chapters_count=len(book["chapters"]),
                    testament="old" if i < 39 else "new",
                )
            )
        return books

    async def _fetch_remote_chapter(self, version: str, abbrev: str, chapter: int) -> List[str]:
        try:
            url = f"https://www.abibliadigital.com.br/api/verses/{version}/{abbrev}/{chapter}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                return [v["text"] for v in data.get("verses", [])]
        except Exception as e:
            log_error("Error fetching remote chapter", error=str(e), version=version, abbrev=abbrev, chapter=chapter)
            return []

    async def get_chapter(self, abbrev: str, chapter: int, version: str = DEFAULT_VERSION) -> Optional[BibleChapterContent]:
        try:
            chapter_data = await self.repository.get_chapter(version, abbrev, chapter)
            if chapter_data:
                return BibleChapterContent(
                    book_abbrev=chapter_data["book_abbrev"],
                    book_name=chapter_data["book_name"],
                    chapter=chapter_data["chapter"],
                    title=chapter_data.get("title"),
                    verses=chapter_data["verses"],
                    previous_chapter=chapter_data.get("previous_chapter"),
                    next_chapter=chapter_data.get("next_chapter"),
                )
        except Exception as exc:
            log_warning("Bible chapter unavailable in PostgreSQL; using fallback source", error=str(exc), version=version)

        version_config = next((item for item in ALL_VERSIONS if item["code"] == version), None)
        if not version_config:
            version = self.DEFAULT_VERSION
            version_config = next(item for item in ALL_VERSIONS if item["code"] == version)

        local_data = self._get_local_data(self.DEFAULT_VERSION)
        book_idx = -1
        book_data = None
        for i, b in enumerate(local_data):
            if b["abbrev"] == abbrev:
                book_data = b
                book_idx = i
                break

        if not book_data:
            return None

        total_chapters = len(book_data["chapters"])
        if chapter < 1 or chapter > total_chapters:
            return None

        if version_config["is_remote"]:
            verses = await self._fetch_remote_chapter(version, abbrev, chapter)
            if not verses:
                log_warning(f"Remote fetch failed for {version}, falling back to {self.DEFAULT_VERSION}")
                fallback_chapters = self._get_local_data(self.DEFAULT_VERSION)[book_idx]["chapters"]
                verses = fallback_chapters[chapter - 1]
        else:
            version_data = self._get_local_data(version)
            if version_data and len(version_data) > book_idx:
                verses = version_data[book_idx]["chapters"][chapter - 1]
            else:
                verses = []

        prev_chap = None
        if chapter > 1:
            prev_chap = {"book": abbrev, "chapter": chapter - 1}
        elif book_idx > 0:
            prev_book = local_data[book_idx - 1]
            prev_chap = {"book": prev_book["abbrev"], "chapter": len(prev_book["chapters"])}

        next_chap = None
        if chapter < total_chapters:
            next_chap = {"book": abbrev, "chapter": chapter + 1}
        elif book_idx < len(local_data) - 1:
            next_book = local_data[book_idx + 1]
            next_chap = {"book": next_book["abbrev"], "chapter": 1}

        return BibleChapterContent(
            book_abbrev=abbrev,
            book_name=BOOK_NAMES.get(abbrev, abbrev.title()),
            chapter=chapter,
            verses=verses,
            previous_chapter=prev_chap,
            next_chapter=next_chap,
        )

    async def get_verse(
        self,
        version_code: str,
        book_abbrev: str,
        chapter_number: int,
        verse_number: int,
    ) -> Optional[dict[str, Any]]:
        try:
            verse = await self.repository.get_verse(version_code, book_abbrev, chapter_number, verse_number)
            if verse:
                return verse
        except Exception as exc:
            log_warning("Bible verse unavailable in PostgreSQL; using JSON fallback", error=str(exc), version=version_code)

        chapter = await self.get_chapter(book_abbrev, chapter_number, version_code)
        if not chapter or verse_number < 1 or verse_number > len(chapter.verses):
            return None
        return {
            "version": version_code,
            "book": chapter.book_name,
            "book_abbrev": chapter.book_abbrev,
            "chapter": chapter_number,
            "verse": verse_number,
            "text": chapter.verses[verse_number - 1],
        }

    async def search_verses(
        self,
        query: str,
        version: str = DEFAULT_VERSION,
        testament: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> BibleSearchResponse:
        try:
            results, total = await self.repository.search_verses(
                query=query,
                version_code=version,
                testament=testament,
                limit=limit,
                offset=offset,
            )
            if total > 0:
                return BibleSearchResponse(
                    results=[BibleSearchResult(**item) for item in results],
                    total=total,
                    query=query,
                    version=version,
                )
        except Exception as exc:
            log_warning("Bible search unavailable in PostgreSQL; using JSON fallback", error=str(exc), version=version)

        fallback_results = self._search_verses_in_json(query, version, testament)
        paginated_results = fallback_results[offset : offset + limit]
        return BibleSearchResponse(
            results=[BibleSearchResult(**item) for item in paginated_results],
            total=len(fallback_results),
            query=query,
            version=version,
        )

    def _search_verses_in_json(
        self,
        query: str,
        version: str,
        testament: Optional[str],
    ) -> list[dict[str, Any]]:
        lowered_query = query.lower()
        results: list[dict[str, Any]] = []
        for index, book in enumerate(self._get_local_data(version), start=1):
            current_testament = "OT" if index <= 39 else "NT"
            if testament and current_testament != testament.upper():
                continue
            for chapter_number, verses in enumerate(book.get("chapters", []), start=1):
                for verse_number, verse_text in enumerate(verses, start=1):
                    if lowered_query not in verse_text.lower():
                        continue
                    book_name = BOOK_NAMES.get(book["abbrev"], book["abbrev"].title())
                    results.append(
                        {
                            "book": book_name,
                            "book_abbrev": book["abbrev"],
                            "chapter": chapter_number,
                            "verse": verse_number,
                            "text": verse_text,
                            "reference": f"{book_name} {chapter_number}:{verse_number}",
                        }
                    )
        return results

    async def create_note(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        content: str,
        is_public: bool = False,
    ) -> BibleNote:
        note = await self.repository.create_note(
            tenant_id=tenant_id,
            user_id=user_id,
            version_code=version_code,
            book_abbrev=book_abbrev,
            chapter=chapter,
            verse=verse,
            content=content,
            is_public=is_public,
        )
        return BibleNote(**note)

    async def get_user_notes(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: str | None = None,
        book_abbrev: str | None = None,
        chapter: int | None = None,
    ) -> list[BibleNote]:
        notes = await self.repository.get_user_notes(user_id, tenant_id, version_code, book_abbrev, chapter)
        return [BibleNote(**note) for note in notes]

    async def update_note(self, note_id: UUID, user_id: UUID, content: str) -> Optional[BibleNote]:
        note = await self.repository.update_note(note_id, user_id, content)
        return BibleNote(**note) if note else None

    async def delete_note(self, note_id: UUID, user_id: UUID) -> bool:
        return await self.repository.delete_note(note_id, user_id)

    async def create_highlight(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        color: str | None = None,
        category: str | None = None,
    ) -> BibleHighlight:
        highlight = await self.repository.create_or_update_highlight(
            tenant_id=tenant_id,
            user_id=user_id,
            version_code=version_code,
            book_abbrev=book_abbrev,
            chapter=chapter,
            verse=verse,
            color=color,
            category=category,
        )
        return BibleHighlight(**highlight)

    async def get_user_highlights(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: str | None = None,
        book_abbrev: str | None = None,
        chapter: int | None = None,
    ) -> list[BibleHighlight]:
        highlights = await self.repository.get_user_highlights(user_id, tenant_id, version_code, book_abbrev, chapter)
        return [BibleHighlight(**item) for item in highlights]

    async def delete_highlight(self, highlight_id: UUID, user_id: UUID) -> bool:
        return await self.repository.delete_highlight(highlight_id, user_id)

    async def get_metrics(self) -> dict[str, Any]:
        return await self.repository.get_metrics()
