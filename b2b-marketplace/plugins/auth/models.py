
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base

# User model will be imported when needed to avoid circular imports

class AuthToken(Base):
    __tablename__ = "auth_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_new.id"), nullable=False)
    token = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Use simple relationship to avoid requiring back_populates on User model
    user = relationship("User")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_new.id"), nullable=False)
    device_id = Column(String(255), nullable=True, index=True)  # Reference to device
    session_token = Column(String(255), nullable=True, index=True)  # Optional session token
    user_agent = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True, index=True)
    
    # Session metadata
    login_method = Column(String(50), nullable=True)  # otp, password, social
    login_provider = Column(String(50), nullable=True)  # google, facebook, etc.
    session_metadata = Column(String, nullable=True)  # JSON string for metadata

    user = relationship("User")


class UserProfileChange(Base):
    __tablename__ = "user_profile_changes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_new.id"), nullable=False)
    changed_by = Column(Integer, ForeignKey("users_new.id"), nullable=True)
    field_name = Column(String, nullable=False)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    change_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    actor = relationship("User", foreign_keys=[changed_by])

__all__ = [
    "AuthToken",
    "UserSession",
    "UserProfileChange",
]

# Backwards-compatible alias for User (some tests/plugins import User from this module)
try:
    from app.models.user import User as User  # type: ignore
    __all__.insert(0, "User")
except Exception:
    # If the application-level User model isn't available at import time,
    # leave it absent; importing modules should import app.models.user directly.
    pass
