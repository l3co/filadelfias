"""
Add devotionals table.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260318_0003"
down_revision = "20260318_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "devotionals",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("verse_reference", sa.String(length=255), nullable=False),
        sa.Column("verse_text", sa.Text(), nullable=False),
        sa.Column("meditation", sa.Text(), nullable=False),
        sa.Column("reflection", sa.Text(), nullable=True),
        sa.Column("prayer", sa.Text(), nullable=True),
        sa.Column("author", sa.String(length=255), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_devotionals_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_devotionals")),
    )
    op.create_index(op.f("ix_devotionals_date"), "devotionals", ["date"], unique=False)
    op.create_index(op.f("ix_devotionals_tenant_id"), "devotionals", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_devotionals_tenant_id"), table_name="devotionals")
    op.drop_index(op.f("ix_devotionals_date"), table_name="devotionals")
    op.drop_table("devotionals")
