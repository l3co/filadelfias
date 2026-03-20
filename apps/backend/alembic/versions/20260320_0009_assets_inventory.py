"""
Add church asset inventory table.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260320_0009"
down_revision = "20260318_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "assets",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("condition", sa.String(length=50), nullable=False, server_default="GOOD"),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("purchase_value", sa.Float(), nullable=True),
        sa.Column("acquired_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["tenant_id"], ["tenants.id"], name=op.f("fk_assets_tenant_id_tenants"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_assets")),
    )
    op.create_index(op.f("ix_assets_acquired_date"), "assets", ["acquired_date"], unique=False)
    op.create_index(op.f("ix_assets_category"), "assets", ["category"], unique=False)
    op.create_index(op.f("ix_assets_condition"), "assets", ["condition"], unique=False)
    op.create_index(op.f("ix_assets_tenant_id"), "assets", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_assets_tenant_id"), table_name="assets")
    op.drop_index(op.f("ix_assets_condition"), table_name="assets")
    op.drop_index(op.f("ix_assets_category"), table_name="assets")
    op.drop_index(op.f("ix_assets_acquired_date"), table_name="assets")
    op.drop_table("assets")
