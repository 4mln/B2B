"""Add wallet analytics and currency tables

Revision ID: 9a7e4f12d853
Revises: previous_revision_id_here
Create Date: 2025-10-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9a7e4f12d853'
down_revision = None  # Update this with the previous migration ID
branch_labels = None
depends_on = None

def upgrade():
    # Create supported_currencies table
    op.create_table(
        'supported_currencies',
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('symbol', sa.String(), nullable=False),
        sa.Column('is_crypto', sa.Boolean(), default=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('code')
    )

    # Create exchange_rates table
    op.create_table(
        'exchange_rates',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('from_currency', sa.String(), nullable=False),
        sa.Column('to_currency', sa.String(), nullable=False),
        sa.Column('rate', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['from_currency'], ['supported_currencies.code'], ),
        sa.ForeignKeyConstraint(['to_currency'], ['supported_currencies.code'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create wallet_analytics table
    op.create_table(
        'wallet_analytics',
        sa.Column('wallet_id', sa.String(), nullable=False),
        sa.Column('daily_stats', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('monthly_stats', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('last_updated', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id'], ),
        sa.PrimaryKeyConstraint('wallet_id')
    )

    # Create indices
    op.create_index(
        'ix_exchange_rates_from_currency', 
        'exchange_rates', 
        ['from_currency']
    )
    op.create_index(
        'ix_exchange_rates_to_currency', 
        'exchange_rates', 
        ['to_currency']
    )
    op.create_index(
        'ix_exchange_rates_created_at', 
        'exchange_rates', 
        ['created_at']
    )

def downgrade():
    op.drop_table('wallet_analytics')
    op.drop_table('exchange_rates')
    op.drop_table('supported_currencies')