"""
Add councils and meetings tables.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260318_0007"
down_revision = "20260318_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "councils",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("member_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_councils_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_councils")),
    )
    op.create_index(op.f("ix_councils_tenant_id"), "councils", ["tenant_id"], unique=False)

    op.create_table(
        "meetings",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("council_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="SCHEDULED"),
        sa.Column("agenda", sa.Text(), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("meeting_type", sa.String(length=50), nullable=False, server_default="ORDINARY"),
        sa.Column("minutes", sa.Text(), nullable=True),
        sa.Column("attendees", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["council_id"], ["councils.id"], name=op.f("fk_meetings_council_id_councils"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_meetings_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_meetings")),
    )
    op.create_index(op.f("ix_meetings_council_id"), "meetings", ["council_id"], unique=False)
    op.create_index(op.f("ix_meetings_date"), "meetings", ["date"], unique=False)
    op.create_index(op.f("ix_meetings_tenant_id"), "meetings", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_meetings_tenant_id"), table_name="meetings")
    op.drop_index(op.f("ix_meetings_date"), table_name="meetings")
    op.drop_index(op.f("ix_meetings_council_id"), table_name="meetings")
    op.drop_table("meetings")
    op.drop_index(op.f("ix_councils_tenant_id"), table_name="councils")
    op.drop_table("councils")
