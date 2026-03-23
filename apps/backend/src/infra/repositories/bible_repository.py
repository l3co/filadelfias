"""
Repository for bible content and user bible resources.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import and_, func, or_, select, text
from sqlalchemy.orm import selectinload

from src.infra.db.models import (
    BibleBookModel,
    BibleChapterModel,
    BibleHighlightModel,
    BibleNoteModel,
    BibleVerseModel,
    BibleVersionModel,
)
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class BibleRepository(SQLAlchemyRepository):
    async def _get_version_by_code(self, session, code: str) -> BibleVersionModel | None:
        return await self._first(session, select(BibleVersionModel).where(BibleVersionModel.code == code))

    async def _get_book_by_abbrev(self, session, version_code: str, abbrev: str) -> BibleBookModel | None:
        version = await self._get_version_by_code(session, version_code)
        if not version:
            return None
        return await self._first(
            session,
            select(BibleBookModel).where(
                and_(BibleBookModel.version_id == version.id, BibleBookModel.abbrev == abbrev.lower())
            ),
        )

    async def get_versions(self, active_only: bool = True) -> list[dict[str, Any]]:
        async with self.session() as session:
            statement = select(BibleVersionModel)
            if active_only:
                statement = statement.where(BibleVersionModel.is_active.is_(True))
            statement = statement.order_by(BibleVersionModel.is_remote.asc(), BibleVersionModel.code.asc())
            result = await session.execute(statement)
            versions = result.scalars().all()
            return [
                {
                    "id": version.code,
                    "code": version.code,
                    "name": version.name,
                    "description": version.description or "",
                    "is_remote": version.is_remote,
                }
                for version in versions
            ]

    async def get_books(self, version_code: str) -> list[dict[str, Any]]:
        async with self.session() as session:
            version = await self._get_version_by_code(session, version_code)
            if not version:
                return []

            statement = (
                select(BibleBookModel, func.count(BibleChapterModel.id))
                .outerjoin(BibleChapterModel, BibleChapterModel.book_id == BibleBookModel.id)
                .where(BibleBookModel.version_id == version.id)
                .group_by(BibleBookModel.id)
                .order_by(BibleBookModel.book_order.asc())
            )
            result = await session.execute(statement)
            return [
                {
                    "abbrev": book.abbrev,
                    "name": book.name,
                    "chapters_count": chapters_count,
                    "testament": "old" if book.testament == "OT" else "new",
                }
                for book, chapters_count in result.all()
            ]

    async def get_chapter(self, version_code: str, book_abbrev: str, chapter_number: int) -> dict[str, Any] | None:
        async with self.session() as session:
            book = await self._get_book_by_abbrev(session, version_code, book_abbrev)
            if not book:
                return None

            chapter_stmt = text(
                """
                WITH chapter_navigation AS (
                    SELECT
                        id,
                        chapter_number,
                        title,
                        LAG(chapter_number) OVER (ORDER BY chapter_number) AS prev_chapter,
                        LEAD(chapter_number) OVER (ORDER BY chapter_number) AS next_chapter
                    FROM bible_chapters
                    WHERE book_id = :book_id
                )
                SELECT id, chapter_number, title, prev_chapter, next_chapter
                FROM chapter_navigation
                WHERE chapter_number = :chapter_number
                """
            )
            chapter_result = await session.execute(
                chapter_stmt,
                {"book_id": book.id, "chapter_number": chapter_number},
            )
            chapter_row = chapter_result.mappings().first()
            if not chapter_row:
                return None

            verses_result = await session.execute(
                select(BibleVerseModel.text)
                .where(BibleVerseModel.chapter_id == chapter_row["id"])
                .order_by(BibleVerseModel.verse_number.asc())
            )
            verses = list(verses_result.scalars().all())

            previous_chapter = None
            next_chapter = None

            if chapter_row["prev_chapter"]:
                previous_chapter = {"book": book.abbrev, "chapter": chapter_row["prev_chapter"]}
            else:
                previous_book = await self._first(
                    session,
                    select(BibleBookModel)
                    .where(
                        and_(
                            BibleBookModel.version_id == book.version_id,
                            BibleBookModel.book_order == book.book_order - 1,
                        )
                    )
                    .options(selectinload(BibleBookModel.chapters)),
                )
                if previous_book:
                    previous_chapter = {"book": previous_book.abbrev, "chapter": len(previous_book.chapters)}

            if chapter_row["next_chapter"]:
                next_chapter = {"book": book.abbrev, "chapter": chapter_row["next_chapter"]}
            else:
                next_book = await self._first(
                    session,
                    select(BibleBookModel).where(
                        and_(
                            BibleBookModel.version_id == book.version_id,
                            BibleBookModel.book_order == book.book_order + 1,
                        )
                    ),
                )
                if next_book:
                    next_chapter = {"book": next_book.abbrev, "chapter": 1}

            return {
                "book_abbrev": book.abbrev,
                "book_name": book.name,
                "chapter": chapter_row["chapter_number"],
                "title": chapter_row["title"],
                "verses": verses,
                "previous_chapter": previous_chapter,
                "next_chapter": next_chapter,
            }

    async def get_verse(
        self, version_code: str, book_abbrev: str, chapter_number: int, verse_number: int
    ) -> dict[str, Any] | None:
        async with self.session() as session:
            book = await self._get_book_by_abbrev(session, version_code, book_abbrev)
            if not book:
                return None

            statement = (
                select(BibleVerseModel)
                .join(BibleChapterModel, BibleChapterModel.id == BibleVerseModel.chapter_id)
                .where(
                    and_(
                        BibleChapterModel.book_id == book.id,
                        BibleChapterModel.chapter_number == chapter_number,
                        BibleVerseModel.verse_number == verse_number,
                    )
                )
            )
            verse = await self._first(session, statement)
            if not verse:
                return None

            return {
                "version": version_code,
                "book": book.name,
                "book_abbrev": book.abbrev,
                "chapter": chapter_number,
                "verse": verse_number,
                "text": verse.text,
            }

    async def search_verses(
        self,
        query: str,
        version_code: str,
        testament: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[dict[str, Any]], int]:
        async with self.session() as session:
            dialect_name = session.bind.dialect.name if session.bind else ""
            if dialect_name == "postgresql":
                params = {
                    "version_code": version_code,
                    "testament": testament.upper() if testament else None,
                    "query": query,
                    "book_name_query": f"%{query}%",
                    "limit": limit,
                    "offset": offset,
                }
                count_stmt = text(
                    """
                    WITH text_matches AS (
                        SELECT
                            bv.id,
                            bv.chapter_id
                        FROM bible_verses bv
                        WHERE bv.search_vector @@ websearch_to_tsquery('portuguese', :query)
                    ),
                    matched_verses AS (
                        SELECT tm.id
                        FROM text_matches tm
                        JOIN bible_chapters bc ON bc.id = tm.chapter_id
                        JOIN bible_books bb ON bb.id = bc.book_id
                        JOIN bible_versions bver ON bver.id = bb.version_id
                        WHERE bver.code = :version_code
                          AND (CAST(:testament AS VARCHAR) IS NULL OR bb.testament = CAST(:testament AS VARCHAR))
                        UNION
                        SELECT bv.id
                        FROM bible_verses bv
                        JOIN bible_chapters bc ON bc.id = bv.chapter_id
                        JOIN bible_books bb ON bb.id = bc.book_id
                        JOIN bible_versions bver ON bver.id = bb.version_id
                        WHERE bver.code = :version_code
                          AND (CAST(:testament AS VARCHAR) IS NULL OR bb.testament = CAST(:testament AS VARCHAR))
                          AND bb.name ILIKE :book_name_query
                    )
                    SELECT COUNT(*)
                    FROM matched_verses
                    """
                )
                data_stmt = text(
                    """
                    WITH text_matches AS (
                        SELECT
                            bv.id,
                            bv.chapter_id,
                            bv.verse_number,
                            bv.text,
                            ts_rank(
                                bv.search_vector,
                                websearch_to_tsquery('portuguese', :query)
                            ) AS rank
                        FROM bible_verses bv
                        WHERE bv.search_vector @@ websearch_to_tsquery('portuguese', :query)
                    ),
                    matched_verses AS (
                        SELECT
                            tm.id,
                            tm.chapter_id,
                            tm.verse_number,
                            tm.text,
                            tm.rank
                        FROM text_matches tm
                        JOIN bible_chapters bc ON bc.id = tm.chapter_id
                        JOIN bible_books bb ON bb.id = bc.book_id
                        JOIN bible_versions bver ON bver.id = bb.version_id
                        WHERE bver.code = :version_code
                          AND (CAST(:testament AS VARCHAR) IS NULL OR bb.testament = CAST(:testament AS VARCHAR))
                        UNION
                        SELECT
                            bv.id,
                            bv.chapter_id,
                            bv.verse_number,
                            bv.text,
                            0.0 AS rank
                        FROM bible_verses bv
                        JOIN bible_chapters bc ON bc.id = bv.chapter_id
                        JOIN bible_books bb ON bb.id = bc.book_id
                        JOIN bible_versions bver ON bver.id = bb.version_id
                        WHERE bver.code = :version_code
                          AND (CAST(:testament AS VARCHAR) IS NULL OR bb.testament = CAST(:testament AS VARCHAR))
                          AND bb.name ILIKE :book_name_query
                    )
                    SELECT
                        bb.name AS book,
                        bb.abbrev AS book_abbrev,
                        bc.chapter_number AS chapter,
                        mv.verse_number AS verse,
                        mv.text AS text,
                        mv.rank AS rank
                    FROM matched_verses mv
                    JOIN bible_chapters bc ON bc.id = mv.chapter_id
                    JOIN bible_books bb ON bb.id = bc.book_id
                    ORDER BY
                        rank DESC,
                        bb.book_order ASC,
                        bc.chapter_number ASC,
                        mv.verse_number ASC
                    LIMIT :limit OFFSET :offset
                    """
                )
                total = await session.scalar(count_stmt, params) or 0
                rows = (await session.execute(data_stmt, params)).mappings().all()
                return (
                    [
                        {
                            "book": row["book"],
                            "book_abbrev": row["book_abbrev"],
                            "chapter": row["chapter"],
                            "verse": row["verse"],
                            "text": row["text"],
                            "reference": f"{row['book']} {row['chapter']}:{row['verse']}",
                        }
                        for row in rows
                    ],
                    total,
                )
            else:
                version = await self._get_version_by_code(session, version_code)
                if not version:
                    return [], 0

                filters = [BibleBookModel.version_id == version.id]
                if testament:
                    filters.append(BibleBookModel.testament == testament.upper())

                base_columns = (
                    BibleVerseModel.text,
                    BibleVerseModel.verse_number,
                    BibleChapterModel.chapter_number,
                    BibleBookModel.abbrev,
                    BibleBookModel.name,
                )
                search_filters = [
                    *filters,
                    or_(
                        BibleVerseModel.text.ilike(f"%{query}%"),
                        BibleBookModel.name.ilike(f"%{query}%"),
                    ),
                ]
                data_stmt = (
                    select(*base_columns)
                    .join(BibleChapterModel, BibleChapterModel.id == BibleVerseModel.chapter_id)
                    .join(BibleBookModel, BibleBookModel.id == BibleChapterModel.book_id)
                    .where(and_(*search_filters))
                    .order_by(
                        BibleBookModel.book_order.asc(),
                        BibleChapterModel.chapter_number.asc(),
                        BibleVerseModel.verse_number.asc(),
                    )
                )
                count_stmt = (
                    select(func.count(BibleVerseModel.id))
                    .select_from(BibleVerseModel)
                    .join(BibleChapterModel, BibleChapterModel.id == BibleVerseModel.chapter_id)
                    .join(BibleBookModel, BibleBookModel.id == BibleChapterModel.book_id)
                    .where(and_(*search_filters))
                )

            total = await session.scalar(count_stmt) or 0
            result = await session.execute(data_stmt.limit(limit).offset(offset))
            rows = result.all()
            return (
                [
                    {
                        "book": name,
                        "book_abbrev": abbrev,
                        "chapter": chapter_number,
                        "verse": verse_number,
                        "text": text,
                        "reference": f"{name} {chapter_number}:{verse_number}",
                    }
                    for text, verse_number, chapter_number, abbrev, name, *_rest in rows
                ],
                total,
            )

    async def create_note(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        content: str,
        is_public: bool,
    ) -> dict[str, Any]:
        async with self.session() as session:
            note = BibleNoteModel(
                tenant_id=tenant_id,
                user_id=user_id,
                version_code=version_code.lower(),
                book_abbrev=book_abbrev.lower(),
                chapter=chapter,
                verse=verse,
                content=content,
                is_public=is_public,
            )
            session.add(note)
            await session.commit()
            await session.refresh(note)
            return self._serialize_note(note)

    async def get_user_notes(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: str | None = None,
        book_abbrev: str | None = None,
        chapter: int | None = None,
    ) -> list[dict[str, Any]]:
        async with self.session() as session:
            filters = [BibleNoteModel.user_id == user_id, BibleNoteModel.tenant_id == tenant_id]
            if version_code:
                filters.append(BibleNoteModel.version_code == version_code.lower())
            if book_abbrev:
                filters.append(BibleNoteModel.book_abbrev == book_abbrev.lower())
            if chapter:
                filters.append(BibleNoteModel.chapter == chapter)

            result = await session.execute(
                select(BibleNoteModel)
                .where(and_(*filters))
                .order_by(
                    BibleNoteModel.version_code.asc(),
                    BibleNoteModel.book_abbrev.asc(),
                    BibleNoteModel.chapter.asc(),
                    BibleNoteModel.verse.asc(),
                )
            )
            return [self._serialize_note(note) for note in result.scalars().all()]

    async def update_note(self, note_id: UUID, user_id: UUID, content: str) -> dict[str, Any] | None:
        async with self.session() as session:
            note = await self._first(
                session,
                select(BibleNoteModel).where(and_(BibleNoteModel.id == note_id, BibleNoteModel.user_id == user_id)),
            )
            if not note:
                return None
            note.content = content
            await session.commit()
            await session.refresh(note)
            return self._serialize_note(note)

    async def delete_note(self, note_id: UUID, user_id: UUID) -> bool:
        async with self.session() as session:
            note = await self._first(
                session,
                select(BibleNoteModel).where(and_(BibleNoteModel.id == note_id, BibleNoteModel.user_id == user_id)),
            )
            if not note:
                return False
            await session.delete(note)
            await session.commit()
            return True

    async def create_or_update_highlight(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        color: str | None,
        category: str | None,
    ) -> dict[str, Any]:
        async with self.session() as session:
            highlight = await self._first(
                session,
                select(BibleHighlightModel).where(
                    and_(
                        BibleHighlightModel.tenant_id == tenant_id,
                        BibleHighlightModel.user_id == user_id,
                        BibleHighlightModel.version_code == version_code.lower(),
                        BibleHighlightModel.book_abbrev == book_abbrev.lower(),
                        BibleHighlightModel.chapter == chapter,
                        BibleHighlightModel.verse == verse,
                    )
                ),
            )
            if not highlight:
                highlight = BibleHighlightModel(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    version_code=version_code.lower(),
                    book_abbrev=book_abbrev.lower(),
                    chapter=chapter,
                    verse=verse,
                    color=color,
                    category=category,
                )
                session.add(highlight)
            else:
                highlight.color = color
                highlight.category = category

            await session.commit()
            await session.refresh(highlight)
            return self._serialize_highlight(highlight)

    async def get_user_highlights(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: str | None = None,
        book_abbrev: str | None = None,
        chapter: int | None = None,
    ) -> list[dict[str, Any]]:
        async with self.session() as session:
            filters = [BibleHighlightModel.user_id == user_id, BibleHighlightModel.tenant_id == tenant_id]
            if version_code:
                filters.append(BibleHighlightModel.version_code == version_code.lower())
            if book_abbrev:
                filters.append(BibleHighlightModel.book_abbrev == book_abbrev.lower())
            if chapter:
                filters.append(BibleHighlightModel.chapter == chapter)

            result = await session.execute(
                select(BibleHighlightModel)
                .where(and_(*filters))
                .order_by(
                    BibleHighlightModel.version_code.asc(),
                    BibleHighlightModel.book_abbrev.asc(),
                    BibleHighlightModel.chapter.asc(),
                    BibleHighlightModel.verse.asc(),
                )
            )
            return [self._serialize_highlight(item) for item in result.scalars().all()]

    async def delete_highlight(self, highlight_id: UUID, user_id: UUID) -> bool:
        async with self.session() as session:
            highlight = await self._first(
                session,
                select(BibleHighlightModel).where(
                    and_(BibleHighlightModel.id == highlight_id, BibleHighlightModel.user_id == user_id)
                ),
            )
            if not highlight:
                return False
            await session.delete(highlight)
            await session.commit()
            return True

    async def get_metrics(self) -> dict[str, Any]:
        async with self.session() as session:
            dialect_name = session.bind.dialect.name if session.bind else ""
            if dialect_name != "postgresql":
                return {"database": dialect_name or "unknown", "table_sizes": [], "index_usage": []}

            table_sizes_result = await session.execute(
                text(
                    """
                    SELECT
                        table_name,
                        pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) AS size,
                        row_count
                    FROM (
                        SELECT 'bible_versions' AS table_name, COUNT(*)::bigint AS row_count FROM bible_versions
                        UNION ALL
                        SELECT 'bible_books', COUNT(*)::bigint FROM bible_books
                        UNION ALL
                        SELECT 'bible_chapters', COUNT(*)::bigint FROM bible_chapters
                        UNION ALL
                        SELECT 'bible_verses', COUNT(*)::bigint FROM bible_verses
                        UNION ALL
                        SELECT 'bible_notes', COUNT(*)::bigint FROM bible_notes
                        UNION ALL
                        SELECT 'bible_highlights', COUNT(*)::bigint FROM bible_highlights
                        UNION ALL
                        SELECT 'reading_plans', COUNT(*)::bigint FROM reading_plans
                        UNION ALL
                        SELECT 'user_reading_progress', COUNT(*)::bigint FROM user_reading_progress
                    ) sizes
                    ORDER BY table_name
                    """
                )
            )
            index_usage_result = await session.execute(
                text(
                    """
                    SELECT
                        schemaname,
                        relname AS tablename,
                        indexrelname AS indexname,
                        idx_scan,
                        idx_tup_read,
                        idx_tup_fetch
                    FROM pg_stat_user_indexes
                    WHERE schemaname = 'public'
                      AND (
                        relname LIKE 'bible%'
                        OR relname IN ('reading_plans', 'user_reading_progress')
                      )
                    ORDER BY idx_scan DESC, indexname ASC
                    LIMIT 20
                    """
                )
            )

            return {
                "database": dialect_name,
                "table_sizes": [dict(row) for row in table_sizes_result.mappings().all()],
                "index_usage": [dict(row) for row in index_usage_result.mappings().all()],
            }

    def _serialize_note(self, note: BibleNoteModel) -> dict[str, Any]:
        return {
            "id": str(note.id),
            "version_code": note.version_code,
            "book_abbrev": note.book_abbrev,
            "chapter": note.chapter,
            "verse": note.verse,
            "content": note.content,
            "is_public": note.is_public,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat(),
        }

    def _serialize_highlight(self, highlight: BibleHighlightModel) -> dict[str, Any]:
        return {
            "id": str(highlight.id),
            "version_code": highlight.version_code,
            "book_abbrev": highlight.book_abbrev,
            "chapter": highlight.chapter,
            "verse": highlight.verse,
            "color": highlight.color,
            "category": highlight.category,
            "created_at": highlight.created_at.isoformat(),
        }
