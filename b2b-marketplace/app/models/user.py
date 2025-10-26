# app/models/user.py  (SQLAlchemy)
from datetime import datetime
import uuid
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, JSON, CheckConstraint, func
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID, BIGINT
from sqlalchemy.orm import declarative_base, relationship
from app.db.base import Base

def generate_unique_id():
    # implement a readable unique id, e.g. "USR-" + hex(uuid4()) or short uuid
    return f"USR-{uuid.uuid4().hex[:12]}"

class User(Base):
    __tablename__ = "users_new"

    # Primary keys
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    unique_id = Column(String, unique=True, nullable=False, default=generate_unique_id, index=True)

    # Required identity fields (signup)
    mobile_number = Column(String, nullable=False, unique=True)          # required
    guild_codes = Column(ARRAY(String), nullable=False, default=[])      # up to 3 guild codes
    name = Column(String, nullable=False)                                # required
    last_name = Column(String, nullable=False)                           # required
    national_id = Column(String, nullable=False)                         # required for now

    # Wallet (in Tomans)
    inapp_wallet_funds = Column(BIGINT, nullable=False, default=0)

    # After signup (profile)
    profile_picture = Column(String, nullable=False)                     # mandatory after signup
    badge = Column(String, nullable=False)                               # seller | buyer | seller/buyer
    rating = Column(Integer, nullable=False, default=0)                  # 0..5
    is_active = Column(Boolean, nullable=False, default=True)

    # Auth-related fields
    last_login = Column(DateTime, default=datetime.utcnow)
    otp_code = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    kyc_status = Column(String, default="pending")                       # pending|otp_verified|business_verified
    kyc_verified_at = Column(DateTime, nullable=True)
    totp_secret = Column(String, nullable=True)
    two_factor_enabled = Column(Boolean, default=False)
    profile_completion_percentage = Column(Integer, default=0)
    privacy_settings = Column(JSON, default={})

    # Credentials & business details (mandatory as requested)
    username = Column(String, nullable=False, unique=True)               # user name (mandatory)
    hashed_password = Column(String, nullable=False)

    business_name = Column(String, nullable=False)
    business_description = Column(String, nullable=False)

    bank_accounts = Column(ARRAY(String), nullable=False, default=[])    # mandatory (accept array)
    addresses = Column(ARRAY(String), nullable=False, default=[])        # mandatory - up to 3 addresses
    business_phones = Column(ARRAY(String), nullable=False, default=[])  # mandatory - up to 6 numbers

    email = Column(String, nullable=False, unique=True)
    website = Column(String, nullable=False)
    whatsapp_id = Column(String, nullable=False)
    telegram_id = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships - using string references to avoid circular imports
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("rating >= 0 AND rating <= 5", name="chk_user_rating_range"),
        CheckConstraint("coalesce(array_length(guild_codes,1),0) <= 3", name="chk_guild_codes_len"),
        CheckConstraint("coalesce(array_length(addresses,1),0) <= 3", name="chk_addresses_len"),
        CheckConstraint("coalesce(array_length(business_phones,1),0) <= 6", name="chk_business_phones_len"),
    )
