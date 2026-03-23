"""
Import bible JSON files into PostgreSQL.

Usage:
    poetry run python -m src.scripts.import_bible_data
    poetry run python -m src.scripts.import_bible_data --version nvi
    poetry run python -m src.scripts.import_bible_data --dry-run
"""

from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path
from typing import Any

from sqlalchemy import delete, select

from src.infra.db.models import BibleBookModel, BibleChapterModel, BibleVerseModel, BibleVersionModel
from src.infra.db.session import async_session_factory
from src.services.bible_metadata import ALL_VERSIONS, BOOK_NAMES, LOCAL_VERSION_CODES
from src.services.logging_service import log_info, log_warning

ASSETS_DIR = Path(__file__).resolve().parents[1] / "assets"


def _load_json_file(version_code: str) -> list[dict[str, Any]]:
    json_path = ASSETS_DIR / f"bible_{version_code}.json"
    if not json_path.exists():
        raise FileNotFoundError(f"Bible file not found: {json_path}")

    with json_path.open("r", encoding="utf-8-sig") as handle:
        data = json.load(handle)

    log_info("Bible JSON loaded", version=version_code, books=len(data))
    return data


async def _get_or_create_version(session, config: dict[str, Any]) -> BibleVersionModel:
    version = await session.scalar(select(BibleVersionModel).where(BibleVersionModel.code == config["code"]))
    if version:
        version.name = config["name"]
        version.description = config["description"]
        version.is_remote = config["is_remote"]
        version.is_active = True
        await session.flush()
        return version

    version = BibleVersionModel(
        code=config["code"],
        name=config["name"],
        description=config["description"],
        is_remote=config["is_remote"],
        is_active=True,
    )
    session.add(version)
    await session.flush()
    return version


async def _clear_existing_version_data(session, version_id) -> None:
    await session.execute(
        delete(BibleVerseModel).where(
            BibleVerseModel.chapter_id.in_(
                select(BibleChapterModel.id).where(
                    BibleChapterModel.book_id.in_(select(BibleBookModel.id).where(BibleBookModel.version_id == version_id))
                )
            )
        )
    )
    await session.execute(
        delete(BibleChapterModel).where(
            BibleChapterModel.book_id.in_(select(BibleBookModel.id).where(BibleBookModel.version_id == version_id))
        )
    )
    await session.execute(delete(BibleBookModel).where(BibleBookModel.version_id == version_id))


async def _import_version(version_code: str, dry_run: bool) -> dict[str, int]:
    config = next((item for item in ALL_VERSIONS if item["code"] == version_code), None)
    if not config:
        raise ValueError(f"Unsupported version: {version_code}")

    books_total = 0
    chapters_total = 0
    verses_total = 0

    async with async_session_factory() as session:
        async with session.begin():
            version = await _get_or_create_version(session, config)

            if config["is_remote"]:
                log_info("Remote bible version metadata ensured", version=version_code)
                return {"books": 0, "chapters": 0, "verses": 0}

            books_data = _load_json_file(version_code)

            if dry_run:
                for book_data in books_data:
                    books_total += 1
                    chapters = book_data.get("chapters", [])
                    chapters_total += len(chapters)
                    verses_total += sum(len(verses) for verses in chapters)
                return {"books": books_total, "chapters": chapters_total, "verses": verses_total}

            existing_books = await session.scalar(
                select(BibleBookModel.id).where(BibleBookModel.version_id == version.id).limit(1)
            )
            if existing_books:
                log_warning("Existing bible version data found; replacing records", version=version_code)
                await _clear_existing_version_data(session, version.id)

            for book_order, book_data in enumerate(books_data, start=1):
                book = BibleBookModel(
                    version_id=version.id,
                    abbrev=book_data["abbrev"],
                    name=BOOK_NAMES.get(book_data["abbrev"], book_data["abbrev"].title()),
                    testament="OT" if book_order <= 39 else "NT",
                    book_order=book_order,
                )
                session.add(book)
                await session.flush()
                books_total += 1

                for chapter_number, verses in enumerate(book_data.get("chapters", []), start=1):
                    chapter = BibleChapterModel(
                        book_id=book.id,
                        chapter_number=chapter_number,
                    )
                    session.add(chapter)
                    await session.flush()
                    chapters_total += 1

                    for verse_number, verse_text in enumerate(verses, start=1):
                        session.add(
                            BibleVerseModel(
                                chapter_id=chapter.id,
                                verse_number=verse_number,
                                text=verse_text,
                            )
                        )
                        verses_total += 1

    return {"books": books_total, "chapters": chapters_total, "verses": verses_total}


async def _run(version: str | None, dry_run: bool) -> None:
    targets = [version] if version else LOCAL_VERSION_CODES

    async with async_session_factory() as session:
        async with session.begin():
            for config in ALL_VERSIONS:
                if config["code"] not in targets and not config["is_remote"]:
                    continue
                await _get_or_create_version(session, config)

    for code in targets:
        result = await _import_version(code, dry_run=dry_run)
        log_info("Bible import completed", version=code, dry_run=dry_run, **result)

    if not version:
        await _import_version("ara", dry_run=dry_run)


def main() -> None:
    parser = argparse.ArgumentParser(description="Import bible JSON data into PostgreSQL.")
    parser.add_argument("--version", choices=LOCAL_VERSION_CODES, help="Import a single local version.")
    parser.add_argument("--dry-run", action="store_true", help="Only count records without writing to the database.")
    args = parser.parse_args()

    asyncio.run(_run(args.version, args.dry_run))


if __name__ == "__main__":
    main()
