"""
Add bible content, notes, highlights, and reading plans tables.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260322_0013"
down_revision = "20260320_0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "bible_versions",
        sa.Column("code", sa.String(length=10), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_remote", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bible_versions")),
        sa.UniqueConstraint("code", name=op.f("uq_bible_versions_code")),
    )
    op.create_index(op.f("ix_bible_versions_code"), "bible_versions", ["code"], unique=False)

    op.create_table(
        "bible_books",
        sa.Column("version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("abbrev", sa.String(length=10), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("testament", sa.String(length=10), nullable=False),
        sa.Column("book_order", sa.Integer(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["version_id"], ["bible_versions.id"], name=op.f("fk_bible_books_version_id_bible_versions"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bible_books")),
        sa.UniqueConstraint("version_id", "abbrev", name="uq_bible_books_version_id_abbrev"),
    )
    op.create_index(op.f("ix_bible_books_book_order"), "bible_books", ["book_order"], unique=False)
    op.create_index(op.f("ix_bible_books_version_id"), "bible_books", ["version_id"], unique=False)

    op.create_table(
        "bible_chapters",
        sa.Column("book_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["book_id"], ["bible_books.id"], name=op.f("fk_bible_chapters_book_id_bible_books"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bible_chapters")),
        sa.UniqueConstraint("book_id", "chapter_number", name="uq_bible_chapters_book_id_chapter_number"),
    )
    op.create_index(op.f("ix_bible_chapters_book_id"), "bible_chapters", ["book_id"], unique=False)

    op.create_table(
        "bible_verses",
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("verse_number", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["bible_chapters.id"], name=op.f("fk_bible_verses_chapter_id_bible_chapters"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bible_verses")),
        sa.UniqueConstraint("chapter_id", "verse_number", name="uq_bible_verses_chapter_id_verse_number"),
    )
    op.create_index(op.f("ix_bible_verses_chapter_id"), "bible_verses", ["chapter_id"], unique=False)

    op.create_table(
        "bible_notes",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_code", sa.String(length=10), nullable=False),
        sa.Column("book_abbrev", sa.String(length=10), nullable=False),
        sa.Column("chapter", sa.Integer(), nullable=False),
        sa.Column("verse", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_bible_notes_tenant_id_tenants"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_bible_notes_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bible_notes")),
    )
    op.create_index(op.f("ix_bible_notes_book_abbrev"), "bible_notes", ["book_abbrev"], unique=False)
    op.create_index(op.f("ix_bible_notes_chapter"), "bible_notes", ["chapter"], unique=False)
    op.create_index(op.f("ix_bible_notes_tenant_id"), "bible_notes", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_bible_notes_user_id"), "bible_notes", ["user_id"], unique=False)
    op.create_index(op.f("ix_bible_notes_version_code"), "bible_notes", ["version_code"], unique=False)
    op.create_index(op.f("ix_bible_notes_verse"), "bible_notes", ["verse"], unique=False)
    op.create_index(
        "ix_bible_notes_public_tenant",
        "bible_notes",
        ["tenant_id", "version_code", "book_abbrev", "chapter", "verse"],
        unique=False,
        postgresql_where=sa.text("is_public = true"),
    )

    op.create_table(
        "bible_highlights",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_code", sa.String(length=10), nullable=False),
        sa.Column("book_abbrev", sa.String(length=10), nullable=False),
        sa.Column("chapter", sa.Integer(), nullable=False),
        sa.Column("verse", sa.Integer(), nullable=False),
        sa.Column("color", sa.String(length=50), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_bible_highlights_tenant_id_tenants"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_bible_highlights_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_bible_highlights")),
        sa.UniqueConstraint(
            "user_id",
            "tenant_id",
            "version_code",
            "book_abbrev",
            "chapter",
            "verse",
            name="uq_bible_highlights_user_id_tenant_id",
        ),
    )
    op.create_index(op.f("ix_bible_highlights_book_abbrev"), "bible_highlights", ["book_abbrev"], unique=False)
    op.create_index(op.f("ix_bible_highlights_chapter"), "bible_highlights", ["chapter"], unique=False)
    op.create_index(op.f("ix_bible_highlights_tenant_id"), "bible_highlights", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_bible_highlights_user_id"), "bible_highlights", ["user_id"], unique=False)
    op.create_index(op.f("ix_bible_highlights_version_code"), "bible_highlights", ["version_code"], unique=False)
    op.create_index(op.f("ix_bible_highlights_verse"), "bible_highlights", ["verse"], unique=False)

    op.create_table(
        "reading_plans",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("creator_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("readings", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], name=op.f("fk_reading_plans_creator_id_users"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_reading_plans_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reading_plans")),
    )
    op.create_index(op.f("ix_reading_plans_creator_id"), "reading_plans", ["creator_id"], unique=False)
    op.create_index(op.f("ix_reading_plans_tenant_id"), "reading_plans", ["tenant_id"], unique=False)
    op.create_index(
        "ix_reading_plans_public",
        "reading_plans",
        ["tenant_id", "name"],
        unique=False,
        postgresql_where=sa.text("is_public = true"),
    )

    op.create_table(
        "user_reading_progress",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("current_day", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("completed_readings", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["reading_plans.id"], name=op.f("fk_user_reading_progress_plan_id_reading_plans"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_user_reading_progress_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_reading_progress")),
        sa.UniqueConstraint("user_id", "plan_id", name="uq_user_reading_progress_user_id_plan_id"),
    )
    op.create_index(op.f("ix_user_reading_progress_plan_id"), "user_reading_progress", ["plan_id"], unique=False)
    op.create_index(op.f("ix_user_reading_progress_user_id"), "user_reading_progress", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_reading_progress_user_id"), table_name="user_reading_progress")
    op.drop_index(op.f("ix_user_reading_progress_plan_id"), table_name="user_reading_progress")
    op.drop_table("user_reading_progress")
    op.drop_index("ix_reading_plans_public", table_name="reading_plans")
    op.drop_index(op.f("ix_reading_plans_tenant_id"), table_name="reading_plans")
    op.drop_index(op.f("ix_reading_plans_creator_id"), table_name="reading_plans")
    op.drop_table("reading_plans")
    op.drop_index(op.f("ix_bible_highlights_verse"), table_name="bible_highlights")
    op.drop_index(op.f("ix_bible_highlights_version_code"), table_name="bible_highlights")
    op.drop_index(op.f("ix_bible_highlights_user_id"), table_name="bible_highlights")
    op.drop_index(op.f("ix_bible_highlights_tenant_id"), table_name="bible_highlights")
    op.drop_index(op.f("ix_bible_highlights_chapter"), table_name="bible_highlights")
    op.drop_index(op.f("ix_bible_highlights_book_abbrev"), table_name="bible_highlights")
    op.drop_table("bible_highlights")
    op.drop_index("ix_bible_notes_public_tenant", table_name="bible_notes")
    op.drop_index(op.f("ix_bible_notes_verse"), table_name="bible_notes")
    op.drop_index(op.f("ix_bible_notes_version_code"), table_name="bible_notes")
    op.drop_index(op.f("ix_bible_notes_user_id"), table_name="bible_notes")
    op.drop_index(op.f("ix_bible_notes_tenant_id"), table_name="bible_notes")
    op.drop_index(op.f("ix_bible_notes_chapter"), table_name="bible_notes")
    op.drop_index(op.f("ix_bible_notes_book_abbrev"), table_name="bible_notes")
    op.drop_table("bible_notes")
    op.drop_index(op.f("ix_bible_verses_chapter_id"), table_name="bible_verses")
    op.drop_table("bible_verses")
    op.drop_index(op.f("ix_bible_chapters_book_id"), table_name="bible_chapters")
    op.drop_table("bible_chapters")
    op.drop_index(op.f("ix_bible_books_version_id"), table_name="bible_books")
    op.drop_index(op.f("ix_bible_books_book_order"), table_name="bible_books")
    op.drop_table("bible_books")
    op.drop_index(op.f("ix_bible_versions_code"), table_name="bible_versions")
    op.drop_table("bible_versions")
