"""
Add missions and expense request tables.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260318_0004"
down_revision = "20260318_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "countries",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(length=10), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_countries_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_countries")),
        sa.UniqueConstraint("tenant_id", "code", name="uq_countries_tenant_id_code"),
    )
    op.create_index(op.f("ix_countries_tenant_id"), "countries", ["tenant_id"], unique=False)

    op.create_table(
        "missionaries",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("field_name", sa.String(length=255), nullable=False),
        sa.Column("country_code", sa.String(length=10), nullable=False),
        sa.Column("state", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=255), nullable=True),
        sa.Column("latitude", sa.String(length=50), nullable=True),
        sa.Column("longitude", sa.String(length=50), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.Text(), nullable=True),
        sa.Column("newsletter_url", sa.Text(), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_missionaries_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_missionaries")),
    )
    op.create_index(op.f("ix_missionaries_tenant_id"), "missionaries", ["tenant_id"], unique=False)

    op.create_table(
        "expense_requests",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("member_id", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("receipt_url", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("approved_by", sa.String(length=255), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("transaction_id", sa.String(length=255), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["tenant_id"], ["tenants.id"], name=op.f("fk_expense_requests_tenant_id_tenants"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_expense_requests")),
    )
    op.create_index(op.f("ix_expense_requests_expense_date"), "expense_requests", ["expense_date"], unique=False)
    op.create_index(op.f("ix_expense_requests_member_id"), "expense_requests", ["member_id"], unique=False)
    op.create_index(op.f("ix_expense_requests_status"), "expense_requests", ["status"], unique=False)
    op.create_index(op.f("ix_expense_requests_tenant_id"), "expense_requests", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_expense_requests_tenant_id"), table_name="expense_requests")
    op.drop_index(op.f("ix_expense_requests_status"), table_name="expense_requests")
    op.drop_index(op.f("ix_expense_requests_member_id"), table_name="expense_requests")
    op.drop_index(op.f("ix_expense_requests_expense_date"), table_name="expense_requests")
    op.drop_table("expense_requests")
    op.drop_index(op.f("ix_missionaries_tenant_id"), table_name="missionaries")
    op.drop_table("missionaries")
    op.drop_index(op.f("ix_countries_tenant_id"), table_name="countries")
    op.drop_table("countries")
