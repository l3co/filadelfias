"""
Add governance meeting votes table.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260330_0016"
down_revision = "20260323_0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meeting_votes",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("meeting_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("agenda_index", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("choice", sa.String(length=20), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["meeting_id"],
            ["meetings.id"],
            name=op.f("fk_meeting_votes_meeting_id_meetings"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenants.id"],
            name=op.f("fk_meeting_votes_tenant_id_tenants"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_meeting_votes")),
        sa.UniqueConstraint("meeting_id", "agenda_index", "user_id", name="uq_meeting_votes_meeting_agenda_user"),
    )
    op.create_index(op.f("ix_meeting_votes_meeting_id"), "meeting_votes", ["meeting_id"], unique=False)
    op.create_index(op.f("ix_meeting_votes_tenant_id"), "meeting_votes", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_meeting_votes_user_id"), "meeting_votes", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_meeting_votes_user_id"), table_name="meeting_votes")
    op.drop_index(op.f("ix_meeting_votes_tenant_id"), table_name="meeting_votes")
    op.drop_index(op.f("ix_meeting_votes_meeting_id"), table_name="meeting_votes")
    op.drop_table("meeting_votes")
