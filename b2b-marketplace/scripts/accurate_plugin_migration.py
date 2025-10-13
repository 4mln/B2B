#!/usr/bin/env python3
"""
Accurate Plugin Migration Script
Updates plugin tables to work with the new unified User model.
Based on actual database schema inspection.
"""

import asyncio
import logging
import sys
import os
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Dict, List, Any

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)

class AccuratePluginMigration:
    """Accurate plugin migration based on actual database schema"""
    
    def __init__(self):
        self.migration_stats = {
            "tables_updated": 0,
            "foreign_keys_added": 0,
            "data_migrated": 0,
            "errors": []
        }
        
        # Define the actual plugin tables based on database inspection
        self.actual_tables = {
            "orders": {"user_refs": ["buyer_id"], "seller_refs": ["seller_id"]},
            "products": {"seller_refs": ["seller_id"]},
            "payments": {"user_refs": ["user_id"]},
            "ratings": {"user_refs": ["rater_id", "ratee_id"]},  # No seller_id column
            "rfqs": {"user_refs": ["buyer_id"]},
            "quotes": {"user_refs": ["seller_id"]},
            "carts": {"user_refs": ["user_id"]},
            "chat_rooms": {"user_refs": ["created_by"]},
            "chat_participants": {"user_refs": ["user_id"]},
            "messages": {"user_refs": ["sender_id"]},
            "chat_invitations": {"user_refs": ["invited_by", "invited_user_id"]},
            "notifications": {"user_refs": ["user_id"]},
            "user_notification_preferences": {"user_refs": ["user_id"]},
            "notification_subscriptions": {"user_refs": ["user_id"]},
            "admin_users": {"user_refs": ["user_id"]},
            "support_tickets": {"user_refs": ["user_id"]},
            "support_messages": {"user_refs": ["user_id"]},
            "content_moderation": {"user_refs": ["reported_by"]},
            "ads": {"seller_refs": ["seller_id"]},
            "ad_campaigns": {"seller_refs": ["seller_id"]},
            "ad_impressions": {"user_refs": ["user_id"]},
            "ad_clicks": {"user_refs": ["user_id"]},
            "ad_conversions": {"user_refs": ["user_id"]},
            "wallets": {"user_refs": ["user_id"]},
            "withdrawal_requests": {"user_refs": ["user_id"]},
            "user_subscriptions": {"user_refs": ["user_id"]},
            "analytics_events": {"user_refs": ["user_id"]},
            "user_points": {"user_refs": ["user_id"]},
            "user_badges": {"user_refs": ["user_id"]},
        }
    
    async def migrate_actual_plugins(self, db: AsyncSession):
        """Migrate actual plugin tables"""
        logger.info("Starting accurate plugin migration...")
        
        try:
            # Step 1: Update foreign key references
            await self.update_foreign_key_references(db)
            
            # Step 2: Generate migration report
            await self.generate_migration_report()
            
            logger.info("Accurate plugin migration completed successfully!")
            
        except Exception as e:
            logger.error(f"Plugin migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            raise
    
    async def update_foreign_key_references(self, db: AsyncSession):
        """Update foreign key references to use new user model"""
        logger.info("Updating foreign key references...")
        
        for table_name, refs in self.actual_tables.items():
            try:
                # Check if table exists first
                result = await db.execute(text(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = '{table_name}'
                    );
                """))
                table_exists = result.scalar()
                
                if not table_exists:
                    logger.info(f"Table {table_name} does not exist, skipping...")
                    continue
                
                # Check if columns exist before trying to update them
                if "user_refs" in refs:
                    existing_user_refs = []
                    for column in refs["user_refs"]:
                        if await self.column_exists(db, table_name, column):
                            existing_user_refs.append(column)
                        else:
                            logger.info(f"Column {table_name}.{column} does not exist, skipping...")
                    
                    if existing_user_refs:
                        await self.update_user_references(db, table_name, existing_user_refs)
                
                if "seller_refs" in refs:
                    existing_seller_refs = []
                    for column in refs["seller_refs"]:
                        if await self.column_exists(db, table_name, column):
                            existing_seller_refs.append(column)
                        else:
                            logger.info(f"Column {table_name}.{column} does not exist, skipping...")
                    
                    if existing_seller_refs:
                        await self.update_seller_references(db, table_name, existing_seller_refs)
                
                self.migration_stats["tables_updated"] += 1
                
                # Commit after each table to prevent cascade failures
                await db.commit()
                
            except Exception as e:
                logger.error(f"Error updating {table_name}: {e}")
                self.migration_stats["errors"].append(f"{table_name}: {e}")
                # Rollback the transaction for this table
                await db.rollback()
    
    async def column_exists(self, db: AsyncSession, table_name: str, column_name: str) -> bool:
        """Check if a column exists in a table"""
        result = await db.execute(text(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = '{table_name}' AND column_name = '{column_name}'
            );
        """))
        return result.scalar()
    
    async def update_user_references(self, db: AsyncSession, table_name: str, user_columns: List[str]):
        """Update user_id references to use new user model"""
        for column in user_columns:
            try:
                # Add new_user_id column
                await db.execute(text(f"""
                    ALTER TABLE {table_name} 
                    ADD COLUMN IF NOT EXISTS new_{column} UUID
                """))
                
                # Update new_user_id based on legacy mapping
                await db.execute(text(f"""
                    UPDATE {table_name} 
                    SET new_{column} = lm.new_user_id
                    FROM legacy_mapping lm
                    WHERE {table_name}.{column} = lm.legacy_id 
                    AND lm.legacy_table = 'users'
                """))
                
                # Add foreign key constraint (check if it exists first)
                try:
                    await db.execute(text(f"""
                        ALTER TABLE {table_name} 
                        ADD CONSTRAINT fk_{table_name}_{column}_new_user_id 
                        FOREIGN KEY (new_{column}) REFERENCES users_new(id)
                    """))
                except Exception as e:
                    if "already exists" in str(e).lower():
                        logger.info(f"Constraint fk_{table_name}_{column}_new_user_id already exists")
                    else:
                        raise
                
                self.migration_stats["foreign_keys_added"] += 1
                logger.info(f"Updated {table_name}.{column} -> new_{column}")
                
            except Exception as e:
                logger.error(f"Error updating {table_name}.{column}: {e}")
                raise
    
    async def update_seller_references(self, db: AsyncSession, table_name: str, seller_columns: List[str]):
        """Update seller_id references to use new user model"""
        for column in seller_columns:
            try:
                # Add new_seller_id column
                await db.execute(text(f"""
                    ALTER TABLE {table_name} 
                    ADD COLUMN IF NOT EXISTS new_{column} UUID
                """))
                
                # Update new_seller_id based on legacy mapping
                await db.execute(text(f"""
                    UPDATE {table_name} 
                    SET new_{column} = lm.new_user_id
                    FROM legacy_mapping lm
                    WHERE {table_name}.{column} = lm.legacy_id 
                    AND lm.legacy_table = 'sellers'
                """))
                
                # Add foreign key constraint (check if it exists first)
                try:
                    await db.execute(text(f"""
                        ALTER TABLE {table_name} 
                        ADD CONSTRAINT fk_{table_name}_{column}_new_user_id 
                        FOREIGN KEY (new_{column}) REFERENCES users_new(id)
                    """))
                except Exception as e:
                    if "already exists" in str(e).lower():
                        logger.info(f"Constraint fk_{table_name}_{column}_new_user_id already exists")
                    else:
                        raise
                
                self.migration_stats["foreign_keys_added"] += 1
                logger.info(f"Updated {table_name}.{column} -> new_{column}")
                
            except Exception as e:
                logger.error(f"Error updating {table_name}.{column}: {e}")
                raise
    
    async def generate_migration_report(self):
        """Generate migration report"""
        report = {
            "migration_timestamp": datetime.utcnow().isoformat(),
            "migration_type": "accurate_plugin_migration",
            "statistics": self.migration_stats,
            "migrated_tables": list(self.actual_tables.keys()),
            "migration_summary": {
                "total_tables": len(self.actual_tables),
                "tables_updated": self.migration_stats["tables_updated"],
                "foreign_keys_added": self.migration_stats["foreign_keys_added"],
                "errors": len(self.migration_stats["errors"])
            },
            "next_steps": [
                "Update plugin model files to use new foreign key columns",
                "Update plugin CRUD operations to use new user references",
                "Update plugin routes to handle new user model",
                "Test all plugin endpoints",
                "Update frontend to handle new user references"
            ]
        }
        
        with open("accurate_plugin_migration_report.json", "w") as f:
            import json
            json.dump(report, f, indent=2)
        
        logger.info("Accurate plugin migration report saved to accurate_plugin_migration_report.json")

async def run_accurate_plugin_migration():
    """Run the accurate plugin migration"""
    async with AsyncSessionLocal() as db:
        migration = AccuratePluginMigration()
        await migration.migrate_actual_plugins(db)

if __name__ == "__main__":
    asyncio.run(run_accurate_plugin_migration())
