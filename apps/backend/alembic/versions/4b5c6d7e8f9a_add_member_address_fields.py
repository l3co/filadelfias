"""add member address fields

Revision ID: 4b5c6d7e8f9a
Revises: 3a7b8c9d0e1f
Create Date: 2026-01-19 17:10:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '4b5c6d7e8f9a'
down_revision: Union[str, None] = '3a7b8c9d0e1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add structured address columns to members
    op.add_column('members', sa.Column('street', sa.String(255), nullable=True))
    op.add_column('members', sa.Column('number', sa.String(20), nullable=True))
    op.add_column('members', sa.Column('complement', sa.String(100), nullable=True))
    op.add_column('members', sa.Column('neighborhood', sa.String(100), nullable=True))
    op.add_column('members', sa.Column('city', sa.String(100), nullable=True))
    op.add_column('members', sa.Column('state', sa.String(2), nullable=True))
    op.add_column('members', sa.Column('postal_code', sa.String(10), nullable=True))

    # Drop old address column
    op.drop_column('members', 'address')


def downgrade() -> None:
    # Recreate address column
    op.add_column('members', sa.Column('address', sa.Text(), nullable=True))

    # Drop structured address columns
    op.drop_column('members', 'postal_code')
    op.drop_column('members', 'state')
    op.drop_column('members', 'city')
    op.drop_column('members', 'neighborhood')
    op.drop_column('members', 'complement')
    op.drop_column('members', 'number')
    op.drop_column('members', 'street')
