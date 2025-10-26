"""
Device and Session Management Models
Handles device tracking and session persistence for OAuth 2.1 compliance
"""
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid

class Device(Base):
    """Device tracking for session management"""
    __tablename__ = "devices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    device_id = Column(String(255), nullable=False, unique=True, index=True)  # Client-generated UUID
    user_id = Column(UUID(as_uuid=True), ForeignKey("users_new.id"), nullable=False, index=True)
    device_type = Column(String(50), nullable=False)  # mobile, web, tablet, desktop
    device_name = Column(String(255), nullable=True)  # User-friendly device name
    refresh_token_hash = Column(String(255), nullable=True, index=True)  # Hashed refresh token
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    revoked = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    # Device metadata
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    os_name = Column(String(100), nullable=True)
    os_version = Column(String(100), nullable=True)
    app_version = Column(String(50), nullable=True)
    device_metadata = Column(JSONB, default=dict)  # Additional device info
    
    # Relationships
    user = relationship("User", back_populates="devices")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_device_user_active', 'user_id', 'revoked', 'expires_at'),
        Index('idx_device_token_hash', 'refresh_token_hash'),
    )
    
    def is_expired(self) -> bool:
        """Check if device session is expired"""
        return datetime.utcnow() > self.expires_at
    
    def is_active(self) -> bool:
        """Check if device session is active (not revoked and not expired)"""
        return not self.revoked and not self.is_expired()
    
    def revoke(self) -> None:
        """Revoke device session"""
        self.revoked = True
        self.refresh_token_hash = None

class OTPCode(Base):
    """OTP codes storage with proper security"""
    __tablename__ = "otp_codes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    phone_number = Column(String(20), nullable=False, index=True)
    code_hash = Column(String(255), nullable=False, index=True)  # SHA256 hash of OTP
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    attempts = Column(Integer, default=0, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    # Rate limiting fields
    ip_address = Column(String(45), nullable=True, index=True)
    user_agent = Column(Text, nullable=True)
    
    # Indexes for performance and cleanup
    __table_args__ = (
        Index('idx_otp_phone_active', 'phone_number', 'is_used', 'expires_at'),
        Index('idx_otp_cleanup', 'expires_at'),
        Index('idx_otp_rate_limit', 'phone_number', 'created_at'),
    )
    
    def is_expired(self) -> bool:
        """Check if OTP code is expired"""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self) -> bool:
        """Check if OTP code is valid (not used, not expired, under attempt limit)"""
        return not self.is_used and not self.is_expired() and self.attempts < 3
    
    def increment_attempts(self) -> None:
        """Increment failed attempt counter"""
        self.attempts += 1
    
    def mark_used(self) -> None:
        """Mark OTP code as used"""
        self.is_used = True

