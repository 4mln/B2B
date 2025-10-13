"""Add store_id to existing products table

Revision ID: 002_add_store_id_to_products
Revises: 001_create_stores_tables
Create Date: 2025-10-04 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_store_id_to_products'
down_revision = '001_create_stores_tables'
branch_labels = None
depends_on = None


def upgrade():
    """Add store_id column to existing products table"""
    
    # Add store_id column to products table
    op.add_column('products', sa.Column('store_id', postgresql.UUID(as_uuid=True), nullable=True))
    
    # Create index for store_id
    op.create_index(op.f('ix_products_store_id'), 'products', ['store_id'], unique=False)
    
    # Add foreign key constraint
    op.create_foreign_key('fk_products_store_id', 'products', 'stores', ['store_id'], ['id'])


def downgrade():
    """Remove store_id column from products table"""
    
    # Drop foreign key constraint
    op.drop_constraint('fk_products_store_id', 'products', type_='foreignkey')
    
    # Drop index
    op.drop_index(op.f('ix_products_store_id'), table_name='products')
    
    # Drop column
    op.drop_column('products', 'store_id')

