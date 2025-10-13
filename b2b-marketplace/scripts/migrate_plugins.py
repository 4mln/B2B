#!/usr/bin/env python3
"""
Plugin Migration Script
Migrates plugin configurations from Seller/Buyer-based to capability-based system.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, text

from app.db.session import get_session
from app.core.plugin_capabilities import CapabilityManager, plugin_registry

logger = logging.getLogger(__name__)

class PluginMigration:
    """Handles migration of plugin configurations"""
    
    def __init__(self):
        self.migration_stats = {
            "plugins_migrated": 0,
            "capabilities_granted": 0,
            "errors": []
        }
    
    async def migrate_plugin_configs(self, db: AsyncSession):
        """Migrate plugin configurations to capability-based system"""
        logger.info("Starting plugin migration...")
        
        try:
            # Step 1: Migrate existing plugin configurations
            await self.migrate_existing_configs(db)
            
            # Step 2: Update user capabilities based on badges
            await self.update_user_capabilities(db)
            
            # Step 3: Generate migration report
            await self.generate_plugin_migration_report()
            
            logger.info("Plugin migration completed successfully!")
            
        except Exception as e:
            logger.error(f"Plugin migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            raise
    
    async def migrate_existing_configs(self, db: AsyncSession):
        """Migrate existing plugin configurations"""
        logger.info("Migrating existing plugin configurations...")
        
        # Define plugin configuration mappings
        plugin_mappings = {
            "seller_management": {
                "old_target": "sellers",
                "new_capabilities": ["can_post_offers", "can_manage_inventory", "can_view_analytics"],
                "badge_requirements": ["seller", "seller/buyer"]
            },
            "buyer_dashboard": {
                "old_target": "buyers", 
                "new_capabilities": ["can_browse_products", "can_create_orders", "can_view_order_history"],
                "badge_requirements": ["buyer", "seller/buyer"]
            },
            "messaging": {
                "old_target": "all_users",
                "new_capabilities": ["can_send_messages", "can_view_profiles"],
                "badge_requirements": ["seller", "buyer", "seller/buyer"]
            },
            "analytics": {
                "old_target": "sellers",
                "new_capabilities": ["can_view_analytics"],
                "badge_requirements": ["seller", "seller/buyer"]
            },
            "admin_panel": {
                "old_target": "admins",
                "new_capabilities": ["can_manage_users", "can_view_system_analytics"],
                "badge_requirements": ["admin"]  # Special admin badge
            }
        }
        
        # Create plugin configuration table if it doesn't exist
        await self.create_plugin_config_table(db)
        
        # Migrate each plugin configuration
        for plugin_name, config in plugin_mappings.items():
            try:
                await self.migrate_plugin_config(db, plugin_name, config)
                self.migration_stats["plugins_migrated"] += 1
                
            except Exception as e:
                logger.error(f"Error migrating plugin {plugin_name}: {e}")
                self.migration_stats["errors"].append(f"Plugin {plugin_name}: {e}")
        
        await db.commit()
    
    async def create_plugin_config_table(self, db: AsyncSession):
        """Create plugin configuration table"""
        try:
            await db.execute(text("""
                CREATE TABLE IF NOT EXISTS plugin_configurations (
                    id SERIAL PRIMARY KEY,
                    plugin_name VARCHAR(255) NOT NULL,
                    configuration JSON NOT NULL,
                    target_capabilities TEXT[] NOT NULL,
                    target_badges TEXT[] NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(plugin_name)
                )
            """))
            await db.commit()
            logger.info("Created plugin_configurations table")
            
        except Exception as e:
            logger.error(f"Error creating plugin_configurations table: {e}")
            raise
    
    async def migrate_plugin_config(self, db: AsyncSession, plugin_name: str, config: Dict[str, Any]):
        """Migrate individual plugin configuration"""
        plugin_config = {
            "plugin_name": plugin_name,
            "configuration": {
                "migrated_from": config["old_target"],
                "migration_timestamp": datetime.utcnow().isoformat(),
                "capability_based": True
            },
            "target_capabilities": config["new_capabilities"],
            "target_badges": config["badge_requirements"],
            "is_active": True
        }
        
        # Insert or update plugin configuration
        await db.execute(text("""
            INSERT INTO plugin_configurations 
            (plugin_name, configuration, target_capabilities, target_badges, is_active)
            VALUES (:plugin_name, :configuration, :target_capabilities, :target_badges, :is_active)
            ON CONFLICT (plugin_name) 
            DO UPDATE SET 
                configuration = EXCLUDED.configuration,
                target_capabilities = EXCLUDED.target_capabilities,
                target_badges = EXCLUDED.target_badges,
                updated_at = NOW()
        """), plugin_config)
        
        logger.info(f"Migrated plugin configuration for {plugin_name}")
    
    async def update_user_capabilities(self, db: AsyncSession):
        """Update user capabilities based on badges"""
        logger.info("Updating user capabilities based on badges...")
        
        capability_manager = CapabilityManager(db)
        
        # Get all users
        result = await db.execute(select(text("*")).select_from(text("users_new")))
        users = result.fetchall()
        
        for user_row in users:
            try:
                # Create User object from row
                from app.models.user import User
                user = User()
                user.id = user_row.id
                user.unique_id = user_row.unique_id
                user.badge = user_row.badge
                
                # Update capabilities
                result = await capability_manager.update_user_capabilities(user)
                self.migration_stats["capabilities_granted"] += len(result["granted_capabilities"])
                
            except Exception as e:
                logger.error(f"Error updating capabilities for user {user_row.id}: {e}")
                self.migration_stats["errors"].append(f"User {user_row.id}: {e}")
        
        await db.commit()
        logger.info(f"Updated capabilities for {len(users)} users")
    
    async def generate_plugin_migration_report(self):
        """Generate plugin migration report"""
        report = {
            "migration_timestamp": datetime.utcnow().isoformat(),
            "statistics": self.migration_stats,
            "plugin_registry": {
                "registered_plugins": list(plugin_registry.plugin_requirements.keys()),
                "available_capabilities": list(CapabilityManager.CAPABILITIES.keys()),
                "badge_capabilities": CapabilityManager.BADGE_CAPABILITIES
            },
            "recommendations": [
                "Test all plugins with new capability system",
                "Update plugin loader to use capability checks",
                "Remove old Seller/Buyer-based plugin logic",
                "Update frontend to use capability-based features"
            ]
        }
        
        with open("plugin_migration_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        logger.info("Plugin migration report saved to plugin_migration_report.json")

async def run_plugin_migration():
    """Run the plugin migration"""
    async with get_session() as db:
        migration = PluginMigration()
        await migration.migrate_plugin_configs(db)

if __name__ == "__main__":
    asyncio.run(run_plugin_migration())
