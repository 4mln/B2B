#!/usr/bin/env python3
"""
Update Existing Plugin Tables for New User Model
Updates foreign key references in existing analytics and gamification tables.
"""

import asyncio
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.session import get_session

logger = logging.getLogger(__name__)

class PluginTableMigration:
    """Updates existing plugin tables to work with new User model"""
    
    def __init__(self):
        self.migration_stats = {
            "analytics_events_updated": 0,
            "user_points_updated": 0,
            "user_badges_updated": 0,
            "errors": []
        }
    
    async def migrate_plugin_tables(self, db: AsyncSession):
        """Update existing plugin tables to reference new user model"""
        logger.info("Starting plugin table migration...")
        
        try:
            # Step 1: Update analytics_events table
            await self.update_analytics_events(db)
            
            # Step 2: Update gamification tables
            await self.update_gamification_tables(db)
            
            # Step 3: Generate migration report
            await self.generate_plugin_migration_report()
            
            logger.info("Plugin table migration completed successfully!")
            
        except Exception as e:
            logger.error(f"Plugin table migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            raise
    
    async def update_analytics_events(self, db: AsyncSession):
        """Update analytics_events table to reference new user model"""
        logger.info("Updating analytics_events table...")
        
        try:
            # First, add new user_id column (UUID type)
            await db.execute(text("""
                ALTER TABLE analytics_events 
                ADD COLUMN IF NOT EXISTS new_user_id UUID
            """))
            
            # Update new_user_id based on legacy mapping
            await db.execute(text("""
                UPDATE analytics_events 
                SET new_user_id = lm.new_user_id
                FROM legacy_mapping lm
                WHERE analytics_events.user_id = lm.legacy_id 
                AND lm.legacy_table = 'users'
            """))
            
            # Count updated records
            result = await db.execute(text("""
                SELECT COUNT(*) FROM analytics_events WHERE new_user_id IS NOT NULL
            """))
            self.migration_stats["analytics_events_updated"] = result.scalar()
            
            # Add foreign key constraint
            await db.execute(text("""
                ALTER TABLE analytics_events 
                ADD CONSTRAINT fk_analytics_events_new_user_id 
                FOREIGN KEY (new_user_id) REFERENCES users_new(id)
            """))
            
            await db.commit()
            logger.info(f"Updated {self.migration_stats['analytics_events_updated']} analytics events")
            
        except Exception as e:
            logger.error(f"Error updating analytics_events: {e}")
            self.migration_stats["errors"].append(f"Analytics events: {e}")
    
    async def update_gamification_tables(self, db: AsyncSession):
        """Update gamification tables to reference new user model"""
        logger.info("Updating gamification tables...")
        
        try:
            # Update user_points table
            await self.update_user_points(db)
            
            # Update user_badges table
            await self.update_user_badges(db)
            
            await db.commit()
            
        except Exception as e:
            logger.error(f"Error updating gamification tables: {e}")
            self.migration_stats["errors"].append(f"Gamification tables: {e}")
    
    async def update_user_points(self, db: AsyncSession):
        """Update user_points table"""
        try:
            # Add new user_id column (UUID type)
            await db.execute(text("""
                ALTER TABLE user_points 
                ADD COLUMN IF NOT EXISTS new_user_id UUID
            """))
            
            # Update new_user_id based on legacy mapping
            await db.execute(text("""
                UPDATE user_points 
                SET new_user_id = lm.new_user_id
                FROM legacy_mapping lm
                WHERE user_points.user_id = lm.legacy_id 
                AND lm.legacy_table = 'users'
            """))
            
            # Count updated records
            result = await db.execute(text("""
                SELECT COUNT(*) FROM user_points WHERE new_user_id IS NOT NULL
            """))
            self.migration_stats["user_points_updated"] = result.scalar()
            
            # Add foreign key constraint
            await db.execute(text("""
                ALTER TABLE user_points 
                ADD CONSTRAINT fk_user_points_new_user_id 
                FOREIGN KEY (new_user_id) REFERENCES users_new(id)
            """))
            
            logger.info(f"Updated {self.migration_stats['user_points_updated']} user points records")
            
        except Exception as e:
            logger.error(f"Error updating user_points: {e}")
            raise
    
    async def update_user_badges(self, db: AsyncSession):
        """Update user_badges table"""
        try:
            # Add new user_id column (UUID type)
            await db.execute(text("""
                ALTER TABLE user_badges 
                ADD COLUMN IF NOT EXISTS new_user_id UUID
            """))
            
            # Update new_user_id based on legacy mapping
            await db.execute(text("""
                UPDATE user_badges 
                SET new_user_id = lm.new_user_id
                FROM legacy_mapping lm
                WHERE user_badges.user_id = lm.legacy_id 
                AND lm.legacy_table = 'users'
            """))
            
            # Count updated records
            result = await db.execute(text("""
                SELECT COUNT(*) FROM user_badges WHERE new_user_id IS NOT NULL
            """))
            self.migration_stats["user_badges_updated"] = result.scalar()
            
            # Add foreign key constraint
            await db.execute(text("""
                ALTER TABLE user_badges 
                ADD CONSTRAINT fk_user_badges_new_user_id 
                FOREIGN KEY (new_user_id) REFERENCES users_new(id)
            """))
            
            logger.info(f"Updated {self.migration_stats['user_badges_updated']} user badges records")
            
        except Exception as e:
            logger.error(f"Error updating user_badges: {e}")
            raise
    
    async def generate_plugin_migration_report(self):
        """Generate plugin migration report"""
        report = {
            "migration_timestamp": datetime.utcnow().isoformat(),
            "migration_type": "plugin_table_update",
            "statistics": self.migration_stats,
            "updated_tables": [
                "analytics_events",
                "user_points", 
                "user_badges"
            ],
            "recommendations": [
                "Test existing analytics and gamification endpoints",
                "Update plugin code to use new_user_id field",
                "Consider dropping old user_id columns after testing",
                "Update frontend to handle new user references"
            ]
        }
        
        with open("plugin_table_migration_report.json", "w") as f:
            import json
            json.dump(report, f, indent=2)
        
        logger.info("Plugin table migration report saved to plugin_table_migration_report.json")

async def run_plugin_table_migration():
    """Run the plugin table migration"""
    async with get_session() as db:
        migration = PluginTableMigration()
        await migration.migrate_plugin_tables(db)

if __name__ == "__main__":
    asyncio.run(run_plugin_table_migration())
