# app/core/legacy_adapter.py
"""
Legacy Adapter Layer for Seller/Buyer to User Model Migration
Provides compatibility layer to keep old endpoints working during migration.
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)

class LegacyAdapter:
    """Adapter to resolve legacy Seller/Buyer references to new User model"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.legacy_mode = getattr(settings, 'LEGACY_MODE', True)
    
    async def resolve_legacy_seller(self, legacy_seller_id: int) -> Optional[User]:
        """Resolve legacy seller ID to new User object"""
        if not self.legacy_mode:
            logger.warning("LEGACY_MODE is disabled, but legacy seller resolution was attempted")
            return None
        
        try:
            # Get mapping from legacy_mapping table
            result = await self.db.execute(
                select(text("new_user_id")).select_from(text("legacy_mapping"))
                .where(text("legacy_table = 'sellers' AND legacy_id = :legacy_id")),
                {"legacy_id": legacy_seller_id}
            )
            mapping = result.fetchone()
            
            if not mapping:
                logger.warning(f"No mapping found for legacy seller ID {legacy_seller_id}")
                return None
            
            # Get the new User object
            result = await self.db.execute(
                select(User).where(User.id == mapping[0])
            )
            user = result.scalar_one_or_none()
            
            if user:
                logger.info(f"Resolved legacy seller {legacy_seller_id} to user {user.unique_id}")
            
            return user
            
        except Exception as e:
            logger.error(f"Error resolving legacy seller {legacy_seller_id}: {e}")
            return None
    
    async def resolve_legacy_buyer(self, legacy_buyer_id: int) -> Optional[User]:
        """Resolve legacy buyer ID to new User object"""
        if not self.legacy_mode:
            logger.warning("LEGACY_MODE is disabled, but legacy buyer resolution was attempted")
            return None
        
        try:
            # Get mapping from legacy_mapping table
            result = await self.db.execute(
                select(text("new_user_id")).select_from(text("legacy_mapping"))
                .where(text("legacy_table = 'buyers' AND legacy_id = :legacy_id")),
                {"legacy_id": legacy_buyer_id}
            )
            mapping = result.fetchone()
            
            if not mapping:
                logger.warning(f"No mapping found for legacy buyer ID {legacy_buyer_id}")
                return None
            
            # Get the new User object
            result = await self.db.execute(
                select(User).where(User.id == mapping[0])
            )
            user = result.scalar_one_or_none()
            
            if user:
                logger.info(f"Resolved legacy buyer {legacy_buyer_id} to user {user.unique_id}")
            
            return user
            
        except Exception as e:
            logger.error(f"Error resolving legacy buyer {legacy_buyer_id}: {e}")
            return None
    
    async def resolve_legacy_user(self, legacy_user_id: int) -> Optional[User]:
        """Resolve legacy user ID to new User object"""
        if not self.legacy_mode:
            logger.warning("LEGACY_MODE is disabled, but legacy user resolution was attempted")
            return None
        
        try:
            # Get mapping from legacy_mapping table
            result = await self.db.execute(
                select(text("new_user_id")).select_from(text("legacy_mapping"))
                .where(text("legacy_table = 'users' AND legacy_id = :legacy_id")),
                {"legacy_id": legacy_user_id}
            )
            mapping = result.fetchone()
            
            if not mapping:
                logger.warning(f"No mapping found for legacy user ID {legacy_user_id}")
                return None
            
            # Get the new User object
            result = await self.db.execute(
                select(User).where(User.id == mapping[0])
            )
            user = result.scalar_one_or_none()
            
            if user:
                logger.info(f"Resolved legacy user {legacy_user_id} to user {user.unique_id}")
            
            return user
            
        except Exception as e:
            logger.error(f"Error resolving legacy user {legacy_user_id}: {e}")
            return None
    
    async def get_legacy_mapping_stats(self) -> Dict[str, Any]:
        """Get statistics about legacy mappings"""
        try:
            result = await self.db.execute(
                select(text("legacy_table, COUNT(*) as count"))
                .select_from(text("legacy_mapping"))
                .group_by(text("legacy_table"))
            )
            stats = {row[0]: row[1] for row in result.fetchall()}
            
            # Add conflict stats
            result = await self.db.execute(
                select(text("COUNT(*) as conflict_count"))
                .select_from(text("legacy_mapping"))
                .where(text("conflict_resolved = true"))
            )
            conflict_count = result.scalar()
            
            return {
                "mappings_by_table": stats,
                "total_conflicts": conflict_count,
                "legacy_mode_enabled": self.legacy_mode
            }
            
        except Exception as e:
            logger.error(f"Error getting mapping stats: {e}")
            return {"error": str(e)}
    
    def log_deprecated_usage(self, endpoint: str, legacy_id: int, legacy_type: str):
        """Log usage of deprecated endpoints"""
        logger.warning(f"DEPRECATED: {endpoint} called with legacy {legacy_type} ID {legacy_id}")
        
        # In production, you might want to send this to metrics/analytics
        # For now, just log it
        if hasattr(settings, 'METRICS_ENABLED') and settings.METRICS_ENABLED:
            # Send to metrics service
            pass

