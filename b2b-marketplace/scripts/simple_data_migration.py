#!/usr/bin/env python3
"""
Simple Data Migration Script for Seller/Buyer to User Model
Migrates existing data without importing all plugin models.
"""

import asyncio
import json
import logging
import sys
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from uuid import uuid4

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import select, insert, update, text
from sqlalchemy.orm import selectinload

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleDataMigration:
    def __init__(self):
        self.migration_stats = {
            "users_migrated": 0,
            "sellers_migrated": 0,
            "buyers_migrated": 0,
            "conflicts_resolved": 0,
            "errors": []
        }
        
    async def run_migration(self):
        """Run the complete data migration"""
        try:
            # Get database URL from environment
            database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
            
            # Create async engine
            engine = create_async_engine(database_url)
            
            async with engine.begin() as conn:
                logger.info("Starting data migration...")
                
                # Check if users_new table exists
                result = await conn.execute(text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'users_new'
                    );
                """))
                table_exists = result.scalar()
                
                if not table_exists:
                    logger.error("users_new table does not exist. Run Alembic migration first.")
                    return
                
                # Migrate users
                await self.migrate_users(conn)
                
                # Migrate sellers
                await self.migrate_sellers(conn)
                
                # Migrate buyers
                await self.migrate_buyers(conn)
                
                logger.info("Data migration completed successfully!")
                logger.info(f"Migration stats: {self.migration_stats}")
                
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            raise
    
    async def migrate_users(self, conn):
        """Migrate users table"""
        try:
            # Get all users from legacy table
            result = await conn.execute(text("SELECT * FROM users"))
            users = result.fetchall()
            
            logger.info(f"Found {len(users)} users to migrate")
            
            for user in users:
                # Create new user record
                new_user_id = str(uuid4())
                
                await conn.execute(text("""
                    INSERT INTO users_new (
                        id, unique_id, username, email, mobile, password_hash,
                        first_name, last_name, profile_picture, badge, is_active,
                        email_verified, mobile_verified, created_at, updated_at
                    ) VALUES (
                        :id, :unique_id, :username, :email, :mobile, :password_hash,
                        :first_name, :last_name, :profile_picture, :badge, :is_active,
                        :email_verified, :mobile_verified, :created_at, :updated_at
                    )
                """), {
                    "id": new_user_id,
                    "unique_id": f"USR-{user.id:09d}",
                    "username": user.username,
                    "email": user.email,
                    "mobile": user.mobile,
                    "password_hash": user.password_hash,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "profile_picture": user.profile_picture,
                    "badge": "user",
                    "is_active": user.is_active,
                    "email_verified": user.email_verified,
                    "mobile_verified": user.mobile_verified,
                    "created_at": user.created_at,
                    "updated_at": user.updated_at
                })
                
                # Create legacy mapping
                await conn.execute(text("""
                    INSERT INTO legacy_mapping (legacy_table, legacy_id, new_user_id, created_at)
                    VALUES (:legacy_table, :legacy_id, :new_user_id, :created_at)
                """), {
                    "legacy_table": "users",
                    "legacy_id": user.id,
                    "new_user_id": new_user_id,
                    "created_at": datetime.utcnow()
                })
                
                self.migration_stats["users_migrated"] += 1
                
        except Exception as e:
            logger.error(f"Error migrating users: {e}")
            self.migration_stats["errors"].append(f"Users migration: {e}")
    
    async def migrate_sellers(self, conn):
        """Migrate sellers table"""
        try:
            # Get all sellers from legacy table
            result = await conn.execute(text("SELECT * FROM sellers"))
            sellers = result.fetchall()
            
            logger.info(f"Found {len(sellers)} sellers to migrate")
            
            for seller in sellers:
                # Check if user already exists
                user_result = await conn.execute(text("""
                    SELECT new_user_id FROM legacy_mapping 
                    WHERE legacy_table = 'users' AND legacy_id = :user_id
                """), {"user_id": seller.user_id})
                
                existing_mapping = user_result.fetchone()
                
                if existing_mapping:
                    # Update existing user with seller badge
                    await conn.execute(text("""
                        UPDATE users_new 
                        SET badge = 'seller', 
                            business_name = :business_name,
                            business_type = :business_type,
                            business_description = :business_description,
                            business_address = :business_address,
                            business_phone = :business_phone,
                            business_website = :business_website,
                            business_license = :business_license,
                            business_tax_id = :business_tax_id,
                            updated_at = :updated_at
                        WHERE id = :user_id
                    """), {
                        "user_id": existing_mapping.new_user_id,
                        "business_name": seller.business_name,
                        "business_type": seller.business_type,
                        "business_description": seller.business_description,
                        "business_address": seller.business_address,
                        "business_phone": seller.business_phone,
                        "business_website": seller.business_website,
                        "business_license": seller.business_license,
                        "business_tax_id": seller.business_tax_id,
                        "updated_at": datetime.utcnow()
                    })
                    
                    # Create legacy mapping for seller
                    await conn.execute(text("""
                        INSERT INTO legacy_mapping (legacy_table, legacy_id, new_user_id, created_at)
                        VALUES (:legacy_table, :legacy_id, :new_user_id, :created_at)
                    """), {
                        "legacy_table": "sellers",
                        "legacy_id": seller.id,
                        "new_user_id": existing_mapping.new_user_id,
                        "created_at": datetime.utcnow()
                    })
                else:
                    # Create new user for seller
                    new_user_id = str(uuid4())
                    
                    await conn.execute(text("""
                        INSERT INTO users_new (
                            id, unique_id, username, email, mobile, password_hash,
                            first_name, last_name, profile_picture, badge, is_active,
                            email_verified, mobile_verified, business_name, business_type,
                            business_description, business_address, business_phone,
                            business_website, business_license, business_tax_id,
                            created_at, updated_at
                        ) VALUES (
                            :id, :unique_id, :username, :email, :mobile, :password_hash,
                            :first_name, :last_name, :profile_picture, :badge, :is_active,
                            :email_verified, :mobile_verified, :business_name, :business_type,
                            :business_description, :business_address, :business_phone,
                            :business_website, :business_license, :business_tax_id,
                            :created_at, :updated_at
                        )
                    """), {
                        "id": new_user_id,
                        "unique_id": f"USR-{seller.id:09d}",
                        "username": seller.username,
                        "email": seller.email,
                        "mobile": seller.mobile,
                        "password_hash": seller.password_hash,
                        "first_name": seller.first_name,
                        "last_name": seller.last_name,
                        "profile_picture": seller.profile_picture,
                        "badge": "seller",
                        "is_active": seller.is_active,
                        "email_verified": seller.email_verified,
                        "mobile_verified": seller.mobile_verified,
                        "business_name": seller.business_name,
                        "business_type": seller.business_type,
                        "business_description": seller.business_description,
                        "business_address": seller.business_address,
                        "business_phone": seller.business_phone,
                        "business_website": seller.business_website,
                        "business_license": seller.business_license,
                        "business_tax_id": seller.business_tax_id,
                        "created_at": seller.created_at,
                        "updated_at": seller.updated_at
                    })
                    
                    # Create legacy mappings
                    await conn.execute(text("""
                        INSERT INTO legacy_mapping (legacy_table, legacy_id, new_user_id, created_at)
                        VALUES (:legacy_table, :legacy_id, :new_user_id, :created_at)
                    """), {
                        "legacy_table": "sellers",
                        "legacy_id": seller.id,
                        "new_user_id": new_user_id,
                        "created_at": datetime.utcnow()
                    })
                
                self.migration_stats["sellers_migrated"] += 1
                
        except Exception as e:
            logger.error(f"Error migrating sellers: {e}")
            self.migration_stats["errors"].append(f"Sellers migration: {e}")
    
    async def migrate_buyers(self, conn):
        """Migrate buyers table"""
        try:
            # Get all buyers from legacy table
            result = await conn.execute(text("SELECT * FROM buyers"))
            buyers = result.fetchall()
            
            logger.info(f"Found {len(buyers)} buyers to migrate")
            
            for buyer in buyers:
                # Check if user already exists
                user_result = await conn.execute(text("""
                    SELECT new_user_id FROM legacy_mapping 
                    WHERE legacy_table = 'users' AND legacy_id = :user_id
                """), {"user_id": buyer.user_id})
                
                existing_mapping = user_result.fetchone()
                
                if existing_mapping:
                    # Update existing user with buyer badge
                    await conn.execute(text("""
                        UPDATE users_new 
                        SET badge = CASE 
                            WHEN badge = 'seller' THEN 'seller/buyer'
                            ELSE 'buyer'
                        END,
                        updated_at = :updated_at
                        WHERE id = :user_id
                    """), {
                        "user_id": existing_mapping.new_user_id,
                        "updated_at": datetime.utcnow()
                    })
                    
                    # Create legacy mapping for buyer
                    await conn.execute(text("""
                        INSERT INTO legacy_mapping (legacy_table, legacy_id, new_user_id, created_at)
                        VALUES (:legacy_table, :legacy_id, :new_user_id, :created_at)
                    """), {
                        "legacy_table": "buyers",
                        "legacy_id": buyer.id,
                        "new_user_id": existing_mapping.new_user_id,
                        "created_at": datetime.utcnow()
                    })
                else:
                    # Create new user for buyer
                    new_user_id = str(uuid4())
                    
                    await conn.execute(text("""
                        INSERT INTO users_new (
                            id, unique_id, username, email, mobile, password_hash,
                            first_name, last_name, profile_picture, badge, is_active,
                            email_verified, mobile_verified, created_at, updated_at
                        ) VALUES (
                            :id, :unique_id, :username, :email, :mobile, :password_hash,
                            :first_name, :last_name, :profile_picture, :badge, :is_active,
                            :email_verified, :mobile_verified, :created_at, :updated_at
                        )
                    """), {
                        "id": new_user_id,
                        "unique_id": f"USR-{buyer.id:09d}",
                        "username": buyer.username,
                        "email": buyer.email,
                        "mobile": buyer.mobile,
                        "password_hash": buyer.password_hash,
                        "first_name": buyer.first_name,
                        "last_name": buyer.last_name,
                        "profile_picture": buyer.profile_picture,
                        "badge": "buyer",
                        "is_active": buyer.is_active,
                        "email_verified": buyer.email_verified,
                        "mobile_verified": buyer.mobile_verified,
                        "created_at": buyer.created_at,
                        "updated_at": buyer.updated_at
                    })
                    
                    # Create legacy mapping
                    await conn.execute(text("""
                        INSERT INTO legacy_mapping (legacy_table, legacy_id, new_user_id, created_at)
                        VALUES (:legacy_table, :legacy_id, :new_user_id, :created_at)
                    """), {
                        "legacy_table": "buyers",
                        "legacy_id": buyer.id,
                        "new_user_id": new_user_id,
                        "created_at": datetime.utcnow()
                    })
                
                self.migration_stats["buyers_migrated"] += 1
                
        except Exception as e:
            logger.error(f"Error migrating buyers: {e}")
            self.migration_stats["errors"].append(f"Buyers migration: {e}")

async def main():
    """Main function"""
    migration = SimpleDataMigration()
    await migration.run_migration()
    
    # Save migration report
    report = {
        "migration_timestamp": datetime.utcnow().isoformat(),
        "migration_type": "simple_data_migration",
        "statistics": migration.migration_stats
    }
    
    with open("simple_data_migration_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print("Migration completed! Check simple_data_migration_report.json for details.")

if __name__ == "__main__":
    asyncio.run(main())
