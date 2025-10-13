# app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime
import os
import shutil
from typing import Optional

from app.db.session import get_session as get_db
from app.core.auth import get_current_user_sync as get_current_user
from app.schemas.user import (
    UserProfileUpdateIn, UserPublicOut, UserPrivateOut, UserResponse
)
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

# -----------------------------
# Get user public profile
# -----------------------------
@router.get("/{unique_id}", response_model=UserPublicOut)
async def get_user_public_profile(
    unique_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get public user profile by unique_id"""
    
    result = await db.execute(
        select(User).where(User.unique_id == unique_id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(status_code=404, detail="User profile not available")
    
    return UserPublicOut.model_validate(user)

# -----------------------------
# Get current user private profile
# -----------------------------
@router.get("/me/profile", response_model=UserPrivateOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's private profile information"""
    return UserPrivateOut.model_validate(current_user)

# -----------------------------
# Update user profile
# -----------------------------
@router.patch("/me/profile", response_model=UserPrivateOut)
async def update_my_profile(
    profile_update: UserProfileUpdateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Update current user's profile"""
    
    # Check if profile_picture is required after first login
    if current_user.profile_picture == "" and not profile_update.profile_picture:
        raise HTTPException(
            status_code=400,
            detail="Profile picture is required after first login"
        )
    
    # Prepare update data
    update_data = {}
    for field, value in profile_update.dict(exclude_unset=True).items():
        if value is not None:
            update_data[field] = value
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Calculate profile completion percentage
    completion_fields = [
        'profile_picture', 'business_name', 'business_description',
        'bank_accounts', 'addresses', 'business_phones', 'website',
        'whatsapp_id', 'telegram_id'
    ]
    
    completed_fields = 0
    for field in completion_fields:
        if field in update_data:
            if field in ['bank_accounts', 'addresses', 'business_phones']:
                if update_data[field] and len(update_data[field]) > 0:
                    completed_fields += 1
            else:
                if update_data[field] and str(update_data[field]).strip():
                    completed_fields += 1
        else:
            # Check existing value
            existing_value = getattr(current_user, field, None)
            if existing_value:
                if field in ['bank_accounts', 'addresses', 'business_phones']:
                    if existing_value and len(existing_value) > 0:
                        completed_fields += 1
                else:
                    if str(existing_value).strip():
                        completed_fields += 1
    
    completion_percentage = min(100, int((completed_fields / len(completion_fields)) * 100))
    update_data['profile_completion_percentage'] = completion_percentage
    update_data['updated_at'] = datetime.utcnow()
    
    # Update user profile
    await db.execute(
        update(User).where(User.id == current_user.id).values(**update_data)
    )
    await db.commit()
    
    # Refresh user data
    await db.refresh(current_user)
    
    return UserPrivateOut.model_validate(current_user)

# -----------------------------
# Upload profile picture
# -----------------------------
@router.post("/me/profile/picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload profile picture"""
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/profile_pictures"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"profile_{current_user.unique_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user profile
    await db.execute(
        update(User).where(User.id == current_user.id).values(
            profile_picture=file_path,
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    return UserResponse(
        success=True,
        message="Profile picture uploaded successfully",
        data={"file_path": file_path}
    )

# -----------------------------
# Update badge
# -----------------------------
@router.patch("/me/badge", response_model=UserResponse)
async def update_badge(
    badge: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user badge (seller, buyer, seller/buyer)"""
    
    if badge not in ['seller', 'buyer', 'seller/buyer']:
        raise HTTPException(
            status_code=400,
            detail="Badge must be 'seller', 'buyer', or 'seller/buyer'"
        )
    
    await db.execute(
        update(User).where(User.id == current_user.id).values(
            badge=badge,
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    return UserResponse(
        success=True,
        message=f"Badge updated to {badge}"
    )

# -----------------------------
# Update wallet funds (admin only)
# -----------------------------
@router.patch("/{unique_id}/wallet", response_model=UserResponse)
async def update_wallet_funds(
    unique_id: str,
    amount: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user wallet funds (admin only)"""
    
    # Check if current user is admin (you can implement proper admin check)
    if not getattr(current_user, 'is_superuser', False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(User).where(User.unique_id == unique_id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.execute(
        update(User).where(User.id == user.id).values(
            inapp_wallet_funds=amount,
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    return UserResponse(
        success=True,
        message=f"Wallet funds updated to {amount} Tomans"
    )

# -----------------------------
# Get user by unique_id (private info for admin)
# -----------------------------
@router.get("/{unique_id}/admin", response_model=UserPrivateOut)
async def get_user_admin(
    unique_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user private information (admin only)"""
    
    # Check if current user is admin
    if not getattr(current_user, 'is_superuser', False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(User).where(User.unique_id == unique_id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserPrivateOut.model_validate(user)
