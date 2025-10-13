# app/schemas/user.py
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class UserSignupIn(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)
    guild_codes: Optional[List[str]] = Field(default=[], max_items=3)
    name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    national_id: str = Field(..., min_length=1, max_length=50)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    email: EmailStr
    business_name: str = Field(..., min_length=1, max_length=200)
    business_description: str = Field(..., min_length=10, max_length=1000)
    bank_accounts: List[str] = Field(..., min_items=1)
    addresses: List[str] = Field(..., min_items=1, max_items=3)
    business_phones: List[str] = Field(..., min_items=1, max_items=6)
    website: str = Field(..., min_length=5)
    whatsapp_id: str = Field(..., min_length=1)
    telegram_id: str = Field(..., min_length=1)

    @validator('guild_codes')
    def validate_guild_codes(cls, v):
        if len(v) > 3:
            raise ValueError('Maximum 3 guild codes allowed')
        return v

    @validator('addresses')
    def validate_addresses(cls, v):
        if len(v) > 3:
            raise ValueError('Maximum 3 addresses allowed')
        return v

    @validator('business_phones')
    def validate_business_phones(cls, v):
        if len(v) > 6:
            raise ValueError('Maximum 6 business phone numbers allowed')
        return v

class UserLoginIn(BaseModel):
    identifier: str = Field(..., description="Mobile number or username")
    password: Optional[str] = Field(None, description="Password for password login")
    otp_code: Optional[str] = Field(None, description="OTP code for OTP login")

class UserProfileUpdateIn(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    profile_picture: Optional[str] = Field(None, min_length=1)
    badge: Optional[str] = Field(None, pattern="^(seller|buyer|seller/buyer)$")
    business_name: Optional[str] = Field(None, min_length=1, max_length=200)
    business_description: Optional[str] = Field(None, min_length=10, max_length=1000)
    bank_accounts: Optional[List[str]] = Field(None, max_items=10)
    addresses: Optional[List[str]] = Field(None, max_items=3)
    business_phones: Optional[List[str]] = Field(None, max_items=6)
    website: Optional[str] = Field(None, min_length=5)
    whatsapp_id: Optional[str] = Field(None, min_length=1)
    telegram_id: Optional[str] = Field(None, min_length=1)
    guild_codes: Optional[List[str]] = Field(None, max_items=3)
    privacy_settings: Optional[dict] = Field(None)

    @validator('badge')
    def validate_badge(cls, v):
        if v and v not in ['seller', 'buyer', 'seller/buyer']:
            raise ValueError('Badge must be seller, buyer, or seller/buyer')
        return v

class UserPublicOut(BaseModel):
    unique_id: str
    name: str
    last_name: str
    profile_picture: str
    badge: str
    rating: int
    is_active: bool
    business_name: str
    business_description: str
    website: str
    whatsapp_id: str
    telegram_id: str
    guild_codes: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserPrivateOut(BaseModel):
    unique_id: str
    mobile_number: str
    name: str
    last_name: str
    national_id: str
    profile_picture: str
    badge: str
    rating: int
    is_active: bool
    inapp_wallet_funds: int
    kyc_status: str
    kyc_verified_at: Optional[datetime]
    two_factor_enabled: bool
    profile_completion_percentage: int
    privacy_settings: dict
    username: str
    business_name: str
    business_description: str
    bank_accounts: List[str]
    addresses: List[str]
    business_phones: List[str]
    email: str
    website: str
    whatsapp_id: str
    telegram_id: str
    guild_codes: List[str]
    last_login: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserOTPRequestIn(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)

class UserOTPVerifyIn(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)
    otp_code: str = Field(..., min_length=4, max_length=8)

class UserTOTPSetupOut(BaseModel):
    secret: str
    qr_code_url: str

class UserTOTPVerifyIn(BaseModel):
    totp_code: str = Field(..., min_length=6, max_length=6)

class UserResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class UserTokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserPrivateOut
