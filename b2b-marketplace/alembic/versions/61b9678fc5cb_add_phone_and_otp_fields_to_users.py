"""add phone and otp fields to users

Revision ID: 61b9678fc5cb
Revises: 5e6b6cc47c3f
Create Date: 2025-09-28 13:22:20.916420
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '61b9678fc5cb'
down_revision: Union[str, Sequence[str], None] = '5e6b6cc47c3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('username', sa.String(), nullable=True))  # allow NULL for now
        batch_op.add_column(sa.Column('phone', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('otp_code', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('otp_expiry', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('kyc_status', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('last_login', sa.DateTime(), nullable=True))

        batch_op.create_index(batch_op.f('ix_users_phone'), ['phone'], unique=True)
        batch_op.create_index(batch_op.f('ix_users_username'), ['username'], unique=True)

        # Drop unused column if it exists
        batch_op.drop_column('full_name')


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('full_name', sa.VARCHAR(), autoincrement=False, nullable=True))
        batch_op.drop_index(batch_op.f('ix_users_username'))
        batch_op.drop_index(batch_op.f('ix_users_phone'))
        batch_op.drop_column('last_login')
        batch_op.drop_column('kyc_status')
        batch_op.drop_column('otp_expiry')
        batch_op.drop_column('otp_code')
        batch_op.drop_column('phone')
        batch_op.drop_column('username')
