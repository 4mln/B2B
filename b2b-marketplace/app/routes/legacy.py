# app/routes/legacy.py
"""
Legacy Route Adapters
Provides backward compatibility for existing Seller/Buyer endpoints during migration.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session as get_db
from app.core.legacy_adapter import (
    get_legacy_seller_adapter, get_legacy_buyer_adapter, 
    LegacySellerAdapter, LegacyBuyerAdapter
)
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/legacy", tags=["Legacy Compatibility"])

# Legacy Seller Routes
@router.get("/sellers/{seller_id}", deprecated=True)
async def get_legacy_seller(
    seller_id: int,
    db: AsyncSession = Depends(get_db),
    adapter: LegacySellerAdapter = Depends(get_legacy_seller_adapter)
):
    """Get seller by ID (legacy endpoint)"""
    if not getattr(settings, 'LEGACY_MODE', True):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Legacy endpoints are disabled. Please use new user endpoints."
        )
    
    seller_data = await adapter.get_seller_by_id(seller_id)
    if not seller_data:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    logger.warning(f"DEPRECATED: Legacy seller endpoint used for seller_id {seller_id}")
    return seller_data

@router.get("/sellers/{seller_id}/products", deprecated=True)
async def get_legacy_seller_products(
    seller_id: int,
    db: AsyncSession = Depends(get_db),
    adapter: LegacySellerAdapter = Depends(get_legacy_seller_adapter)
):
    """Get seller products (legacy endpoint)"""
    if not getattr(settings, 'LEGACY_MODE', True):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Legacy endpoints are disabled. Please use new user endpoints."
        )
    
    products = await adapter.get_seller_products(seller_id)
    
    logger.warning(f"DEPRECATED: Legacy seller products endpoint used for seller_id {seller_id}")
    return {"products": products}

@router.get("/sellers", deprecated=True)
async def list_legacy_sellers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    adapter: LegacySellerAdapter = Depends(get_legacy_seller_adapter)
):
    """List sellers (legacy endpoint)"""
    if not getattr(settings, 'LEGACY_MODE', True):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Legacy endpoints are disabled. Please use new user endpoints."
        )
    
    # Get all users with seller badge
    from sqlalchemy import select
    from app.models.user import User
    
    result = await db.execute(
        select(User).where(User.badge == "seller").offset(skip).limit(limit)
    )
    users = result.scalars().all()
    
    sellers = []
    for user in users:
        # Get legacy seller ID from mapping
        mapping_result = await db.execute(
            select("legacy_id").select_from("legacy_mapping")
            .where("new_user_id = :user_id AND legacy_table = 'sellers'"),
            {"user_id": str(user.id)}
        )
        mapping = mapping_result.fetchone()
        
        if mapping:
            seller_data = await adapter.get_seller_by_id(mapping[0])
            if seller_data:
                sellers.append(seller_data)
    
    logger.warning("DEPRECATED: Legacy sellers list endpoint used")
    return {"sellers": sellers}

# Legacy Buyer Routes
@router.get("/buyers/{buyer_id}", deprecated=True)
async def get_legacy_buyer(
    buyer_id: int,
    db: AsyncSession = Depends(get_db),
    adapter: LegacyBuyerAdapter = Depends(get_legacy_buyer_adapter)
):
    """Get buyer by ID (legacy endpoint)"""
    if not getattr(settings, 'LEGACY_MODE', True):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Legacy endpoints are disabled. Please use new user endpoints."
        )
    
    buyer_data = await adapter.get_buyer_by_id(buyer_id)
    if not buyer_data:
        raise HTTPException(status_code=404, detail="Buyer not found")
    
    logger.warning(f"DEPRECATED: Legacy buyer endpoint used for buyer_id {buyer_id}")
    return buyer_data

@router.get("/buyers/{buyer_id}/orders", deprecated=True)
async def get_legacy_buyer_orders(
    buyer_id: int,
    db: AsyncSession = Depends(get_db),
    adapter: LegacyBuyerAdapter = Depends(get_legacy_buyer_adapter)
):
    """Get buyer orders (legacy endpoint)"""
    if not getattr(settings, 'LEGACY_MODE', True):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Legacy endpoints are disabled. Please use new user endpoints."
        )
    
    orders = await adapter.get_buyer_orders(buyer_id)
    
    logger.warning(f"DEPRECATED: Legacy buyer orders endpoint used for buyer_id {buyer_id}")
    return {"orders": orders}

@router.get("/buyers", deprecated=True)
async def list_legacy_buyers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    adapter: LegacyBuyerAdapter = Depends(get_legacy_buyer_adapter)
):
    """List buyers (legacy endpoint)"""
    if not getattr(settings, 'LEGACY_MODE', True):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Legacy endpoints are disabled. Please use new user endpoints."
        )
    
    # Get all users with buyer badge
    from sqlalchemy import select
    from app.models.user import User
    
    result = await db.execute(
        select(User).where(User.badge == "buyer").offset(skip).limit(limit)
    )
    users = result.scalars().all()
    
    buyers = []
    for user in users:
        # Get legacy buyer ID from mapping
        mapping_result = await db.execute(
            select("legacy_id").select_from("legacy_mapping")
            .where("new_user_id = :user_id AND legacy_table = 'buyers'"),
            {"user_id": str(user.id)}
        )
        mapping = mapping_result.fetchone()
        
        if mapping:
            buyer_data = await adapter.get_buyer_by_id(mapping[0])
            if buyer_data:
                buyers.append(buyer_data)
    
    logger.warning("DEPRECATED: Legacy buyers list endpoint used")
    return {"buyers": buyers}

# Legacy User Routes (for existing user endpoints)
@router.get("/users/{user_id}", deprecated=True)
async def get_legacy_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get user by legacy ID (legacy endpoint)"""
    if not getattr(settings, 'LEGACY_MODE', True):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Legacy endpoints are disabled. Please use new user endpoints."
        )
    
    from app.core.legacy_adapter import LegacyAdapter
    adapter = LegacyAdapter(db)
    
    user = await adapter.resolve_legacy_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.warning(f"DEPRECATED: Legacy user endpoint used for user_id {user_id}")
    return user

# Migration status endpoint
@router.get("/migration/status")
async def get_migration_status(db: AsyncSession = Depends(get_db)):
    """Get migration status and statistics"""
    from app.core.legacy_adapter import LegacyAdapter
    adapter = LegacyAdapter(db)
    
    stats = await adapter.get_legacy_mapping_stats()
    return {
        "legacy_mode_enabled": getattr(settings, 'LEGACY_MODE', True),
        "migration_stats": stats,
        "recommendations": [
            "Test all endpoints with migrated data",
            "Update frontend to use new user endpoints",
            "Set LEGACY_MODE = False after frontend migration"
        ]
    }
