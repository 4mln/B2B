"""
Enhanced Authentication Routes v2
OAuth 2.1 compliant authentication with device binding and token rotation
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional
import uuid

from app.db.session import get_session
from app.core.auth_service import auth_service
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication v2"])

# Request/Response Models
class OTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number in international format")
    device_id: str = Field(..., description="Unique device identifier")

class OTPVerify(BaseModel):
    phone: str = Field(..., description="Phone number")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")
    device_id: str = Field(..., description="Unique device identifier")
    device_type: str = Field(default="mobile", description="Device type")
    device_name: Optional[str] = Field(None, description="User-friendly device name")

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")
    device_id: str = Field(..., description="Unique device identifier")

class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")
    device_id: str = Field(..., description="Unique device identifier")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict
    device: dict

class OTPResponse(BaseModel):
    detail: str
    phone: str
    expires_in: Optional[int] = None
    bypass_code: Optional[str] = None

class LogoutResponse(BaseModel):
    detail: str

# Authentication Endpoints

@router.post("/request-otp", response_model=OTPResponse)
async def request_otp(
    request: OTPRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_session)
):
    """
    Request OTP code for phone number verification
    
    - **phone**: Phone number in international format (e.g., +1234567890)
    - **device_id**: Unique device identifier (UUID recommended)
    
    Returns OTP code via SMS or console (development mode)
    """
    try:
        result = await auth_service.request_otp(
            phone=request.phone,
            device_id=request.device_id,
            ip_address=http_request.client.host if http_request.client else None,
            user_agent=http_request.headers.get("user-agent"),
            db=db
        )
        return OTPResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(
    request: OTPVerify,
    http_request: Request,
    db: AsyncSession = Depends(get_session)
):
    """
    Verify OTP code and create authenticated session
    
    - **phone**: Phone number used for OTP request
    - **otp_code**: 6-digit OTP code received via SMS
    - **device_id**: Same device ID used in OTP request
    - **device_type**: Type of device (mobile, web, tablet, desktop)
    - **device_name**: Optional user-friendly device name
    
    Returns access and refresh tokens with device binding
    """
    try:
        result = await auth_service.verify_otp(
            phone=request.phone,
            otp_code=request.otp_code,
            device_id=request.device_id,
            device_type=request.device_type,
            device_name=request.device_name,
            ip_address=http_request.client.host if http_request.client else None,
            user_agent=http_request.headers.get("user-agent"),
            db=db
        )
        return TokenResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Refresh access token using refresh token
    
    - **refresh_token**: Valid refresh token
    - **device_id**: Device ID that owns the refresh token
    
    Returns new access and refresh token pair (token rotation)
    """
    try:
        result = await auth_service.refresh_token(
            refresh_token=request.refresh_token,
            device_id=request.device_id,
            db=db
        )
        return TokenResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: LogoutRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Logout and revoke device session
    
    - **refresh_token**: Refresh token to revoke
    - **device_id**: Device ID to logout
    
    Revokes the specific device session
    """
    try:
        result = await auth_service.logout(
            refresh_token=request.refresh_token,
            device_id=request.device_id,
            db=db
        )
        return LogoutResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/logout-all", response_model=LogoutResponse)
async def logout_all_devices(
    user_id: str,
    db: AsyncSession = Depends(get_session)
):
    """
    Logout from all devices
    
    - **user_id**: User ID to logout from all devices
    
    Revokes all device sessions for the user
    """
    try:
        result = await auth_service.logout_all_devices(
            user_id=user_id,
            db=db
        )
        return LogoutResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/devices")
async def get_user_devices(
    user_id: str,
    db: AsyncSession = Depends(get_session)
):
    """
    Get user's active devices
    
    - **user_id**: User ID to get devices for
    
    Returns list of active devices
    """
    try:
        devices = await auth_service.get_user_devices(
            user_id=user_id,
            db=db
        )
        return {"devices": devices}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/revoke-device", response_model=LogoutResponse)
async def revoke_device(
    user_id: str,
    device_id: str,
    db: AsyncSession = Depends(get_session)
):
    """
    Revoke specific device
    
    - **user_id**: User ID that owns the device
    - **device_id**: Device ID to revoke
    
    Revokes the specific device session
    """
    try:
        result = await auth_service.revoke_device(
            user_id=user_id,
            device_id=device_id,
            db=db
        )
        return LogoutResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Health check endpoint
@router.get("/health")
async def auth_health():
    """Authentication service health check"""
    return {
        "status": "healthy",
        "bypass_otp": settings.BYPASS_OTP,
        "sms_provider": settings.SMS_PROVIDER,
        "otp_expire_minutes": settings.OTP_EXPIRE_MINUTES
    }


