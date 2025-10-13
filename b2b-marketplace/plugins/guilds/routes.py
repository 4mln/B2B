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

from .schemas import GuildCreate, GuildUpdate, GuildOut

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

from . import crud

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


@router.post("/", response_model=GuildOut)
async def create_guild_endpoint(data: GuildCreate, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    existing = await crud.get_guild_by_slug(db, data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Guild slug already exists")
    return await crud.create_guild(db, data)


@router.get("/", response_model=list[GuildOut])
async def list_guilds_endpoint(db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    return await crud.list_guilds(db)


@router.get("/{guild_id}", response_model=GuildOut)
async def get_guild_endpoint(guild_id: int, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    guild = await crud.get_guild(db, guild_id)
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    return guild


@router.patch("/{guild_id}", response_model=GuildOut)
async def update_guild_endpoint(guild_id: int, data: GuildUpdate, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    guild = await crud.update_guild(db, guild_id, data)
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    return guild


@router.delete("/{guild_id}")
async def delete_guild_endpoint(guild_id: int, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    ok = await crud.delete_guild(db, guild_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Guild not found")
    return {"detail": "Guild deleted"}



