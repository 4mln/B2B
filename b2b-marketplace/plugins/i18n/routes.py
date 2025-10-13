from fastapi import APIRouter, Header

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



router = APIRouter()


@router.get("/locale")
async def get_locale(accept_language: str | None = Header(None)):
    # Very simple locale detection: prefer fa if present, else en
    if accept_language and "fa" in accept_language.lower():
        return {"locale": "fa", "rtl": True, "calendar": "jalali", "currency": "IRR"}
    return {"locale": "en", "rtl": False, "calendar": "gregorian", "currency": "USD"}












