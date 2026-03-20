"""
Add social project link to prayer requests.
"""

from alembic import op
import sqlalchemy as sa

revision = "20260320_0012"
down_revision = "20260320_0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("prayer_requests", sa.Column("social_project_id", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_prayer_requests_social_project_id"), "prayer_requests", ["social_project_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_prayer_requests_social_project_id"), table_name="prayer_requests")
    op.drop_column("prayer_requests", "social_project_id")
