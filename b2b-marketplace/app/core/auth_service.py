"""
Enhanced Authentication Service
Implements OAuth 2.1 compliant authentication with device binding and token rotation
"""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from fastapi import HTTPException, status
import jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.sms_provider import get_sms_provider
from app.models.user import User
from app.models.device import Device, OTPCode, UserSession
from app.core.rate_limit import rate_limit_otp_request, rate_limit_otp_verify

# Password hashing context
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Enhanced authentication service with OAuth 2.1 compliance"""
    
    def __init__(self):
        self.sms_provider = get_sms_provider()
        self.otp_expiry_minutes = 5
        self.max_otp_attempts = 3
        self.otp_rate_limit_window = 3600  # 1 hour
        self.max_otp_requests_per_hour = 5
    
    def hash_otp(self, otp: str) -> str:
        """Hash OTP code for secure storage"""
        return hashlib.sha256(otp.encode()).hexdigest()
    
    def verify_otp_hash(self, otp: str, hashed_otp: str) -> bool:
        """Verify OTP against hash"""
        return hashlib.sha256(otp.encode()).hexdigest() == hashed_otp
    
    def generate_otp(self) -> str:
        """Generate 6-digit OTP code"""
        return f"{secrets.randbelow(900000) + 100000:06d}"
    
    def create_access_token(self, user_id: str, device_id: str) -> str:
        """Create JWT access token with device binding"""
        payload = {
            "sub": user_id,
            "device_id": device_id,
            "type": "access",
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4())
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    def create_refresh_token(self, user_id: str, device_id: str) -> Tuple[str, str]:
        """Create refresh token with hash for storage"""
        token_id = str(uuid.uuid4())
        payload = {
            "sub": user_id,
            "device_id": device_id,
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "iat": datetime.utcnow(),
            "jti": token_id
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        return token, token_hash
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    async def request_otp(
        self, 
        phone: str, 
        device_id: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Request OTP with rate limiting and security checks"""
        
        # Rate limiting
        await rate_limit_otp_request(phone)
        
        # Check if BYPASS_OTP is enabled
        if settings.BYPASS_OTP:
            return {
                "detail": "OTP bypass enabled for development",
                "phone": phone,
                "bypass_code": "000000"
            }
        
        # Generate OTP
        otp_code = self.generate_otp()
        otp_hash = self.hash_otp(otp_code)
        expires_at = datetime.utcnow() + timedelta(minutes=self.otp_expiry_minutes)
        
        # Store OTP in database
        otp_record = OTPCode(
            phone_number=phone,
            code_hash=otp_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(otp_record)
        await db.commit()
        
        # Send OTP via SMS
        sms_sent = await self.sms_provider.send_otp(phone, otp_code)
        if not sms_sent:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to send OTP. Please try again later."
            )
        
        return {
            "detail": "OTP sent successfully",
            "phone": phone,
            "expires_in": self.otp_expiry_minutes * 60
        }
    
    async def verify_otp(
        self,
        phone: str,
        otp_code: str,
        device_id: str,
        device_type: str = "mobile",
        device_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Verify OTP and create user session with device binding"""
        
        # Rate limiting
        await rate_limit_otp_verify(phone)
        
        # Check if BYPASS_OTP is enabled
        if settings.BYPASS_OTP and otp_code == "000000":
            # Create or get user for bypass mode
            user = await self._get_or_create_user_bypass(phone, db)
        else:
            # Verify OTP
            user = await self._verify_otp_and_get_user(phone, otp_code, db)
        
        # Create or update device
        device = await self._create_or_update_device(
            user.id, device_id, device_type, device_name, 
            ip_address, user_agent, db
        )
        
        # Create tokens
        access_token = self.create_access_token(str(user.id), device_id)
        refresh_token, refresh_hash = self.create_refresh_token(str(user.id), device_id)
        
        # Update device with refresh token hash
        device.refresh_token_hash = refresh_hash
        device.last_used_at = datetime.utcnow()
        await db.commit()
        
        # Create session record
        session = UserSession(
            user_id=user.id,
            device_id=device_id,
            user_agent=user_agent,
            ip_address=ip_address,
            login_method="otp",
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        db.add(session)
        await db.commit()
        
        # Update user last login
        user.last_login = datetime.utcnow()
        user.kyc_status = "otp_verified"
        await db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": str(user.id),
                "phone": user.mobile_number,
                "name": user.name,
                "kyc_status": user.kyc_status
            },
            "device": {
                "id": device_id,
                "type": device_type,
                "name": device_name
            }
        }
    
    async def refresh_token(
        self,
        refresh_token: str,
        device_id: str,
        db: AsyncSession = None
    ) -> Dict[str, Any]:
        """Refresh access token with token rotation"""
        
        # Verify refresh token
        payload = self.verify_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        token_device_id = payload.get("device_id")
        
        if not user_id or token_device_id != device_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token or device mismatch"
            )
        
        # Verify device and refresh token hash
        device = await self._verify_device_and_token(
            user_id, device_id, refresh_token, db
        )
        
        # Create new token pair (rotation)
        new_access_token = self.create_access_token(user_id, device_id)
        new_refresh_token, new_refresh_hash = self.create_refresh_token(user_id, device_id)
        
        # Update device with new refresh token hash
        device.refresh_token_hash = new_refresh_hash
        device.last_used_at = datetime.utcnow()
        await db.commit()
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    
    async def logout(
        self,
        refresh_token: str,
        device_id: str,
        db: AsyncSession = None
    ) -> Dict[str, str]:
        """Logout and revoke device session"""
        
        try:
            payload = self.verify_token(refresh_token)
            user_id = payload.get("sub")
            
            if user_id and device_id:
                # Revoke device
                device = await db.execute(
                    select(Device).where(
                        Device.user_id == user_id,
                        Device.device_id == device_id
                    )
                )
                device = device.scalar_one_or_none()
                if device:
                    device.revoke()
                    await db.commit()
                
                # Deactivate sessions
                await db.execute(
                    update(UserSession).where(
                        UserSession.user_id == user_id,
                        UserSession.device_id == device_id
                    ).values(is_active=False)
                )
                await db.commit()
        except Exception:
            # Best effort logout
            pass
        
        return {"detail": "Logged out successfully"}
    
    async def logout_all_devices(
        self,
        user_id: str,
        db: AsyncSession = None
    ) -> Dict[str, str]:
        """Logout from all devices"""
        
        # Revoke all devices
        await db.execute(
            update(Device).where(Device.user_id == user_id).values(revoked=True)
        )
        
        # Deactivate all sessions
        await db.execute(
            update(UserSession).where(UserSession.user_id == user_id).values(is_active=False)
        )
        
        await db.commit()
        return {"detail": "Logged out from all devices"}
    
    async def get_user_devices(
        self,
        user_id: str,
        db: AsyncSession = None
    ) -> list:
        """Get user's active devices"""
        
        result = await db.execute(
            select(Device).where(
                Device.user_id == user_id,
                Device.revoked == False
            ).order_by(Device.last_used_at.desc())
        )
        devices = result.scalars().all()
        
        return [
            {
                "id": device.device_id,
                "type": device.device_type,
                "name": device.device_name,
                "created_at": device.created_at,
                "last_used_at": device.last_used_at,
                "is_active": device.is_active()
            }
            for device in devices
        ]
    
    async def revoke_device(
        self,
        user_id: str,
        device_id: str,
        db: AsyncSession = None
    ) -> Dict[str, str]:
        """Revoke specific device"""
        
        device = await db.execute(
            select(Device).where(
                Device.user_id == user_id,
                Device.device_id == device_id
            )
        )
        device = device.scalar_one_or_none()
        
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        device.revoke()
        await db.commit()
        
        return {"detail": "Device revoked successfully"}
    
    async def _get_or_create_user_bypass(self, phone: str, db: AsyncSession) -> User:
        """Get or create user for bypass mode"""
        result = await db.execute(
            select(User).where(User.mobile_number == phone)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Create user for bypass mode
            user = User(
                mobile_number=phone,
                name="Bypass User",
                last_name="Development",
                national_id="0000000000",
                username=phone,
                email=f"{phone}@bypass.local",
                hashed_password=password_context.hash("bypass"),
                business_name="Bypass Business",
                business_description="Development bypass account",
                bank_accounts=[],
                addresses=[],
                business_phones=[phone],
                website="https://bypass.local",
                whatsapp_id=phone,
                telegram_id=phone,
                profile_picture="",
                badge="both"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        return user
    
    async def _verify_otp_and_get_user(self, phone: str, otp_code: str, db: AsyncSession) -> User:
        """Verify OTP and get user"""
        # Get OTP record
        result = await db.execute(
            select(OTPCode).where(
                OTPCode.phone_number == phone,
                OTPCode.is_used == False,
                OTPCode.expires_at > datetime.utcnow()
            ).order_by(OTPCode.created_at.desc())
        )
        otp_record = result.scalar_one_or_none()
        
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP not found or expired"
            )
        
        # Check attempts
        if otp_record.attempts >= self.max_otp_attempts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many failed attempts"
            )
        
        # Verify OTP
        if not self.verify_otp_hash(otp_code, otp_record.code_hash):
            otp_record.increment_attempts()
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )
        
        # Mark OTP as used
        otp_record.mark_used()
        await db.commit()
        
        # Get or create user
        result = await db.execute(
            select(User).where(User.mobile_number == phone)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user
            user = User(
                mobile_number=phone,
                name="New User",
                last_name="",
                national_id="",
                username=phone,
                email=f"{phone}@otp.local",
                hashed_password=password_context.hash(secrets.token_urlsafe(32)),
                business_name="",
                business_description="",
                bank_accounts=[],
                addresses=[],
                business_phones=[phone],
                website="",
                whatsapp_id="",
                telegram_id="",
                profile_picture="",
                badge="both"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        return user
    
    async def _create_or_update_device(
        self,
        user_id: str,
        device_id: str,
        device_type: str,
        device_name: Optional[str],
        ip_address: Optional[str],
        user_agent: Optional[str],
        db: AsyncSession
    ) -> Device:
        """Create or update device record"""
        
        result = await db.execute(
            select(Device).where(
                Device.device_id == device_id,
                Device.user_id == user_id
            )
        )
        device = result.scalar_one_or_none()
        
        if device:
            # Update existing device
            device.last_used_at = datetime.utcnow()
            device.revoked = False
            if device_name:
                device.device_name = device_name
            if ip_address:
                device.ip_address = ip_address
            if user_agent:
                device.user_agent = user_agent
        else:
            # Create new device
            device = Device(
                device_id=device_id,
                user_id=user_id,
                device_type=device_type,
                device_name=device_name,
                ip_address=ip_address,
                user_agent=user_agent,
                expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            )
            db.add(device)
        
        await db.commit()
        await db.refresh(device)
        return device
    
    async def _verify_device_and_token(
        self,
        user_id: str,
        device_id: str,
        refresh_token: str,
        db: AsyncSession
    ) -> Device:
        """Verify device and refresh token hash"""
        
        result = await db.execute(
            select(Device).where(
                Device.user_id == user_id,
                Device.device_id == device_id,
                Device.revoked == False
            )
        )
        device = result.scalar_one_or_none()
        
        if not device:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Device not found or revoked"
            )
        
        if device.is_expired():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Device session expired"
            )
        
        # Verify refresh token hash
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        if device.refresh_token_hash != token_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        return device

# Global auth service instance
auth_service = AuthService()


