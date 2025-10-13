"""Create stores tables

Revision ID: 001_create_stores_tables
Revises: 
Create Date: 2025-10-04 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_create_stores_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create stores, products, and product_images tables"""
    
    # Create stores table
    op.create_table('stores',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('banner', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('subscription_type', sa.String(), nullable=False, default='free'),
        sa.Column('rating', sa.Float(), nullable=False, default=0.0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.id'], ),
    )
    op.create_index(op.f('ix_stores_id'), 'stores', ['id'], unique=False)
    op.create_index(op.f('ix_stores_user_id'), 'stores', ['user_id'], unique=False)
    
    # Create products table
    op.create_table('store_products',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('store_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False, default=0.0),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ),
    )
    op.create_index(op.f('ix_store_products_id'), 'store_products', ['id'], unique=False)
    op.create_index(op.f('ix_store_products_store_id'), 'store_products', ['store_id'], unique=False)
    
    # Create product_images table
    op.create_table('store_product_images',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['product_id'], ['store_products.id'], ),
    )
    op.create_index(op.f('ix_store_product_images_id'), 'store_product_images', ['id'], unique=False)
    op.create_index(op.f('ix_store_product_images_product_id'), 'store_product_images', ['product_id'], unique=False)


def downgrade():
    """Drop stores tables"""
    op.drop_index(op.f('ix_store_product_images_product_id'), table_name='store_product_images')
    op.drop_index(op.f('ix_store_product_images_id'), table_name='store_product_images')
    op.drop_table('store_product_images')
    
    op.drop_index(op.f('ix_store_products_store_id'), table_name='store_products')
    op.drop_index(op.f('ix_store_products_id'), table_name='store_products')
    op.drop_table('store_products')
    
    op.drop_index(op.f('ix_stores_user_id'), table_name='stores')
    op.drop_index(op.f('ix_stores_id'), table_name='stores')
    op.drop_table('stores')
