"""drop notification_preferences column

Revision ID: c5eaa5170fce
Revises: 1d2292f0eae1
Create Date: 2025-10-01 13:36:30.674577

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c5eaa5170fce'
down_revision: Union[str, Sequence[str], None] = '1d2292f0eae1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('users', 'notification_preferences')
    


def downgrade() -> None:
    op.add_column('users', sa.Column('notification_preferences', sa.JSON))
