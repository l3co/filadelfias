"""
Add tithe records table.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260318_0005"
down_revision = "20260318_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tithe_records",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("member_id", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("attachment_url", sa.Text(), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("approved_by", sa.String(length=255), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("transaction_id", sa.String(length=255), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_tithe_records_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tithe_records")),
    )
    op.create_index(op.f("ix_tithe_records_date"), "tithe_records", ["date"], unique=False)
    op.create_index(op.f("ix_tithe_records_member_id"), "tithe_records", ["member_id"], unique=False)
    op.create_index(op.f("ix_tithe_records_status"), "tithe_records", ["status"], unique=False)
    op.create_index(op.f("ix_tithe_records_tenant_id"), "tithe_records", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_tithe_records_type"), "tithe_records", ["type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_tithe_records_type"), table_name="tithe_records")
    op.drop_index(op.f("ix_tithe_records_tenant_id"), table_name="tithe_records")
    op.drop_index(op.f("ix_tithe_records_status"), table_name="tithe_records")
    op.drop_index(op.f("ix_tithe_records_member_id"), table_name="tithe_records")
    op.drop_index(op.f("ix_tithe_records_date"), table_name="tithe_records")
    op.drop_table("tithe_records")
