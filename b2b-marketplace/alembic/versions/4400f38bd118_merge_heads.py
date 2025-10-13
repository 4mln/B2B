"""merge_heads

Revision ID: 4400f38bd118
Revises: 24_replace_user_model, c5eaa5170fce
Create Date: 2025-10-04 10:09:07.151235

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4400f38bd118'
down_revision: Union[str, Sequence[str], None] = ('24_replace_user_model', 'c5eaa5170fce')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
