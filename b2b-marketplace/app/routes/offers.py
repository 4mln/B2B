# app/routes/offers.py
"""
Offers Management (replacing seller offers)
Handles product offers created by users with seller capabilities.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete
from datetime import datetime
from decimal import Decimal

from app.db.session import get_session as get_db
from app.core.auth import get_current_user_sync as get_current_user
from app.core.plugin_capabilities import get_capability_manager, CapabilityManager
from app.models.user import User
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/offers", tags=["Offers"])

# Pydantic schemas
class OfferCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD")
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = Field(None, max_items=10)

class OfferUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    price: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=10)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = Field(None, max_items=10)
    is_active: Optional[bool] = None

class OfferOut(BaseModel):
    id: int
    user_id: str
    title: str
    description: str
    price: Decimal
    currency: str
    category: Optional[str]
    tags: Optional[List[str]]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Offer endpoints
@router.post("/", response_model=OfferOut)
async def create_offer(
    offer_data: OfferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    capability_manager: CapabilityManager = Depends(get_capability_manager)
):
    """Create a new offer (requires seller capabilities)"""
    
    # Check if user has required capabilities
    if not await capability_manager.has_capability(current_user, "can_post_offers"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Seller capabilities required."
        )
    
    try:
        # Create offer
        offer_values = {
            "user_id": str(current_user.id),
            "title": offer_data.title,
            "description": offer_data.description,
            "price": offer_data.price,
            "currency": offer_data.currency,
            "category": offer_data.category,
            "tags": offer_data.tags or [],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.execute(
            insert("offers").values(**offer_values).returning("*")
        )
        offer = result.fetchone()
        
        await db.commit()
        
        logger.info(f"Created offer {offer.id} for user {current_user.unique_id}")
        return OfferOut.model_validate(offer)
        
    except Exception as e:
        logger.error(f"Error creating offer: {e}")
        raise HTTPException(status_code=500, detail="Failed to create offer")

@router.get("/", response_model=List[OfferOut])
async def list_offers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List active offers with optional filtering"""
    
    try:
        query = select("*").select_from("offers").where("is_active = true")
        
        if category:
            query = query.where("category = :category")
        
        if search:
            query = query.where("title ILIKE :search OR description ILIKE :search")
        
        query = query.offset(skip).limit(limit).order_by("created_at DESC")
        
        result = await db.execute(query, {
            "category": category,
            "search": f"%{search}%" if search else None
        })
        
        offers = result.fetchall()
        return [OfferOut.model_validate(offer) for offer in offers]
        
    except Exception as e:
        logger.error(f"Error listing offers: {e}")
        raise HTTPException(status_code=500, detail="Failed to list offers")

@router.get("/{offer_id}", response_model=OfferOut)
async def get_offer(
    offer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get offer by ID"""
    
    try:
        result = await db.execute(
            select("*").select_from("offers").where("id = :offer_id"),
            {"offer_id": offer_id}
        )
        offer = result.fetchone()
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        return OfferOut.model_validate(offer)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting offer {offer_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get offer")

@router.put("/{offer_id}", response_model=OfferOut)
async def update_offer(
    offer_id: int,
    offer_data: OfferUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    capability_manager: CapabilityManager = Depends(get_capability_manager)
):
    """Update offer (requires seller capabilities)"""
    
    # Check if user has required capabilities
    if not await capability_manager.has_capability(current_user, "can_post_offers"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Seller capabilities required."
        )
    
    try:
        # Check if offer exists and belongs to user
        result = await db.execute(
            select("*").select_from("offers").where("id = :offer_id AND user_id = :user_id"),
            {"offer_id": offer_id, "user_id": str(current_user.id)}
        )
        offer = result.fetchone()
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        # Update offer
        update_data = offer_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await db.execute(
            update("offers").where("id = :offer_id").values(**update_data),
            {"offer_id": offer_id}
        )
        
        await db.commit()
        
        # Get updated offer
        result = await db.execute(
            select("*").select_from("offers").where("id = :offer_id"),
            {"offer_id": offer_id}
        )
        updated_offer = result.fetchone()
        
        logger.info(f"Updated offer {offer_id} for user {current_user.unique_id}")
        return OfferOut.model_validate(updated_offer)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating offer {offer_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update offer")

@router.delete("/{offer_id}")
async def delete_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    capability_manager: CapabilityManager = Depends(get_capability_manager)
):
    """Delete offer (requires seller capabilities)"""
    
    # Check if user has required capabilities
    if not await capability_manager.has_capability(current_user, "can_post_offers"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Seller capabilities required."
        )
    
    try:
        # Check if offer exists and belongs to user
        result = await db.execute(
            select("*").select_from("offers").where("id = :offer_id AND user_id = :user_id"),
            {"offer_id": offer_id, "user_id": str(current_user.id)}
        )
        offer = result.fetchone()
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        # Delete offer
        await db.execute(
            delete("offers").where("id = :offer_id"),
            {"offer_id": offer_id}
        )
        
        await db.commit()
        
        logger.info(f"Deleted offer {offer_id} for user {current_user.unique_id}")
        return {"message": "Offer deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting offer {offer_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete offer")

@router.get("/user/{user_id}", response_model=List[OfferOut])
async def get_user_offers(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get offers by user ID"""
    
    try:
        result = await db.execute(
            select("*").select_from("offers")
            .where("user_id = :user_id")
            .offset(skip).limit(limit)
            .order_by("created_at DESC"),
            {"user_id": user_id}
        )
        
        offers = result.fetchall()
        return [OfferOut.model_validate(offer) for offer in offers]
        
    except Exception as e:
        logger.error(f"Error getting offers for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user offers")
