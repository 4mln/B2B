"""add analytics events table

Revision ID: 20251013_add_analytics_events
Revises: 
Create Date: 2025-10-13 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('new_user_id', sa.UUID(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('event_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

def downgrade():
    op.drop_table('analytics_events')
