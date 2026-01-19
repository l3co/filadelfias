"""add office and functions to member

Revision ID: 3a7b8c9d0e1f
Revises: 2c6672df2e12
Create Date: 2026-01-19 16:52:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '3a7b8c9d0e1f'
down_revision: Union[str, None] = '2c6672df2e12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add office column with default value
    op.add_column('members', sa.Column('office', sa.String(50), nullable=False, server_default='MEMBRO'))

    # Add functions column as JSON array
    op.add_column('members', sa.Column('functions', sa.JSON(), nullable=True))

    # Copy data from role to office for existing records
    op.execute("UPDATE members SET office = role WHERE role IN ('MEMBRO', 'DIACONO', 'PRESBITERO', 'PASTOR')")

    # For evangelista and missionario, set office to MEMBRO and add to functions
    op.execute("""
        UPDATE members
        SET office = 'MEMBRO', functions = '["EVANGELISTA"]'::jsonb
        WHERE role = 'EVANGELISTA'
    """)
    op.execute("""
        UPDATE members
        SET office = 'MEMBRO', functions = '["MISSIONARIO"]'::jsonb
        WHERE role = 'MISSIONARIO'
    """)


def downgrade() -> None:
    op.drop_column('members', 'functions')
    op.drop_column('members', 'office')
