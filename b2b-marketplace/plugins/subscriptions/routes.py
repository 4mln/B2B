from fastapi import APIRouter, Depends, HTTPException

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

from app.core.db import get_session

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

from plugins.subscriptions.crud import create_subscription_plan, list_subscription_plans, assign_user_subscription, list_user_subscriptions

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

from plugins.subscriptions.schemas import SubscriptionPlanCreate, SubscriptionPlanOut, UserSubscriptionCreate, UserSubscriptionOut

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

from pydantic import BaseModel

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

from typing import Optional

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

from sqlalchemy import update

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

from plugins.subscriptions.models import SubscriptionPlan

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

@router.post("/plans", response_model=SubscriptionPlanOut)
async def create_plan(plan: SubscriptionPlanCreate, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    return await create_subscription_plan(db, plan)

@router.get("/plans", response_model=List[SubscriptionPlanOut])
async def get_plans(db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    return await list_subscription_plans(db)

@router.post("/assign", response_model=UserSubscriptionOut)
async def assign_subscription(data: UserSubscriptionCreate, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    try:
        return await assign_user_subscription(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{user_id}", response_model=List[UserSubscriptionOut])
async def get_user_subscriptions(user_id: int, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    return await list_user_subscriptions(db, user_id)


class SubscriptionPlanPatch(BaseModel):
    price: Optional[float] = None
    duration_days: Optional[int] = None
    max_users: Optional[int] = None
    max_products: Optional[int] = None
    max_rfqs: Optional[int] = None
    boost_multiplier: Optional[float] = None


@router.patch("/plans/{plan_id}", response_model=SubscriptionPlanOut)
async def patch_plan(plan_id: int, payload: SubscriptionPlanPatch, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    values = {k: v for k, v in payload.dict(exclude_unset=True).items()}
    if not values:
        plan = await db.get(SubscriptionPlan, plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        return plan
    await db.execute(update(SubscriptionPlan).where(SubscriptionPlan.id == plan_id).values(**values))
    await db.commit()
    plan = await db.get(SubscriptionPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan
