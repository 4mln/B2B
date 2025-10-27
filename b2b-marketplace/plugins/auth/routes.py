# plugins/auth/routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta, datetime
import random
import os
import shutil
from typing import List
from sqlalchemy import select, update
from pydantic import BaseModel
import pyotp

from app.db.session import get_session as get_db
from app.core.auth import get_current_user_sync as get_current_user
from app.core.openapi import enhance_endpoint_docs
from plugins.auth.schemas import (
    UserCreate, UserOut, UserProfileOut, BusinessProfileUpdate,
    KYCVerificationRequest, KYCVerificationResponse, UserProfileChangeOut,
    Token, OTPRequest, OTPVerify, PrivacySettings, NotificationPreferences,
    TwoFASetupOut, TwoFAToggle, TwoFAVerify, TokenResponse, RefreshTokenRequest
)
from plugins.auth.models import User, UserProfileChange, UserSession
from plugins.auth.jwt import create_access_token, create_refresh_token, create_token_pair, verify_token
from plugins.auth.jwt import rotate_refresh_token
from app.core.refresh import get_redis, store_refresh_jti, is_refresh_jti_valid, revoke_refresh_jti, revoke_all_refresh_jtis
from app.core.config import settings
from plugins.user.crud import create_user, get_user_by_email
from plugins.user.security import verify_password, get_password_hash

# File upload validation helper
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB

def _validate_upload(file: UploadFile) -> None:
    # Check extension
    _, ext = os.path.splitext(file.filename or "")
    if ext:
        if ext.lower() not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file extension")

    # Check MIME using python-magic if available
    try:
        import magic
        # Read small chunk to guess
        file.file.seek(0)
        sample = file.file.read(2048)
        file.file.seek(0)
        mime = magic.from_buffer(sample, mime=True)
        if not mime.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid file type")
    except (ImportError, Exception):
        # Fallback to Content-Type header
        if not (file.content_type and file.content_type.startswith("image/")):
            raise HTTPException(status_code=400, detail="Invalid file type")

    # Size check if possible
    try:
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
        if size > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
    except Exception:
        # If seeking not supported, skip size check (best-effort)
        pass

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

router = APIRouter(tags=["Auth"])

# Aliases for frontend compatibility (frontend expects /users/register and /users/profile)
@router.post("/users/register", include_in_schema=False)
async def users_register_alias(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    return await signup(user_in, db)

@router.get("/users/profile", include_in_schema=False)
async def users_profile_alias(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await read_user_profile(current_user, db)

# -----------------------------
# Signup endpoint
# -----------------------------
@router.post("/signup", operation_id="signup")
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):

    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "email": user_in.email,
        "full_name": user_in.full_name,
        "phone": user_in.phone,
        "role": user_in.role,
        "password": user_in.password,
    }
    new_user = await create_user(db, user_data)
    return UserOut.model_validate(new_user)

# -----------------------------
# Login endpoint (OAuth2 standard)
# -----------------------------
@router.post("/token", operation_id="login_for_access_token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Update last login
    await db.execute(update(User).where(User.id == user.id).values(last_login=datetime.utcnow()))
    await db.commit()

    # Create session record
    # Note: device info can be set via headers in a separate endpoint; minimal create here
    from plugins.auth.models import UserSession
    session = UserSession(user_id=user.id, new_user_id=user.id if hasattr(user, 'id') and str(user.id).startswith('USR-') else None, user_agent="oauth2-password", ip_address=None)
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Issue token pair
    token_data = {"sub": user.email}
    tokens = create_token_pair(token_data)

    # Store refresh jti in Redis (best-effort)
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

    return TokenResponse(access_token=tokens["access_token"], refresh_token=tokens["refresh_token"], token_type="bearer", expires_in=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60))

# -----------------------------
# Get current user
# -----------------------------
@router.get("/me", operation_id="read_current_user")
async def read_current_user(current_user=Depends(get_current_user)):
    return UserOut.model_validate(current_user)

# -----------------------------
# Get complete user profile
# -----------------------------
@router.get("/me/profile", response_model=UserProfileOut, operation_id="read_user_profile")
async def read_user_profile(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return UserProfileOut.model_validate(current_user)


# -----------------------------
# Refresh endpoint for plugin auth
# -----------------------------
@router.post("/refresh", response_model=TokenResponse)
async def plugin_refresh_token(refresh: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = verify_token(refresh.refresh_token, HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if not payload.get("refresh"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_sub = payload.get("sub")
    if not user_sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Server-side validation using Redis
    redis = None
    try:
        redis = await get_redis()
        if not redis and settings.REQUIRE_REFRESH_REDIS:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Refresh service unavailable")
        if redis:
            jti = payload.get("jti")
            if not jti or not await is_refresh_jti_valid(redis, jti):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or invalid")
            # Revoke used jti
            await revoke_refresh_jti(redis, jti)
    except HTTPException:
        raise
    except Exception:
        if settings.REQUIRE_REFRESH_REDIS:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Refresh service unavailable")
        redis = None

    # Issue new token pair
    new_tokens = create_token_pair({"sub": user_sub})

    # Store new jti
    try:
        if redis:
            new_payload = verify_token(new_tokens["refresh_token"], HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"))
            new_jti = new_payload.get("jti")
            new_exp = new_payload.get("exp")
            if new_jti and new_exp:
                ttl = int(new_exp - datetime.utcnow().timestamp())
                if ttl > 0:
                    await store_refresh_jti(redis, new_jti, user_sub, ttl)
    except Exception:
        pass

    return TokenResponse(access_token=new_tokens["access_token"], refresh_token=new_tokens["refresh_token"], token_type="bearer", expires_in=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60))


# New standardized refresh endpoint for Phase 1 (keeps rotational semantics)
@router.post("/auth/refresh", response_model=TokenResponse, operation_id="auth_refresh")
async def auth_refresh_endpoint(refresh: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Endpoint explicitly at /auth/refresh to match audit roadmap.

    This implements refresh rotation: verify provided refresh token, revoke its jti
    (if Redis present), then issue a new token pair and store the new jti.
    """
    try:
        payload = verify_token(refresh.refresh_token, HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if not payload.get("refresh"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_sub = payload.get("sub")
    if not user_sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Server-side validation using Redis
    redis = None
    try:
        redis = await get_redis()
        if not redis and settings.REQUIRE_REFRESH_REDIS:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Refresh service unavailable")
        if redis:
            jti = payload.get("jti")
            if not jti or not await is_refresh_jti_valid(redis, jti):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or invalid")
            # Revoke used jti
            await revoke_refresh_jti(redis, jti)
    except HTTPException:
        raise
    except Exception:
        if settings.REQUIRE_REFRESH_REDIS:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Refresh service unavailable")
        redis = None

    # Rotate tokens (issue new pair)
    new_tokens = create_token_pair({"sub": user_sub})

    # Store new jti
    try:
        if redis:
            new_payload = verify_token(new_tokens["refresh_token"], HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"))
            new_jti = new_payload.get("jti")
            new_exp = new_payload.get("exp")
            if new_jti and new_exp:
                ttl = int(new_exp - datetime.utcnow().timestamp())
                if ttl > 0:
                    await store_refresh_jti(redis, new_jti, user_sub, ttl)
    except Exception:
        pass

    return TokenResponse(access_token=new_tokens["access_token"], refresh_token=new_tokens["refresh_token"], token_type="bearer", expires_in=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60))


# -----------------------------
# Logout endpoint (revoke a single refresh token)
# -----------------------------
class LogoutRequest(BaseModel):
    refresh_token: str


@router.post("/me/sessions/logout")
async def plugin_logout(req: LogoutRequest):
    try:
        payload = verify_token(req.refresh_token, HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token"))
        jti = payload.get("jti")
        if not jti:
            return {"detail": "No jti in token"}
        redis = await get_redis()
        if redis:
            await revoke_refresh_jti(redis, jti)
    except Exception:
        # best-effort
        pass
    return {"detail": "Logged out (token revoked if present)"}


@router.post("/me/sessions/logout-all")
async def plugin_logout_all(current_user=Depends(get_current_user)):
    try:
        redis = await get_redis()
        if redis:
            count = await revoke_all_refresh_jtis(redis, current_user.email)
            return {"detail": f"Revoked {count} refresh token(s) for user"}
    except Exception:
        pass
    return {"detail": "All sessions logged out (best-effort)"}

# -----------------------------
# Update user profile
# -----------------------------
@router.patch("/me/profile", response_model=UserProfileOut, operation_id="update_user_profile")
async def update_user_profile(
    profile_update: BusinessProfileUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    # Calculate profile completion percentage
    completion_fields = [
        'business_name', 'business_type', 'business_industry', 'business_description',
        'business_phones', 'business_emails', 'website', 'business_addresses', 'bank_accounts'
    ]
    
    completed_fields = 0
    update_data = {}
    
    for field in completion_fields:
        if hasattr(profile_update, field) and getattr(profile_update, field) is not None:
            update_data[field] = getattr(profile_update, field)
            completed_fields += 1
    
    # Calculate completion percentage
    completion_percentage = min(100, int((completed_fields / len(completion_fields)) * 100))
    update_data['profile_completion_percentage'] = completion_percentage
    update_data['updated_at'] = datetime.utcnow()
    
    # Update user profile
    await db.execute(update(User).where(User.id == current_user.id).values(**update_data))
    await db.commit()
    await db.refresh(current_user)
    
    # Log profile change for audit trail
    if request:
        for field, value in update_data.items():
            if field != 'updated_at' and field != 'profile_completion_percentage':
                old_value = getattr(current_user, field, None)
                change = UserProfileChange(
                    user_id=current_user.id,
                    changed_by=current_user.id,
                    field_name=field,
                    old_value=str(old_value) if old_value is not None else None,
                    new_value=str(value) if value is not None else None,
                    change_type="update",
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent")
                )
                db.add(change)
        
        await db.commit()
    
    return UserProfileOut.model_validate(current_user)

# -----------------------------
# Upload business photo
# -----------------------------
@router.post("/me/profile/photo", operation_id="upload_business_photo")
async def upload_business_photo(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.content_type.startswith('image/'):
        # Keep old behavior but run enhanced validation
        _validate_upload(file)
    else:
        _validate_upload(file)

    # Basic size check (if present)
    # Note: UploadFile doesn't always have size; clients should enforce limits.
    # Try S3 upload first
    from app.storage.s3 import upload_fileobj_to_s3

    filename = f"business_photo_{current_user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    key = f"business_photos/{current_user.id}/{filename}"
    file.file.seek(0)
    s3_bucket = os.getenv("S3_BUCKET")
    url = upload_fileobj_to_s3(file.file, s3_bucket, key, content_type=file.content_type)
    if url:
        file_path = url
    else:
        # Fallback to local storage
        upload_dir = "uploads/business_photos"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as buffer:
            file.file.seek(0)
            shutil.copyfileobj(file.file, buffer)

    # Update user profile
    await db.execute(
        update(User).where(User.id == current_user.id).values(business_photo=file_path)
    )
    await db.commit()

    return {"detail": "Business photo uploaded successfully", "file_path": file_path}

# -----------------------------
# Upload banner photo
# -----------------------------
@router.post("/me/profile/banner", operation_id="upload_banner_photo")
async def upload_banner_photo(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.content_type.startswith('image/'):
        _validate_upload(file)
    else:
        _validate_upload(file)

    from app.storage.s3 import upload_fileobj_to_s3

    filename = f"banner_photo_{current_user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    key = f"banner_photos/{current_user.id}/{filename}"
    file.file.seek(0)
    s3_bucket = os.getenv("S3_BUCKET")
    url = upload_fileobj_to_s3(file.file, s3_bucket, key, content_type=file.content_type)
    if url:
        file_path = url
    else:
        upload_dir = "uploads/banner_photos"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as buffer:
            file.file.seek(0)
            shutil.copyfileobj(file.file, buffer)

    # Update user profile
    await db.execute(
        update(User).where(User.id == current_user.id).values(banner_photo=file_path)
    )
    await db.commit()

    return {"detail": "Banner photo uploaded successfully", "file_path": file_path}

# -----------------------------
# KYC Verification
# -----------------------------
@router.post("/me/kyc/verify", response_model=KYCVerificationResponse, operation_id="kyc_verification")
async def kyc_verification(
    kyc_data: KYCVerificationRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if user has completed OTP verification
    if current_user.kyc_status == "pending":
        raise HTTPException(status_code=400, detail="Please complete OTP verification first")
    
    # Update user with KYC data
    update_data = {
        "business_name": kyc_data.business_name,
        "business_registration_number": kyc_data.business_registration_number,
        "business_tax_id": kyc_data.business_tax_id,
        "business_type": kyc_data.business_type,
        "business_industry": kyc_data.business_industry,
        "business_description": kyc_data.business_description,
        "business_phones": kyc_data.business_phones,
        "business_emails": kyc_data.business_emails,
        "business_addresses": [addr.dict() for addr in kyc_data.business_addresses],
        "bank_accounts": [acc.dict() for acc in kyc_data.bank_accounts],
        "kyc_status": "business_verified",
        "kyc_verified_at": datetime.utcnow(),
        "profile_completion_percentage": 100,
        "updated_at": datetime.utcnow()
    }
    
    await db.execute(update(User).where(User.id == current_user.id).values(**update_data))
    await db.commit()
    
    return KYCVerificationResponse(
        status="business_verified",
        message="KYC verification submitted successfully. Your profile will be reviewed within 24-48 hours.",
        estimated_processing_time="24-48 hours"
    )

# -----------------------------
# Get profile change history
# -----------------------------
@router.get("/me/profile/changes", response_model=List[UserProfileChangeOut], operation_id="get_profile_changes")
async def get_profile_changes(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50
):
    result = await db.execute(
        select(UserProfileChange)
        .where(UserProfileChange.user_id == current_user.id)
        .order_by(UserProfileChange.created_at.desc())
        .limit(limit)
    )
    changes = result.scalars().all()
    return [UserProfileChangeOut.model_validate(change) for change in changes]

# -----------------------------
# Update privacy settings
# -----------------------------
@router.patch("/me/privacy", operation_id="update_privacy_settings")
async def update_privacy_settings(
    privacy_settings: PrivacySettings,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(User).where(User.id == current_user.id).values(
            privacy_settings=privacy_settings.dict(),
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    return {"detail": "Privacy settings updated successfully"}

# -----------------------------
# Update notification preferences
# -----------------------------
@router.patch("/me/notifications", operation_id="update_notification_preferences")
async def update_notification_preferences(
    notification_preferences: NotificationPreferences,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(User).where(User.id == current_user.id).values(
            notification_preferences=notification_preferences.dict(),
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    return {"detail": "Notification preferences updated successfully"}

# -----------------------------
# Check if user exists by phone number
# -----------------------------
@router.get("/exists", operation_id="check_user_exists")
async def check_user_exists(
    phone: str = None,
    national_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Check if a user exists by phone number and/or national ID"""
    from sqlalchemy import select, or_
    
    if not phone and not national_id:
        raise HTTPException(status_code=400, detail="Phone number or national ID is required")
    
    conditions = []
    if phone:
        conditions.append(User.phone == phone)
    if national_id:
        conditions.append(User.national_id == national_id)
    
    result = await db.execute(select(User).where(or_(*conditions)))
    user = result.scalars().first()
    
    response = {
        "exists": user is not None,
        "phone_exists": False,
        "national_id_exists": False
    }
    
    if user:
        if phone and user.phone == phone:
            response["phone_exists"] = True
        if national_id and user.national_id == national_id:
            response["national_id_exists"] = True
    
    return response

# -----------------------------
# OTP-first: request code to phone (Iran provider stub)
# -----------------------------
@router.post("/otp/request", operation_id="otp_request")
async def otp_request(payload: OTPRequest, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    # Find user by phone
    result = await db.execute(select(User).where(User.phone == payload.phone))
    user = result.scalars().first()
    
    if not user:
        if payload.is_signup:
            # Create new user for signup
            user = User(
                username=payload.phone,
                email=f"{payload.phone}@otp.local",
                phone=payload.phone,
                hashed_password="",
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            # For signin, user must exist
            raise HTTPException(
                status_code=404, 
                detail="User not found. Please sign up first."
            )

    code = str(random.randint(100000, 999999))
    expiry = datetime.utcnow() + timedelta(minutes=10)
    user.otp_code = code
    user.otp_expiry = expiry
    await db.commit()

    # Send via Kavenegar (replace API key env var KAVENEGAR_API_KEY)
    try:
        import httpx, os
        api_key = os.getenv("KAVENEGAR_API_KEY")
        if api_key:
            url = f"https://api.kavenegar.com/v1/{api_key}/verify/lookup.json"
            params = {"receptor": payload.phone, "token": code, "template": "otp"}
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get(url, params=params)
        else:
            print(f"[OTP:FALLBACK] {code} to {payload.phone}")
    except Exception as e:
        print(f"[OTP:ERROR] {e}")

    return {"detail": "OTP sent"}

# -----------------------------
# OTP-first: verify code and issue token
# -----------------------------
@router.post("/otp/verify", operation_id="otp_verify")
async def otp_verify(payload: OTPVerify, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.phone == payload.phone))
    user = result.scalars().first()
    if not user or not user.otp_code or not user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP not requested")
    if user.otp_code != payload.code or datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # clear otp and mark kyc tier1
    user.otp_code = None
    user.otp_expiry = None
    user.kyc_status = "otp_verified"
    user.last_login = datetime.utcnow()
    await db.commit()

    # Create session record
    from plugins.auth.models import UserSession
    session = UserSession(
        user_id=user.id, 
        new_user_id=user.id if hasattr(user, 'id') and str(user.id).startswith('USR-') else None, 
        user_agent="otp-verify", 
        ip_address=None
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Issue token pair (access + refresh)
    token_data = {"sub": user.email}
    tokens = create_token_pair(token_data)

    # Store refresh jti in Redis (best-effort)
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

    # Return complete auth response matching frontend expectations
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer",
        "expires_in": int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60),
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.full_name or user.username,
            "email": user.email,
            "avatar": getattr(user, 'avatar', None),
            "isVerified": user.kyc_status == "otp_verified",
            "createdAt": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else datetime.utcnow().isoformat(),
            "updatedAt": user.updated_at.isoformat() if hasattr(user, 'updated_at') and user.updated_at else datetime.utcnow().isoformat(),
        },
        "device": {
            "id": str(session.id),
            "type": "mobile",
            "name": "OTP Device"
        }
    }

# -----------------------------
# 2FA (TOTP)
# -----------------------------
@router.post("/me/2fa/setup", response_model=TwoFASetupOut)
async def setup_2fa(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.two_factor_enabled and current_user.totp_secret:
        # Return existing provisioning URI
        totp = pyotp.TOTP(current_user.totp_secret)
        uri = totp.provisioning_uri(name=current_user.email, issuer_name="B2B-Marketplace")
        return TwoFASetupOut(provisioning_uri=uri, secret=current_user.totp_secret)

    secret = pyotp.random_base32()
    await db.execute(update(User).where(User.id == current_user.id).values(totp_secret=secret, updated_at=datetime.utcnow()))
    await db.commit()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=current_user.email, issuer_name="B2B-Marketplace")
    return TwoFASetupOut(provisioning_uri=uri, secret=secret)

@router.post("/me/2fa/verify")
async def verify_2fa(payload: TwoFAVerify, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not initialized")
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code")
    await db.execute(update(User).where(User.id == current_user.id).values(two_factor_enabled=True, updated_at=datetime.utcnow()))
    await db.commit()
    return {"detail": "2FA enabled"}

@router.post("/me/2fa/toggle")
async def toggle_2fa(payload: TwoFAToggle, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if payload.enabled and not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="Setup 2FA first")
    await db.execute(update(User).where(User.id == current_user.id).values(two_factor_enabled=payload.enabled, updated_at=datetime.utcnow()))
    await db.commit()
    return {"detail": f"2FA {'enabled' if payload.enabled else 'disabled'}"}

# -----------------------------
# Sessions management
# -----------------------------
@router.get("/me/sessions", response_model=list[dict])
async def list_sessions(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserSession).where(UserSession.user_id == current_user.id).order_by(UserSession.created_at.desc()))
    sessions = result.scalars().all()
    return [
        {
            "id": s.id,
            "device_id": s.device_id,
            "user_agent": s.user_agent,
            "ip_address": s.ip_address,
            "created_at": s.created_at,
            "last_seen_at": s.last_seen_at,
            "is_revoked": s.is_revoked,
        }
        for s in sessions
    ]

@router.post("/me/sessions/{session_id}/revoke")
async def revoke_session(session_id: int, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = await db.get(UserSession, session_id)
    if not s or s.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    s.is_revoked = True
    s.last_seen_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Session revoked"}

@router.post("/me/sessions/logout-all")
async def logout_all_sessions(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserSession).where(UserSession.user_id == current_user.id))
    sessions = result.scalars().all()
    for s in sessions:
        s.is_revoked = True
        s.last_seen_at = datetime.utcnow()
    await db.commit()
    return {"detail": "All sessions revoked"}

# Apply OpenAPI documentation enhancements (disabled to avoid import errors)
# try:
#     enhance_endpoint_docs(router, auth_docs)
# except Exception as e:
#     print(f"Warning: Could not enhance auth docs: {e}")