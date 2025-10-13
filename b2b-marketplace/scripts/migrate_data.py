#!/usr/bin/env python3
"""
Data Migration Script for Seller/Buyer to User Model
Migrates existing data while preserving references and creating mapping table.
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

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, text
from sqlalchemy.orm import selectinload

from app.db.session import get_session
from app.models.user import User
from app.core.security import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataMigration:
    def __init__(self):
        self.migration_stats = {
            "users_migrated": 0,
            "sellers_migrated": 0,
            "buyers_migrated": 0,
            "conflicts_resolved": 0,
            "errors": []
        }
        self.conflict_log = []
        
    async def migrate_all_data(self, db: AsyncSession):
        """Main migration function"""
        logger.info("Starting data migration...")
        
        try:
            # Step 1: Migrate existing users
            await self.migrate_existing_users(db)
            
            # Step 2: Migrate sellers
            await self.migrate_sellers(db)
            
            # Step 3: Migrate buyers
            await self.migrate_buyers(db)
            
            # Step 4: Update foreign key references
            await self.update_foreign_keys(db)
            
            # Step 5: Generate migration report
            await self.generate_migration_report()
            
            logger.info("Data migration completed successfully!")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            raise
    
    async def migrate_existing_users(self, db: AsyncSession):
        """Migrate existing users table to users_new"""
        logger.info("Migrating existing users...")
        
        # Get existing users
        result = await db.execute(select(text("*")).select_from(text("users")))
        existing_users = result.fetchall()
        
        for user_row in existing_users:
            try:
                # Create new user with mapped fields
                new_user_data = {
                    "id": uuid4(),
                    "unique_id": f"USR-{uuid4().hex[:12]}",
                    "mobile_number": user_row.phone or "",
                    "guild_codes": [],
                    "name": user_row.username or "",
                    "last_name": user_row.username or "",
                    "national_id": user_row.username or "",
                    "inapp_wallet_funds": 0,
                    "profile_picture": user_row.business_photo or "",
                    "badge": "buyer",  # Default for existing users
                    "rating": 0,
                    "is_active": user_row.is_active if hasattr(user_row, 'is_active') else True,
                    "last_login": user_row.last_login,
                    "otp_code": user_row.otp_code,
                    "otp_expiry": user_row.otp_expiry,
                    "kyc_status": user_row.kyc_status or "pending",
                    "kyc_verified_at": user_row.kyc_verified_at,
                    "totp_secret": user_row.totp_secret,
                    "two_factor_enabled": user_row.two_factor_enabled or False,
                    "profile_completion_percentage": user_row.profile_completion_percentage or 0,
                    "privacy_settings": user_row.privacy_settings or {},
                    "username": user_row.username,
                    "hashed_password": user_row.hashed_password,
                    "business_name": user_row.business_name or "",
                    "business_description": user_row.business_description or "",
                    "bank_accounts": user_row.bank_accounts or [],
                    "addresses": user_row.business_addresses or [],
                    "business_phones": user_row.business_phones or [],
                    "email": user_row.email,
                    "website": user_row.website or "",
                    "whatsapp_id": user_row.phone or "",
                    "telegram_id": user_row.phone or "",
                    "created_at": user_row.created_at or datetime.utcnow(),
                    "updated_at": user_row.updated_at or datetime.utcnow()
                }
                
                # Insert new user
                await db.execute(
                    insert(text("users_new")).values(**new_user_data)
                )
                
                # Create legacy mapping
                await self.create_legacy_mapping(
                    db, "users", user_row.id, new_user_data["id"]
                )
                
                self.migration_stats["users_migrated"] += 1
                
            except Exception as e:
                logger.error(f"Error migrating user {user_row.id}: {e}")
                self.migration_stats["errors"].append(f"User {user_row.id}: {e}")
        
        await db.commit()
        logger.info(f"Migrated {self.migration_stats['users_migrated']} users")
    
    async def migrate_sellers(self, db: AsyncSession):
        """Migrate sellers to users_new"""
        logger.info("Migrating sellers...")
        
        # Get existing sellers
        result = await db.execute(select(text("*")).select_from(text("sellers")))
        existing_sellers = result.fetchall()
        
        for seller_row in existing_sellers:
            try:
                # Check for conflicts (email/username already exists)
                conflict_resolved, conflict_details = await self.resolve_conflicts(
                    db, seller_row.email, seller_row.name
                )
                
                # Create new user data
                new_user_data = {
                    "id": uuid4(),
                    "unique_id": f"USR-{uuid4().hex[:12]}",
                    "mobile_number": seller_row.phone or "",
                    "guild_codes": [],
                    "name": seller_row.name or "",
                    "last_name": seller_row.name or "",
                    "national_id": seller_row.name or "",
                    "inapp_wallet_funds": 0,
                    "profile_picture": "",
                    "badge": "seller",
                    "rating": 0,
                    "is_active": True,
                    "last_login": datetime.utcnow(),
                    "otp_code": None,
                    "otp_expiry": None,
                    "kyc_status": "pending",
                    "kyc_verified_at": None,
                    "totp_secret": None,
                    "two_factor_enabled": False,
                    "profile_completion_percentage": 0,
                    "privacy_settings": {},
                    "username": conflict_details.get("username", f"seller_{seller_row.id}"),
                    "hashed_password": "$2b$12$dummy.hash.for.sellers",
                    "business_name": seller_row.name or "",
                    "business_description": "",
                    "bank_accounts": [],
                    "addresses": [],
                    "business_phones": [],
                    "email": conflict_details.get("email", f"seller_{seller_row.id}@example.com"),
                    "website": "",
                    "whatsapp_id": seller_row.phone or "",
                    "telegram_id": seller_row.phone or "",
                    "created_at": seller_row.created_at or datetime.utcnow(),
                    "updated_at": seller_row.updated_at or datetime.utcnow()
                }
                
                # Insert new user
                await db.execute(
                    insert(text("users_new")).values(**new_user_data)
                )
                
                # Create legacy mapping
                await self.create_legacy_mapping(
                    db, "sellers", seller_row.id, new_user_data["id"],
                    conflict_resolved, conflict_details
                )
                
                self.migration_stats["sellers_migrated"] += 1
                if conflict_resolved:
                    self.migration_stats["conflicts_resolved"] += 1
                
            except Exception as e:
                logger.error(f"Error migrating seller {seller_row.id}: {e}")
                self.migration_stats["errors"].append(f"Seller {seller_row.id}: {e}")
        
        await db.commit()
        logger.info(f"Migrated {self.migration_stats['sellers_migrated']} sellers")
    
    async def migrate_buyers(self, db: AsyncSession):
        """Migrate buyers to users_new"""
        logger.info("Migrating buyers...")
        
        # Get existing buyers
        result = await db.execute(select(text("*")).select_from(text("buyers")))
        existing_buyers = result.fetchall()
        
        for buyer_row in existing_buyers:
            try:
                # Check for conflicts
                email = f"buyer_{buyer_row.id}@example.com"
                conflict_resolved, conflict_details = await self.resolve_conflicts(
                    db, email, buyer_row.full_name
                )
                
                # Create new user data
                new_user_data = {
                    "id": uuid4(),
                    "unique_id": f"USR-{uuid4().hex[:12]}",
                    "mobile_number": buyer_row.phone or "",
                    "guild_codes": [],
                    "name": buyer_row.full_name or "",
                    "last_name": buyer_row.full_name or "",
                    "national_id": buyer_row.full_name or "",
                    "inapp_wallet_funds": 0,
                    "profile_picture": "",
                    "badge": "buyer",
                    "rating": 0,
                    "is_active": True,
                    "last_login": datetime.utcnow(),
                    "otp_code": None,
                    "otp_expiry": None,
                    "kyc_status": "pending",
                    "kyc_verified_at": None,
                    "totp_secret": None,
                    "two_factor_enabled": False,
                    "profile_completion_percentage": 0,
                    "privacy_settings": {},
                    "username": conflict_details.get("username", f"buyer_{buyer_row.id}"),
                    "hashed_password": "$2b$12$dummy.hash.for.buyers",
                    "business_name": buyer_row.full_name or "",
                    "business_description": "",
                    "bank_accounts": [],
                    "addresses": [buyer_row.address] if buyer_row.address else [],
                    "business_phones": [],
                    "email": conflict_details.get("email", email),
                    "website": "",
                    "whatsapp_id": buyer_row.phone or "",
                    "telegram_id": buyer_row.phone or "",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                # Insert new user
                await db.execute(
                    insert(text("users_new")).values(**new_user_data)
                )
                
                # Create legacy mapping
                await self.create_legacy_mapping(
                    db, "buyers", buyer_row.id, new_user_data["id"],
                    conflict_resolved, conflict_details
                )
                
                self.migration_stats["buyers_migrated"] += 1
                if conflict_resolved:
                    self.migration_stats["conflicts_resolved"] += 1
                
            except Exception as e:
                logger.error(f"Error migrating buyer {buyer_row.id}: {e}")
                self.migration_stats["errors"].append(f"Buyer {buyer_row.id}: {e}")
        
        await db.commit()
        logger.info(f"Migrated {self.migration_stats['buyers_migrated']} buyers")
    
    async def resolve_conflicts(self, db: AsyncSession, email: str, username: str) -> Tuple[bool, Dict]:
        """Resolve conflicts for email/username duplicates"""
        conflict_details = {"email": email, "username": username}
        conflict_resolved = False
        
        # Check for email conflicts
        result = await db.execute(
            select(text("email")).select_from(text("users_new")).where(text("email = :email")),
            {"email": email}
        )
        if result.fetchone():
            conflict_details["email"] = f"{email.split('@')[0]}_{uuid4().hex[:8]}@{email.split('@')[1]}"
            conflict_resolved = True
        
        # Check for username conflicts
        result = await db.execute(
            select(text("username")).select_from(text("users_new")).where(text("username = :username")),
            {"username": username}
        )
        if result.fetchone():
            conflict_details["username"] = f"{username}_{uuid4().hex[:8]}"
            conflict_resolved = True
        
        return conflict_resolved, conflict_details
    
    async def create_legacy_mapping(self, db: AsyncSession, legacy_table: str, 
                                   legacy_id: int, new_user_id: str, 
                                   conflict_resolved: bool = False, 
                                   conflict_details: Dict = None):
        """Create legacy mapping entry"""
        mapping_data = {
            "legacy_table": legacy_table,
            "legacy_id": legacy_id,
            "new_user_id": new_user_id,
            "migration_timestamp": datetime.utcnow(),
            "conflict_resolved": conflict_resolved,
            "conflict_details": conflict_details or {}
        }
        
        await db.execute(
            insert(text("legacy_mapping")).values(**mapping_data)
        )
    
    async def update_foreign_keys(self, db: AsyncSession):
        """Update foreign key references in other tables"""
        logger.info("Updating foreign key references...")
        
        # List of tables that reference sellers/buyers
        foreign_key_tables = [
            ("orders", "seller_id", "sellers"),
            ("orders", "buyer_id", "buyers"),
            ("products", "seller_id", "sellers"),
            ("ratings", "seller_id", "sellers"),
            ("ratings", "buyer_id", "buyers"),
        ]
        
        for table_name, fk_column, legacy_table in foreign_key_tables:
            try:
                # Get mapping for this legacy table
                result = await db.execute(
                    select(text("legacy_id, new_user_id")).select_from(text("legacy_mapping"))
                    .where(text("legacy_table = :legacy_table")),
                    {"legacy_table": legacy_table}
                )
                mappings = result.fetchall()
                
                # Update foreign keys
                for legacy_id, new_user_id in mappings:
                    await db.execute(
                        text(f"UPDATE {table_name} SET {fk_column} = :new_user_id WHERE {fk_column} = :legacy_id"),
                        {"new_user_id": new_user_id, "legacy_id": legacy_id}
                    )
                
                logger.info(f"Updated foreign keys in {table_name}")
                
            except Exception as e:
                logger.warning(f"Could not update foreign keys in {table_name}: {e}")
        
        await db.commit()
    
    async def generate_migration_report(self):
        """Generate migration report"""
        report = {
            "migration_timestamp": datetime.utcnow().isoformat(),
            "statistics": self.migration_stats,
            "conflict_log": self.conflict_log,
            "recommendations": [
                "Review conflict resolutions before proceeding",
                "Test all endpoints with migrated data",
                "Update frontend to use new user endpoints",
                "Set LEGACY_MODE = False after testing"
            ]
        }
        
        with open("migration_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        logger.info("Migration report saved to migration_report.json")

async def run_migration():
    """Run the data migration"""
    async with get_session() as db:
        migration = DataMigration()
        await migration.migrate_all_data(db)

if __name__ == "__main__":
    asyncio.run(run_migration())
