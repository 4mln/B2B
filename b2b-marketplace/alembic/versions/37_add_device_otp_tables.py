"""Add device tracking and OTP tables

Revision ID: 37_add_device_otp_tables
Revises: 36_replace_user_model
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '37_add_device_otp_tables'
down_revision = '36_replace_user_model'
branch_labels = None
depends_on = None


def upgrade():
    # Create devices table
    op.create_table('devices',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_id', sa.String(length=255), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_type', sa.String(length=50), nullable=False),
        sa.Column('device_name', sa.String(length=255), nullable=True),
        sa.Column('refresh_token_hash', sa.String(length=255), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('os_name', sa.String(length=100), nullable=True),
        sa.Column('os_version', sa.String(length=100), nullable=True),
        sa.Column('app_version', sa.String(length=50), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('device_id')
    )
    op.create_index('idx_device_user_active', 'devices', ['user_id', 'revoked', 'expires_at'], unique=False)
    op.create_index('idx_device_token_hash', 'devices', ['refresh_token_hash'], unique=False)
    op.create_index(op.f('ix_devices_device_id'), 'devices', ['device_id'], unique=False)
    op.create_index(op.f('ix_devices_id'), 'devices', ['id'], unique=False)
    op.create_index(op.f('ix_devices_revoked'), 'devices', ['revoked'], unique=False)
    op.create_index(op.f('ix_devices_user_id'), 'devices', ['user_id'], unique=False)

    # Create otp_codes table
    op.create_table('otp_codes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('code_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_otp_cleanup', 'otp_codes', ['expires_at'], unique=False)
    op.create_index('idx_otp_phone_active', 'otp_codes', ['phone_number', 'is_used', 'expires_at'], unique=False)
    op.create_index('idx_otp_rate_limit', 'otp_codes', ['phone_number', 'created_at'], unique=False)
    op.create_index(op.f('ix_otp_codes_code_hash'), 'otp_codes', ['code_hash'], unique=False)
    op.create_index(op.f('ix_otp_codes_id'), 'otp_codes', ['id'], unique=False)
    op.create_index(op.f('ix_otp_codes_is_used'), 'otp_codes', ['is_used'], unique=False)
    op.create_index(op.f('ix_otp_codes_phone_number'), 'otp_codes', ['phone_number'], unique=False)

    # Create user_sessions table
    op.create_table('user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_id', sa.String(length=255), nullable=True),
        sa.Column('session_token', sa.String(length=255), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_activity', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('login_method', sa.String(length=50), nullable=True),
        sa.Column('login_provider', sa.String(length=50), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_session_cleanup', 'user_sessions', ['expires_at'], unique=False)
    op.create_index('idx_session_device', 'user_sessions', ['device_id'], unique=False)
    op.create_index('idx_session_user_active', 'user_sessions', ['user_id', 'is_active', 'last_activity'], unique=False)
    op.create_index(op.f('ix_user_sessions_device_id'), 'user_sessions', ['device_id'], unique=False)
    op.create_index(op.f('ix_user_sessions_id'), 'user_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_user_sessions_ip_address'), 'user_sessions', ['ip_address'], unique=False)
    op.create_index(op.f('ix_user_sessions_is_active'), 'user_sessions', ['is_active'], unique=False)
    op.create_index(op.f('ix_user_sessions_session_token'), 'user_sessions', ['session_token'], unique=False)
    op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'], unique=False)

    # Add device relationships to users_new table
    # Note: This is handled by SQLAlchemy relationships, no DB changes needed


def downgrade():
    # Drop tables in reverse order
    op.drop_table('user_sessions')
    op.drop_table('otp_codes')
    op.drop_table('devices')


