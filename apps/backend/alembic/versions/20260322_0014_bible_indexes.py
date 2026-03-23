"""
Add performance indexes for bible content and study resources.
"""

from alembic import op

revision = "20260322_0014"
down_revision = "20260322_0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_bible_verses_text_search
        ON bible_verses
        USING gin(to_tsvector('portuguese', text))
        """
    )
    op.create_index(
        "ix_bible_notes_reference",
        "bible_notes",
        ["version_code", "book_abbrev", "chapter", "verse"],
        unique=False,
    )
    op.create_index(
        "ix_bible_highlights_reference",
        "bible_highlights",
        ["version_code", "book_abbrev", "chapter", "verse"],
        unique=False,
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_user_reading_progress_active
        ON user_reading_progress(user_id, started_at DESC)
        WHERE completed_at IS NULL
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_reading_plans_public_tenant
        ON reading_plans(tenant_id, created_at DESC)
        WHERE is_public IS TRUE
        """
    )
    op.execute("ANALYZE bible_verses")
    op.execute("ANALYZE bible_chapters")
    op.execute("ANALYZE bible_books")
    op.execute("ANALYZE bible_notes")
    op.execute("ANALYZE bible_highlights")
    op.execute("ANALYZE reading_plans")
    op.execute("ANALYZE user_reading_progress")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_reading_plans_public_tenant")
    op.execute("DROP INDEX IF EXISTS ix_user_reading_progress_active")
    op.drop_index("ix_bible_highlights_reference", table_name="bible_highlights")
    op.drop_index("ix_bible_notes_reference", table_name="bible_notes")
    op.execute("DROP INDEX IF EXISTS ix_bible_verses_text_search")
