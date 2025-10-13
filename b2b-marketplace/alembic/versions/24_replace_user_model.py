"""replace_seller_buyer_with_unified_user_model

Revision ID: 24_replace_user_model
Revises: 23_create_mobile_api_optimization_tables
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '24_replace_user_model'
down_revision = '23'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create new users table with the exact specification (alongside existing tables)
    op.create_table('users_new',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('unique_id', sa.String(), nullable=False),
        sa.Column('mobile_number', sa.String(), nullable=False),
        sa.Column('guild_codes', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('national_id', sa.String(), nullable=False),
        sa.Column('inapp_wallet_funds', sa.BigInteger(), nullable=False),
        sa.Column('profile_picture', sa.String(), nullable=False),
        sa.Column('badge', sa.String(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('otp_code', sa.String(), nullable=True),
        sa.Column('otp_expiry', sa.DateTime(), nullable=True),
        sa.Column('kyc_status', sa.String(), nullable=True),
        sa.Column('kyc_verified_at', sa.DateTime(), nullable=True),
        sa.Column('totp_secret', sa.String(), nullable=True),
        sa.Column('two_factor_enabled', sa.Boolean(), nullable=True),
        sa.Column('profile_completion_percentage', sa.Integer(), nullable=True),
        sa.Column('privacy_settings', sa.JSON(), nullable=True),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('business_name', sa.String(), nullable=False),
        sa.Column('business_description', sa.String(), nullable=False),
        sa.Column('bank_accounts', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('addresses', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('business_phones', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('website', sa.String(), nullable=False),
        sa.Column('whatsapp_id', sa.String(), nullable=False),
        sa.Column('telegram_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('mobile_number'),
        sa.UniqueConstraint('unique_id'),
        sa.UniqueConstraint('username')
    )
    
    # Add check constraints
    op.create_check_constraint(
        'chk_user_rating_range',
        'users_new',
        'rating >= 0 AND rating <= 5'
    )
    op.create_check_constraint(
        'chk_guild_codes_len',
        'users_new',
        'coalesce(array_length(guild_codes,1),0) <= 3'
    )
    op.create_check_constraint(
        'chk_addresses_len',
        'users_new',
        'coalesce(array_length(addresses,1),0) <= 3'
    )
    op.create_check_constraint(
        'chk_business_phones_len',
        'users_new',
        'coalesce(array_length(business_phones,1),0) <= 6'
    )
    
    # Create indexes
    op.create_index(op.f('ix_users_new_id'), 'users_new', ['id'], unique=False)
    op.create_index(op.f('ix_users_new_unique_id'), 'users_new', ['unique_id'], unique=True)
    
    # Create legacy mapping table for rollback and adapter use
    op.create_table('legacy_mapping',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('legacy_table', sa.String(), nullable=False),
        sa.Column('legacy_id', sa.Integer(), nullable=False),
        sa.Column('new_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('migration_timestamp', sa.DateTime(), nullable=False),
        sa.Column('conflict_resolved', sa.Boolean(), nullable=True),
        sa.Column('conflict_details', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['new_user_id'], ['users_new.id'], ),
        sa.UniqueConstraint('legacy_table', 'legacy_id', name='uq_legacy_mapping')
    )
    
    # Create user capabilities table for plugin system
    op.create_table('user_capabilities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('capability', sa.String(), nullable=False),
        sa.Column('granted_at', sa.DateTime(), nullable=False),
        sa.Column('granted_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.id'], ),
        sa.ForeignKeyConstraint(['granted_by'], ['users_new.id'], ),
        sa.UniqueConstraint('user_id', 'capability', name='uq_user_capability')
    )
    
    # Create offers table (replacing seller offers)
    op.create_table('offers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(), nullable=False, default='USD'),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.id'], )
    )
    
    # Create analytics events table (update existing to work with new user model)
    # Note: analytics_events table already exists in plugins/analytics/models.py
    # We'll update the foreign key reference instead of creating a new table
    
    # Create gamification tables (update existing to work with new user model)
    # Note: user_points and user_badges tables already exist in plugins/gamification/models.py
    # We'll update the foreign key references instead of creating new tables


def downgrade() -> None:
    # Drop new tables (only the ones we created, not existing plugin tables)
    op.drop_table('offers')
    op.drop_table('user_capabilities')
    op.drop_table('legacy_mapping')
    op.drop_table('users_new')
