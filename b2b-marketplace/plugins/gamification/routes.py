# plugins/gamification/routes.py

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

from sqlalchemy import select

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


from plugins.gamification.models import Badge, UserPoints

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

from plugins.gamification.schemas import BadgeOut, AwardPoints, AssignBadge

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

from plugins.user.models import User

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


router = APIRouter(prefix="/gamification", tags=["Gamification"])


# -----------------------------
# Award points to a user
# -----------------------------
@router.post("/points", response_model=dict, operation_id="gamification_award_points")
async def award_points_to_user(
    data: AwardPoints,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)
):
    user = await db.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_points = await db.get(UserPoints, data.user_id)
    if not user_points:
        user_points = UserPoints(user_id=data.user_id, points=0)
        db.add(user_points)

    user_points.points += data.points
    await db.commit()
    await db.refresh(user_points)

    return {"user_id": user_points.user_id, "points": user_points.points}


# -----------------------------
# Assign badge to a user
# -----------------------------
@router.post("/badges", response_model=BadgeOut, operation_id="gamification_assign_badge")
async def assign_badge_to_user(
    data: AssignBadge,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)
):
    user = await db.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    badge = Badge(user_id=data.user_id, badge_type=data.badge_type)
    db.add(badge)
    await db.commit()
    await db.refresh(badge)

    return badge


# -----------------------------
# Get all badges for a user
# -----------------------------
@router.get("/badges/{user_id}", response_model=List[BadgeOut], operation_id="gamification_get_badges")
async def get_user_badges(
    user_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)
):
    result = await db.execute(
        select(Badge).where(Badge.user_id == user_id)
    )
    return result.scalars().all()


# -----------------------------
# Get user points
# -----------------------------
@router.get("/points/{user_id}", response_model=dict, operation_id="gamification_get_points")
async def get_user_points(
    user_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)
):
    user_points = await db.get(UserPoints, user_id)
    if not user_points:
        return {"user_id": user_id, "points": 0}

    return {"user_id": user_id, "points": user_points.points}