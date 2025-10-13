from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.openapi import enhance_endpoint_docs

from plugins.user.schemas import UserCreate, UserUpdate, UserOut
from plugins.user.crud import create_user, get_user, update_user, delete_user, list_users
from plugins.user.security import get_current_user
from plugins.user.models import User
from plugins.user.docs import user_docs


def resolve_user_id(user) -> Tuple[Optional[str], Optional[str]]:
    """Resolve user ID for both legacy and new user models.

    Returns a tuple of (legacy_id, new_id) where one of them may be None.
    This is intentionally lightweight to avoid import-time DB access during
    route module imports. If needed, a DB-backed resolver should live in
    app.core.legacy_adapter and be called from business logic where AsyncSession
    is available.
    """
    if hasattr(user, "id"):
        uid = str(user.id)
        if uid.startswith("USR-"):
            return uid, uid
        return uid, None
    return None, None


router = APIRouter(prefix="/users", tags=["Users"])


# -----------------------------
# Create User
# -----------------------------
@router.post("/", response_model=UserOut, operation_id="create_user_endpoint")
async def create_user_endpoint(
    user_data: UserCreate, db: AsyncSession = Depends(get_session)
):
    return await create_user(db, user_data)


# -----------------------------
# Get User by ID
# -----------------------------
@router.get("/{user_id}", response_model=UserOut, operation_id="get_user_endpoint")
async def get_user_endpoint(user_id: int, db: AsyncSession = Depends(get_session)):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# -----------------------------
# Update User
# -----------------------------
@router.put("/{user_id}", response_model=UserOut, operation_id="update_user_endpoint")
async def update_user_endpoint(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    updated_user = await update_user(db, user_id, user_data, current_user.id)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found or permission denied")
    return updated_user


# -----------------------------
# Delete User
# -----------------------------
@router.delete("/{user_id}", response_model=dict, operation_id="delete_user_endpoint")
async def delete_user_endpoint(
    user_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)
):
    success = await delete_user(db, user_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found or permission denied")
    return {"detail": "User deleted successfully"}


# -----------------------------
# GDPR-style data export (basic)
# -----------------------------
@router.get("/{user_id}/export", operation_id="export_user_data")
async def export_user_data(user_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)):
    if current_user.id != user_id and not getattr(current_user, "is_superuser", False):
        raise HTTPException(status_code=403, detail="Forbidden")
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # minimal export
    return {"user": {"id": user.id, "email": getattr(user, "email", None), "phone": getattr(user, "phone", None), "kyc_status": getattr(user, "kyc_status", None)}}


# -----------------------------
# List / Search Users
# -----------------------------
@router.get("/", response_model=List[UserOut], operation_id="list_users_endpoint")
async def list_users_endpoint(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("id"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
):
    return await list_users(db, page, page_size, sort_by, sort_dir, search)


# Apply OpenAPI documentation enhancements
enhance_endpoint_docs(router, user_docs)