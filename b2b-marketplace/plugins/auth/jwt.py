from datetime import datetime, timedelta
import uuid
from typing import Union, Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status
from app.core.config import settings

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY not configured")
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "refresh": True, "jti": jti})
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY not configured")
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token

def verify_token(token: str, credentials_exception: HTTPException) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise credentials_exception


def rotate_refresh_token(old_refresh_token: str) -> dict:
    """Verify the given refresh token and return a rotated new token pair.

    Returns dict with keys: access_token, refresh_token
    Raises HTTPException on invalid token.
    """
    creds_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    payload = verify_token(old_refresh_token, creds_exc)
    if not payload.get("refresh"):
        raise creds_exc
    user_sub = payload.get("sub")
    if not user_sub:
        raise creds_exc

    # Issue new pair
    new_tokens = create_token_pair({"sub": user_sub})
    return new_tokens

def create_token_pair(user_data: dict) -> dict:
    access_token = create_access_token(user_data)
    refresh_token = create_refresh_token(user_data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }