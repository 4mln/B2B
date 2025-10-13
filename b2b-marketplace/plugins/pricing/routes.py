from fastapi import APIRouter, Depends, HTTPException, Query

def resolve_user_id(user):
    """Resolve user ID for both legacy and new user models"""
    if hasattr(user, 'id'):
        # Check if it's a new user ID (UUID format)
        if str(user.id).startswith('USR-'):
            return user.id, user.id
        else:
            # Legacy user ID, need to resolve new user ID
            # This would typically query the legacy_mapping table
            # For now, return the legacy ID and None for new ID
            return user.id, None
    return None, None

from app.core.legacy_adapter import resolve_legacy_user

def resolve_user_id(user):
    """Resolve user ID for both legacy and new user models"""
    if hasattr(user, 'id'):
        # Check if it's a new user ID (UUID format)
        if str(user.id).startswith('USR-'):
            return user.id, user.id
        else:
            # Legacy user ID, need to resolve new user ID
            # This would typically query the legacy_mapping table
            # For now, return the legacy ID and None for new ID
            return user.id, None
    return None, None

from sqlalchemy.ext.asyncio import AsyncSession

def resolve_user_id(user):
    """Resolve user ID for both legacy and new user models"""
    if hasattr(user, 'id'):
        # Check if it's a new user ID (UUID format)
        if str(user.id).startswith('USR-'):
            return user.id, user.id
        else:
            # Legacy user ID, need to resolve new user ID
            # This would typically query the legacy_mapping table
            # For now, return the legacy ID and None for new ID
            return user.id, None
    return None, None

from typing import List

def resolve_user_id(user):
    """Resolve user ID for both legacy and new user models"""
    if hasattr(user, 'id'):
        # Check if it's a new user ID (UUID format)
        if str(user.id).startswith('USR-'):
            return user.id, user.id
        else:
            # Legacy user ID, need to resolve new user ID
            # This would typically query the legacy_mapping table
            # For now, return the legacy ID and None for new ID
            return user.id, None
    return None, None


from plugins.pricing.schemas import Price, PriceResponse

def resolve_user_id(user):
    """Resolve user ID for both legacy and new user models"""
    if hasattr(user, 'id'):
        # Check if it's a new user ID (UUID format)
        if str(user.id).startswith('USR-'):
            return user.id, user.id
        else:
            # Legacy user ID, need to resolve new user ID
            # This would typically query the legacy_mapping table
            # For now, return the legacy ID and None for new ID
            return user.id, None
    return None, None


router = APIRouter()

# -----------------------------
# Health check
# -----------------------------
@router.get("/health", summary="Health check for pricing plugin")
async def health():
    return {"ok": True, "plugin": "pricing"}

# -----------------------------
# Fetch product pricing
# -----------------------------
@router.get("/{product_id}", response_model=PriceResponse, summary="Get product pricing")
async def get_product_price(
    product_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session),
    include_discounts: bool = Query(True, description="Include discount calculations")
):
    """
    Fetch the pricing info for a product. Discounts applied if enabled.
    """
    # Placeholder: Replace with actual DB query
    base_price = 100.0  # Example
    discount = 0.0

    if include_discounts:
        discount = 10.0  # Example discount, replace with dynamic calculation

    final_price = base_price - discount

    price_data = Price(
        product_id=product_id,
        base_price=base_price,
        discount=discount,
        final_price=final_price,
        currency="USD"
    )

    return PriceResponse(prices=[price_data])