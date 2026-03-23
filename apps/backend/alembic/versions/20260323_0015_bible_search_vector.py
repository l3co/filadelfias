"""
Add stored search vector for bible full-text queries.
"""

from alembic import op

revision = "20260323_0015"
down_revision = "20260322_0014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE bible_verses
        ADD COLUMN IF NOT EXISTS search_vector tsvector
        GENERATED ALWAYS AS (to_tsvector('portuguese', text)) STORED
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_bible_verses_search_vector
        ON bible_verses
        USING gin(search_vector)
        """
    )
    op.execute("ANALYZE bible_verses")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_bible_verses_search_vector")
    op.execute("ALTER TABLE bible_verses DROP COLUMN IF EXISTS search_vector")
