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

from .models import Page

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


@router.get("/pages/{slug}")
async def get_page(slug: str, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    result = await db.execute(select(Page).where(Page.slug == slug))
    page = result.scalars().first()
    if not page:
        raise HTTPException(status_code=404, detail="Not found")
    return page


@router.post("/pages")
async def create_page(slug: str, title: str, content: str, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    page = Page(slug=slug, title=title, content=content)
    db.add(page)
    await db.commit()
    await db.refresh(page)
    return page


@router.patch("/pages/{slug}")
async def update_page(slug: str, title: str | None = None, content: str | None = None, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    result = await db.execute(select(Page).where(Page.slug == slug))
    page = result.scalars().first()
    if not page:
        raise HTTPException(status_code=404, detail="Not found")
    if title is not None:
        page.title = title
    if content is not None:
        page.content = content
    await db.commit()
    await db.refresh(page)
    return page











