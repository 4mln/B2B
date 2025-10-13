# app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import timedelta, datetime
import random
import os
import httpx
from typing import Optional

from app.db.session import get_session as get_db
from app.core.auth import get_current_user_sync as get_current_user
from app.schemas.user import (
    UserSignupIn, UserLoginIn, UserOTPRequestIn, UserOTPVerifyIn,
    UserTOTPSetupOut, UserTOTPVerifyIn, UserTokenResponse, UserResponse
)
from app.models.user import User
from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from plugins.auth.jwt import create_access_token, create_refresh_token, create_token_pair, verify_token
from app.core.refresh import get_redis, store_refresh_jti, is_refresh_jti_valid, revoke_refresh_jti, revoke_all_refresh_jtis
from plugins.auth.models import UserSession
import pyotp

router = APIRouter(prefix="/auth", tags=["Authentication"])

# -----------------------------
# Signup endpoint
# -----------------------------
@router.post("/signup", response_model=UserResponse)
async def signup(
    user_data: UserSignupIn,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with all required fields"""
    
    # Check if user already exists
    result = await db.execute(
        select(User).where(
            (User.email == user_data.email) |
            (User.username == user_data.username) |
            (User.mobile_number == user_data.mobile_number)
        )
    )
    existing_user = result.scalars().first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        elif existing_user.username == user_data.username:
            raise HTTPException(status_code=400, detail="Username already taken")
        elif existing_user.mobile_number == user_data.mobile_number:
            raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        mobile_number=user_data.mobile_number,
        guild_codes=user_data.guild_codes,
        name=user_data.name,
        last_name=user_data.last_name,
        national_id=user_data.national_id,
        username=user_data.username,
        hashed_password=hashed_password,
        email=user_data.email,
        business_name=user_data.business_name,
        business_description=user_data.business_description,
        bank_accounts=user_data.bank_accounts,
        addresses=user_data.addresses,
        business_phones=user_data.business_phones,
        website=user_data.website,
        whatsapp_id=user_data.whatsapp_id,
        telegram_id=user_data.telegram_id,
        profile_picture="",  # Will be required after first login
        badge="buyer",  # Default badge
        kyc_status="pending"
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return UserResponse(
        success=True,
        message="User registered successfully. Please complete profile setup.",
        data={"unique_id": new_user.unique_id}
    )

# -----------------------------
# Login endpoint (password-based)
# -----------------------------
@router.post("/login", response_model=UserTokenResponse)
async def login(
    login_data: UserLoginIn,
    db: AsyncSession = Depends(get_db)
):
    """Login with username/mobile and password"""
    
    if not login_data.password:
        raise HTTPException(status_code=400, detail="Password is required for login")
    
    # Find user by username or mobile number
    result = await db.execute(
        select(User).where(
            (User.username == login_data.identifier) |
            (User.mobile_number == login_data.identifier)
        )
    )
    user = result.scalars().first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Update last login
    await db.execute(
        update(User).where(User.id == user.id).values(last_login=datetime.utcnow())
    )
    await db.commit()
    
    # Create session record
    session = UserSession(
        user_id=user.id,
        user_agent="password-login",
        ip_address=None
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    # Create token pair (access + refresh)
    token_data = {"sub": user.email}
    tokens = create_token_pair(token_data)

    # Store refresh jti in Redis for rotation/revocation
    try:
        redis = await get_redis()
        if redis:
            # decode the refresh token to extract jti and exp
            payload = verify_token(tokens["refresh_token"], HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"))
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                # compute ttl seconds
                ttl = int(exp - datetime.utcnow().timestamp())
                if ttl > 0:
                    await store_refresh_jti(redis, jti, user.email, ttl)
    except Exception:
        # If Redis is unavailable, continue without server-side revocation (best-effort)
        pass

    return UserTokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user=user
    )

# -----------------------------
# OTP Request endpoint
# -----------------------------
@router.post("/otp/request", response_model=UserResponse)
async def request_otp(
    otp_request: UserOTPRequestIn,
    db: AsyncSession = Depends(get_db)
):
    """Request OTP code for mobile number"""
    
    # Find user by mobile number
    result = await db.execute(
        select(User).where(User.mobile_number == otp_request.mobile_number)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found. Please sign up first."
        )
    
    # Generate OTP code
    code = str(random.randint(100000, 999999))
    expiry = datetime.utcnow() + timedelta(minutes=10)
    
    # Update user with OTP
    await db.execute(
        update(User).where(User.id == user.id).values(
            otp_code=code,
            otp_expiry=expiry
        )
    )
    await db.commit()
    
    # Send OTP via SMS (Kavenegar)
    try:
        api_key = os.getenv("KAVENEGAR_API_KEY")
        if api_key:
            url = f"https://api.kavenegar.com/v1/{api_key}/verify/lookup.json"
            params = {
                "receptor": otp_request.mobile_number,
                "token": code,
                "template": "otp"
            }
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get(url, params=params)
        else:
            print(f"[OTP:FALLBACK] {code} to {otp_request.mobile_number}")
    except Exception as e:
        print(f"[OTP:ERROR] {e}")
    
    return UserResponse(
        success=True,
        message="OTP sent successfully"
    )

# -----------------------------
# OTP Verify endpoint
# -----------------------------
@router.post("/otp/verify", response_model=UserTokenResponse)
async def verify_otp(
    otp_verify: UserOTPVerifyIn,
    db: AsyncSession = Depends(get_db)
):
    """Verify OTP code and issue access token"""
    
    # Find user by mobile number
    result = await db.execute(
        select(User).where(User.mobile_number == otp_verify.mobile_number)
    )
    user = result.scalars().first()
    
    if not user or not user.otp_code or not user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP not requested")
    
    if user.otp_code != otp_verify.otp_code or datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Clear OTP and update KYC status
    await db.execute(
        update(User).where(User.id == user.id).values(
            otp_code=None,
            otp_expiry=None,
            kyc_status="otp_verified",
            last_login=datetime.utcnow()
        )
    )
    await db.commit()
    
    # Create session record
    session = UserSession(
        user_id=user.id,
        user_agent="otp-login",
        ip_address=None
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    # Create token pair (access + refresh)
    token_data = {"sub": user.email}
    tokens = create_token_pair(token_data)

    # Store refresh jti in Redis
    try:
        redis = await get_redis()
        if redis:
            payload = verify_token(tokens["refresh_token"], HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"))
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                ttl = int(exp - datetime.utcnow().timestamp())
                if ttl > 0:
                    await store_refresh_jti(redis, jti, user.email, ttl)
    except Exception:
        pass

    return UserTokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user=user
    )

# -----------------------------
# TOTP Setup endpoint
# -----------------------------
@router.post("/totp/setup", response_model=UserTOTPSetupOut)
async def setup_totp(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Setup TOTP for two-factor authentication"""
    
    if current_user.two_factor_enabled and current_user.totp_secret:
        # Return existing provisioning URI
        totp = pyotp.TOTP(current_user.totp_secret)
        uri = totp.provisioning_uri(name=current_user.email, issuer_name="B2B-Marketplace")
        return UserTOTPSetupOut(secret=current_user.totp_secret, qr_code_url=uri)
    
    # Generate new secret
    secret = pyotp.random_base32()
    await db.execute(
        update(User).where(User.id == current_user.id).values(
            totp_secret=secret,
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=current_user.email, issuer_name="B2B-Marketplace")
    
    return UserTOTPSetupOut(secret=secret, qr_code_url=uri)

# -----------------------------
# TOTP Verify endpoint
# -----------------------------
@router.post("/totp/verify", response_model=UserResponse)
async def verify_totp(
    totp_verify: UserTOTPVerifyIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify TOTP code and enable 2FA"""
    
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not initialized")
    
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(totp_verify.totp_code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    
    await db.execute(
        update(User).where(User.id == current_user.id).values(
            two_factor_enabled=True,
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    return UserResponse(
        success=True,
        message="Two-factor authentication enabled successfully"
    )

# -----------------------------
# Get current user
# -----------------------------
@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user

# -----------------------------
# Refresh token
# -----------------------------
@router.post("/refresh")
async def refresh_access_token(
    refresh_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token"""
    refresh_token = refresh_data.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token is required")
    # Validate refresh token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_token(refresh_token, credentials_exception)
    except HTTPException:
        raise credentials_exception

    # Ensure token is actually a refresh token
    if not payload.get("refresh"):
        raise HTTPException(status_code=401, detail="Token provided is not a refresh token")

    user_sub = payload.get("sub")
    if not user_sub:
        raise credentials_exception

    # Server-side validation: check JTI exists in Redis
    try:
        redis = await get_redis()
        if not redis and settings.REQUIRE_REFRESH_REDIS:
            # In critical environments, require Redis for refresh functionality
            raise credentials_exception
        if redis:
            jti = payload.get("jti")
            if not jti:
                raise credentials_exception
            valid = await is_refresh_jti_valid(redis, jti)
            if not valid:
                # token was revoked/rotated
                raise credentials_exception
            # Revoke the used jti to enforce one-time use (rotation)
            await revoke_refresh_jti(redis, jti)
    except HTTPException:
        raise
    except Exception:
        # If Redis is down and not required, fallback to best-effort (allow refresh) but do not rotate
        if settings.REQUIRE_REFRESH_REDIS:
            raise credentials_exception
        redis = None

    # Issue new token pair (rotation)
    token_data = {"sub": user_sub}
    new_tokens = create_token_pair(token_data)

    # Store new refresh jti
    try:
        if redis:
            new_payload = verify_token(new_tokens["refresh_token"], credentials_exception)
            new_jti = new_payload.get("jti")
            new_exp = new_payload.get("exp")
            if new_jti and new_exp:
                ttl = int(new_exp - datetime.utcnow().timestamp())
                if ttl > 0:
                    await store_refresh_jti(redis, new_jti, user_sub, ttl)
    except Exception:
        # best-effort
        pass

    return {"access_token": new_tokens["access_token"], "refresh_token": new_tokens["refresh_token"], "token_type": "bearer"}

# -----------------------------
# Logout all sessions
# -----------------------------
@router.post("/me/sessions/logout-all")
async def logout_all_user_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout from all sessions for the current user"""
    # Revoke all refresh JTIs for the current user (best-effort)
    try:
        redis = await get_redis()
        if redis:
            count = await revoke_all_refresh_jtis(redis, current_user.email)
            return {"detail": f"Revoked {count} refresh token(s) for user"}
    except Exception:
        pass

    return {"detail": "All sessions logged out (best-effort)"}
