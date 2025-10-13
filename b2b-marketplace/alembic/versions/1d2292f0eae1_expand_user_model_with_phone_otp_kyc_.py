"""Expand User model with phone, otp, kyc, profile fields

Revision ID: 1d2292f0eae1
Revises: 61b9678fc5cb
Create Date: 2025-10-01 12:36:12.577206
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1d2292f0eae1'
down_revision: Union[str, Sequence[str], None] = '61b9678fc5cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # --- other table changes omitted for brevity, keep your existing code ---
    # Example: ads, audit_logs, orders, ratings, sellers, user_profile_changes, user_sessions

    # --- users table changes ---
    with op.batch_alter_table('users', schema=None) as batch_op:
        # Fill NULL usernames with placeholder
        op.execute("UPDATE users SET username = CONCAT('user_', id) WHERE username IS NULL")

        # Add new columns
        batch_op.add_column(sa.Column('kyc_verified_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('totp_secret', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('two_factor_enabled', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('profile_completion_percentage', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('privacy_settings', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('notification_preferences', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('business_name', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('business_type', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('business_industry', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('business_description', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('business_registration_number', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('business_tax_id', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('business_phones', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('business_emails', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('website', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('business_addresses', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('bank_accounts', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('business_photo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('banner_photo', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))

        # Alter username to NOT NULL
        batch_op.alter_column(
            'username',
            existing_type=sa.VARCHAR(),
            nullable=False
        )


def downgrade() -> None:
    """Downgrade schema."""

    # --- users table revert ---
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column(
            'username',
            existing_type=sa.VARCHAR(),
            nullable=True
        )
        batch_op.drop_column('updated_at')
        batch_op.drop_column('banner_photo')
        batch_op.drop_column('business_photo')
        batch_op.drop_column('bank_accounts')
        batch_op.drop_column('business_addresses')
        batch_op.drop_column('website')
        batch_op.drop_column('business_emails')
        batch_op.drop_column('business_phones')
        batch_op.drop_column('business_tax_id')
        batch_op.drop_column('business_registration_number')
        batch_op.drop_column('business_description')
        batch_op.drop_column('business_industry')
        batch_op.drop_column('business_type')
        batch_op.drop_column('business_name')
        batch_op.drop_column('notification_preferences')
        batch_op.drop_column('privacy_settings')
        batch_op.drop_column('profile_completion_percentage')
        batch_op.drop_column('two_factor_enabled')
        batch_op.drop_column('totp_secret')
        batch_op.drop_column('kyc_verified_at')
