"""
Link prayer requests to missionaries.
"""

from alembic import op
import sqlalchemy as sa

revision = "20260320_0010"
down_revision = "20260320_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("prayer_requests", sa.Column("missionary_id", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_prayer_requests_missionary_id"), "prayer_requests", ["missionary_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_prayer_requests_missionary_id"), table_name="prayer_requests")
    op.drop_column("prayer_requests", "missionary_id")
