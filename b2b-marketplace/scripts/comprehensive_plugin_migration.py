#!/usr/bin/env python3
"""
Comprehensive Plugin Migration Script
Updates all plugin models to work with the new unified User model.
This script handles foreign key updates, relationship changes, and data migration.
"""

import asyncio
import logging
import sys
import os
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, inspect
from typing import Dict, List, Any

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal, sync_engine

logger = logging.getLogger(__name__)

class PluginMigrationAnalyzer:
    """Analyzes and migrates all plugins to work with new User model"""
    
    def __init__(self):
        self.migration_stats = {
            "tables_analyzed": 0,
            "foreign_keys_updated": 0,
            "relationships_updated": 0,
            "data_migrated": 0,
            "errors": []
        }
        
        # Define plugin tables that need migration
        self.plugin_tables = {
            # Core marketplace tables
            "orders": {"user_refs": ["buyer_id"], "seller_refs": ["seller_id"]},
            "products": {"seller_refs": ["seller_id"]},
            "payments": {"user_refs": ["user_id"]},
            "ratings": {"user_refs": ["rater_id", "ratee_id"], "seller_refs": ["seller_id"]},
            "rfq": {"user_refs": ["buyer_id"]},
            "quotes": {"user_refs": ["seller_id"]},
            "cart": {"user_refs": ["user_id"]},
            "cart_items": {},
            
            # Messaging and notifications
            "chat_rooms": {"user_refs": ["created_by"]},
            "chat_participants": {"user_refs": ["user_id"]},
            "messages": {"user_refs": ["sender_id"]},
            "message_read_status": {"user_refs": ["user_id"]},
            "chat_invitations": {"user_refs": ["invited_by", "invited_user_id"]},
            "notifications": {"user_refs": ["user_id"]},
            "notification_delivery_attempts": {},
            "notification_templates": {},
            "user_notification_preferences": {"user_refs": ["user_id"]},
            "notification_subscriptions": {"user_refs": ["user_id"]},
            "notification_batches": {},
            "notification_webhooks": {},
            "notification_analytics": {},
            
            # Admin and compliance
            "admin_users": {"user_refs": ["user_id"]},
            "admin_actions": {},
            "system_configs": {},
            "audit_logs": {"user_refs": ["user_id"]},
            "support_tickets": {"user_refs": ["user_id"]},
            "support_messages": {"user_refs": ["user_id"]},
            "content_moderation": {"user_refs": ["reported_by"]},
            "system_metrics": {},
            "admin_dashboards": {},
            "admin_notifications": {},
            "ip_blocklist": {},
            "admin_reports": {},
            
            # Advertising
            "ads": {"seller_refs": ["seller_id"]},
            "ad_campaigns": {"seller_refs": ["seller_id"]},
            "ad_impressions": {"user_refs": ["user_id"]},
            "ad_clicks": {"user_refs": ["user_id"]},
            "ad_conversions": {"user_refs": ["user_id"]},
            "ad_bids": {},
            "ad_spaces": {},
            "ad_blocklist": {"seller_refs": ["seller_id"]},
            "ad_analytics": {},
            
            # Financial
            "wallets": {"user_refs": ["user_id"]},
            "transactions": {},
            "withdrawal_requests": {"user_refs": ["user_id"]},
            "payment_refunds": {},
            "payment_webhooks": {},
            
            # Subscriptions
            "subscription_plans": {},
            "user_subscriptions": {"user_refs": ["user_id"]},
            
            # Compliance
            "banned_items": {},
            "compliance_audit_logs": {},
            
            # Escrow
            "escrows": {},
            
            # Analytics (already handled)
            "analytics_events": {"user_refs": ["user_id"]},
            
            # Gamification (already handled)
            "user_points": {"user_refs": ["user_id"]},
            "user_badges": {"user_refs": ["user_id"]},
            "badges": {},
        }
    
    async def analyze_and_migrate_plugins(self, db: AsyncSession):
        """Analyze all plugins and migrate them to work with new User model"""
        logger.info("Starting comprehensive plugin migration...")
        
        try:
            # Step 1: Analyze existing tables
            await self.analyze_existing_tables(db)
            
            # Step 2: Update foreign key references
            await self.update_foreign_key_references(db)
            
            # Step 3: Migrate data
            await self.migrate_plugin_data(db)
            
            # Step 4: Update relationships
            await self.update_relationships(db)
            
            # Step 5: Generate comprehensive report
            await self.generate_comprehensive_report()
            
            logger.info("Comprehensive plugin migration completed successfully!")
            
        except Exception as e:
            logger.error(f"Plugin migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            raise
    
    async def analyze_existing_tables(self, db: AsyncSession):
        """Analyze which tables exist and need migration"""
        logger.info("Analyzing existing plugin tables...")
        
        # Get list of existing tables using sync engine for inspection
        inspector = inspect(sync_engine)
        existing_tables = inspector.get_table_names()
        
        for table_name, refs in self.plugin_tables.items():
            if table_name in existing_tables:
                self.migration_stats["tables_analyzed"] += 1
                logger.info(f"Found table: {table_name}")
                
                # Check if table has foreign keys to users/sellers/buyers
                foreign_keys = inspector.get_foreign_keys(table_name)
                for fk in foreign_keys:
                    if fk['referred_table'] in ['users', 'sellers', 'buyers']:
                        logger.info(f"  - Foreign key: {fk['constrained_columns']} -> {fk['referred_table']}")
            else:
                logger.info(f"Table not found (will be created): {table_name}")
    
    async def update_foreign_key_references(self, db: AsyncSession):
        """Update foreign key references to use new user model"""
        logger.info("Updating foreign key references...")
        
        for table_name, refs in self.plugin_tables.items():
            try:
                # Update user references
                if "user_refs" in refs:
                    await self.update_user_references(db, table_name, refs["user_refs"])
                
                # Update seller references
                if "seller_refs" in refs:
                    await self.update_seller_references(db, table_name, refs["seller_refs"])
                
                self.migration_stats["foreign_keys_updated"] += 1
                
            except Exception as e:
                logger.error(f"Error updating {table_name}: {e}")
                self.migration_stats["errors"].append(f"{table_name}: {e}")
    
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
                
                # Add foreign key constraint
                await db.execute(text(f"""
                    ALTER TABLE {table_name} 
                    ADD CONSTRAINT fk_{table_name}_{column}_new_user_id 
                    FOREIGN KEY (new_{column}) REFERENCES users_new(id)
                """))
                
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
                
                # Add foreign key constraint
                await db.execute(text(f"""
                    ALTER TABLE {table_name} 
                    ADD CONSTRAINT fk_{table_name}_{column}_new_user_id 
                    FOREIGN KEY (new_{column}) REFERENCES users_new(id)
                """))
                
                logger.info(f"Updated {table_name}.{column} -> new_{column}")
                
            except Exception as e:
                logger.error(f"Error updating {table_name}.{column}: {e}")
                raise
    
    async def migrate_plugin_data(self, db: AsyncSession):
        """Migrate data from old references to new references"""
        logger.info("Migrating plugin data...")
        
        # This is handled by the foreign key updates above
        # Count migrated records
        for table_name, refs in self.plugin_tables.items():
            try:
                if "user_refs" in refs or "seller_refs" in refs:
                    result = await db.execute(text(f"""
                        SELECT COUNT(*) FROM {table_name} 
                        WHERE {' OR '.join([f'new_{col} IS NOT NULL' for col in (refs.get('user_refs', []) + refs.get('seller_refs', []))])}
                    """))
                    count = result.scalar()
                    if count > 0:
                        self.migration_stats["data_migrated"] += count
                        logger.info(f"Migrated {count} records in {table_name}")
            except Exception as e:
                logger.error(f"Error counting migrated data for {table_name}: {e}")
    
    async def update_relationships(self, db: AsyncSession):
        """Update SQLAlchemy relationships (this is done in code, not DB)"""
        logger.info("Relationship updates will be handled in model code...")
        self.migration_stats["relationships_updated"] = len(self.plugin_tables)
    
    async def generate_comprehensive_report(self):
        """Generate comprehensive migration report"""
        report = {
            "migration_timestamp": datetime.utcnow().isoformat(),
            "migration_type": "comprehensive_plugin_migration",
            "statistics": self.migration_stats,
            "migrated_tables": list(self.plugin_tables.keys()),
            "migration_summary": {
                "total_tables": len(self.plugin_tables),
                "tables_analyzed": self.migration_stats["tables_analyzed"],
                "foreign_keys_updated": self.migration_stats["foreign_keys_updated"],
                "data_migrated": self.migration_stats["data_migrated"],
                "errors": len(self.migration_stats["errors"])
            },
            "next_steps": [
                "Update plugin model files to use new foreign key columns",
                "Update plugin CRUD operations to use new user references",
                "Update plugin routes to handle new user model",
                "Test all plugin endpoints",
                "Update frontend to handle new user references",
                "Consider dropping old foreign key columns after testing"
            ],
            "plugin_specific_notes": {
                "analytics": "Already migrated in previous step",
                "gamification": "Already migrated in previous step",
                "orders": "Critical - handles buyer_id and seller_id",
                "products": "Critical - handles seller_id",
                "payments": "Critical - handles user_id",
                "ratings": "Critical - handles multiple user references",
                "messaging": "Critical - handles user_id in multiple tables",
                "notifications": "Critical - handles user_id",
                "admin": "Critical - handles user_id for admin users",
                "ads": "Critical - handles seller_id",
                "wallet": "Critical - handles user_id",
                "subscriptions": "Critical - handles user_id"
            }
        }
        
        with open("comprehensive_plugin_migration_report.json", "w") as f:
            import json
            json.dump(report, f, indent=2)
        
        logger.info("Comprehensive plugin migration report saved to comprehensive_plugin_migration_report.json")

async def run_comprehensive_plugin_migration():
    """Run the comprehensive plugin migration"""
    async with AsyncSessionLocal() as db:
        migration = PluginMigrationAnalyzer()
        await migration.analyze_and_migrate_plugins(db)

if __name__ == "__main__":
    asyncio.run(run_comprehensive_plugin_migration())