class LegacySellerAdapter:
    """Adapter for legacy seller endpoints"""
    
    def __init__(self, db: AsyncSession):
        self.adapter = LegacyAdapter(db)
        self.db = db
    
    async def get_seller_by_id(self, seller_id: int) -> Optional[Dict[str, Any]]:
        """Get seller data in legacy format"""
        user = await self.adapter.resolve_legacy_seller(seller_id)
        if not user:
            return None
        
        # Convert User to legacy seller format
        return {
            "id": seller_id,  # Keep original ID for compatibility
            "name": user.business_name,
            "email": user.email,
            "phone": user.mobile_number,
            "subscription": "basic",  # Default value
            "user_id": str(user.id),
            "store_url": f"/stores/{user.unique_id}",
            "store_policies": {},
            "is_featured": False,
            "is_verified": user.kyc_status == "business_verified",
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    
    async def get_seller_products(self, seller_id: int) -> List[Dict[str, Any]]:
        """Get seller products (mapped to offers)"""
        user = await self.adapter.resolve_legacy_seller(seller_id)
        if not user:
            return []
        
        # Get offers for this user
        result = await self.db.execute(
            select(text("*")).select_from(text("offers"))
            .where(text("user_id = :user_id")),
            {"user_id": str(user.id)}
        )
        offers = result.fetchall()
        
        # Convert offers to legacy product format
        products = []
        for offer in offers:
            products.append({
                "id": offer.id,
                "seller_id": seller_id,  # Keep original seller_id
                "name": offer.title,
                "description": offer.description,
                "price": float(offer.price),
                "category": offer.category,
                "is_active": offer.is_active,
                "created_at": offer.created_at,
                "updated_at": offer.updated_at
            })
        
        return products

class LegacyBuyerAdapter:
    """Adapter for legacy buyer endpoints"""
    
    def __init__(self, db: AsyncSession):
        self.adapter = LegacyAdapter(db)
        self.db = db
    
    async def get_buyer_by_id(self, buyer_id: int) -> Optional[Dict[str, Any]]:
        """Get buyer data in legacy format"""
        user = await self.adapter.resolve_legacy_buyer(buyer_id)
        if not user:
            return None
        
        # Convert User to legacy buyer format
        return {
            "id": buyer_id,  # Keep original ID for compatibility
            "full_name": f"{user.name} {user.last_name}",
            "phone": user.mobile_number,
            "address": user.addresses[0] if user.addresses else "",
            "user_id": str(user.id)
        }
    
    async def get_buyer_orders(self, buyer_id: int) -> List[Dict[str, Any]]:
        """Get buyer orders"""
        user = await self.adapter.resolve_legacy_buyer(buyer_id)
        if not user:
            return []
        
        # Get orders for this user
        result = await self.db.execute(
            select(text("*")).select_from(text("orders"))
            .where(text("buyer_id = :user_id")),
            {"user_id": str(user.id)}
        )
        orders = result.fetchall()
        
        # Convert orders to legacy format
        legacy_orders = []
        for order in orders:
            legacy_orders.append({
                "id": order.id,
                "buyer_id": buyer_id,  # Keep original buyer_id
                "seller_id": order.seller_id,  # This will be resolved by adapter
                "status": order.status,
                "total_amount": float(order.total_amount),
                "created_at": order.created_at,
                "updated_at": order.updated_at
            })
        
        return legacy_orders

# Standalone functions for backward compatibility
async def resolve_legacy_user(legacy_user_id: int, db: AsyncSession) -> Optional[User]:
    """Standalone function to resolve legacy user ID to new User object"""
    adapter = LegacyAdapter(db)
    return await adapter.resolve_legacy_user(legacy_user_id)

async def resolve_legacy_seller(legacy_seller_id: int, db: AsyncSession) -> Optional[User]:
    """Standalone function to resolve legacy seller ID to new User object"""
    adapter = LegacyAdapter(db)
    return await adapter.resolve_legacy_seller(legacy_seller_id)

async def resolve_legacy_buyer(legacy_buyer_id: int, db: AsyncSession) -> Optional[User]:
    """Standalone function to resolve legacy buyer ID to new User object"""
    adapter = LegacyAdapter(db)
    return await adapter.resolve_legacy_buyer(legacy_buyer_id)

# Dependency injection functions
async def get_legacy_adapter(db: AsyncSession) -> LegacyAdapter:
    """Get legacy adapter instance"""
    return LegacyAdapter(db)

async def get_legacy_seller_adapter(db: AsyncSession) -> LegacySellerAdapter:
    """Get legacy seller adapter instance"""
    return LegacySellerAdapter(db)

async def get_legacy_buyer_adapter(db: AsyncSession) -> LegacyBuyerAdapter:
    """Get legacy buyer adapter instance"""
    return LegacyBuyerAdapter(db)
