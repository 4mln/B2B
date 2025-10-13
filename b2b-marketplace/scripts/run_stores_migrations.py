#!/usr/bin/env python3
"""
Run Stores Plugin Migrations
Execute Alembic migrations for the stores plugin
"""

import os
import sys
import asyncio
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from alembic import command
from alembic.config import Config
from app.db.session import async_engine
from sqlalchemy import text


async def run_stores_migrations():
    """Run stores plugin migrations"""
    print("🔄 Running stores plugin migrations...")
    
    # Set up Alembic configuration
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", "plugins/stores/migrations")
    alembic_cfg.set_main_option("sqlalchemy.url", str(async_engine.url))
    
    try:
        # Run migrations
        command.upgrade(alembic_cfg, "head")
        print("✅ Stores plugin migrations completed successfully!")
        
        # Verify tables were created
        async with async_engine.begin() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('stores', 'store_product_images')
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]
            
            # Check if store_id column was added to products table
            result2 = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'products' 
                AND column_name = 'store_id'
            """))
            store_id_column = result2.fetchone()
            
            if len(tables) == 2 and store_id_column:
                print(f"✅ All stores tables created: {', '.join(tables)}")
                print(f"✅ store_id column added to products table")
            else:
                print(f"⚠️  Expected 2 tables and store_id column, found {len(tables)} tables: {', '.join(tables)}")
                if not store_id_column:
                    print("⚠️  store_id column not found in products table")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False


async def rollback_stores_migrations():
    """Rollback stores plugin migrations"""
    print("🔄 Rolling back stores plugin migrations...")
    
    # Set up Alembic configuration
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", "plugins/stores/migrations")
    alembic_cfg.set_main_option("sqlalchemy.url", str(async_engine.url))
    
    try:
        # Rollback to base
        command.downgrade(alembic_cfg, "base")
        print("✅ Stores plugin migrations rolled back successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Rollback failed: {e}")
        return False


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run stores plugin migrations")
    parser.add_argument("--rollback", action="store_true", help="Rollback migrations")
    args = parser.parse_args()
    
    if args.rollback:
        success = asyncio.run(rollback_stores_migrations())
    else:
        success = asyncio.run(run_stores_migrations())
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
