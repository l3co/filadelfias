"""
Add social projects table.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260320_0011"
down_revision = "20260320_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "social_projects",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PLANNING"),
        sa.Column("target_audience", sa.String(length=255), nullable=True),
        sa.Column("coordinator_name", sa.String(length=255), nullable=True),
        sa.Column("contact_info", sa.String(length=255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["tenant_id"], ["tenants.id"], name=op.f("fk_social_projects_tenant_id_tenants"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_social_projects")),
    )
    op.create_index(op.f("ix_social_projects_end_date"), "social_projects", ["end_date"], unique=False)
    op.create_index(op.f("ix_social_projects_start_date"), "social_projects", ["start_date"], unique=False)
    op.create_index(op.f("ix_social_projects_status"), "social_projects", ["status"], unique=False)
    op.create_index(op.f("ix_social_projects_tenant_id"), "social_projects", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_social_projects_tenant_id"), table_name="social_projects")
    op.drop_index(op.f("ix_social_projects_status"), table_name="social_projects")
    op.drop_index(op.f("ix_social_projects_start_date"), table_name="social_projects")
    op.drop_index(op.f("ix_social_projects_end_date"), table_name="social_projects")
    op.drop_table("social_projects")
