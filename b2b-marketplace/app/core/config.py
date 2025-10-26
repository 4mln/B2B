from __future__ import annotations
from typing import Dict, Any
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # App metadata
    APP_NAME: str = "B2B Marketplace"
    APP_VERSION: str = "0.1.0"

    # Core services - use environment variables with fallbacks
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace"
    REDIS_URL: str = "redis://localhost:6379/0"
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # Security - require SECRET_KEY from environment in all non-development runs
    # SECRET_KEY must be provided for any non-development environment
    SECRET_KEY: str | None = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Reduced for security
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30    # Increased for better UX
    # In production you may want to require Redis for refresh token revocation
    REQUIRE_REFRESH_REDIS: bool = False
    
    # OTP Configuration
    BYPASS_OTP: bool = False  # Development bypass flag
    OTP_EXPIRE_MINUTES: int = 5
    MAX_OTP_ATTEMPTS: int = 3
    MAX_OTP_REQUESTS_PER_HOUR: int = 5
    
    # SMS Provider Configuration
    SMS_PROVIDER: str = "console"  # console, twilio, kavenegar, aws_sns
    KAVENEGAR_API_KEY: str | None = None
    KAVENEGAR_OTP_TEMPLATE: str = "otp"
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_PHONE_NUMBER: str | None = None
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    
    # Rate limiting
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_MAX_REQUESTS: int = 100

    # Plugin system
    ENABLE_PLUGIN_HOT_RELOAD: bool = False
    PLUGIN_CONFIG: Dict[str, Dict[str, Any]] = {}

    # Environment settings
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    # API prefix used by frontend (keep in sync with frontend-mobile/src/config/api.ts)
    API_PREFIX: str = "/api/v1"

    # Trusted CORS origins (comma-separated in env). If empty and DEBUG=True,
    # allow local origins for development.
    TRUSTED_ORIGINS: str | None = None
    
    # Migration settings
    LEGACY_MODE: bool = True  # Enable legacy compatibility layer
    METRICS_ENABLED: bool = False  # Enable metrics collection

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Override with environment variables if they exist
        if os.getenv("DATABASE_URL"):
            self.DATABASE_URL = os.getenv("DATABASE_URL")
        if os.getenv("REDIS_URL"):
            self.REDIS_URL = os.getenv("REDIS_URL")
        if os.getenv("RABBITMQ_URL"):
            self.RABBITMQ_URL = os.getenv("RABBITMQ_URL")
        if os.getenv("SECRET_KEY"):
            self.SECRET_KEY = os.getenv("SECRET_KEY")
        if os.getenv("ENVIRONMENT"):
            self.ENVIRONMENT = os.getenv("ENVIRONMENT")
        # API prefix override
        if os.getenv("API_PREFIX"):
            self.API_PREFIX = os.getenv("API_PREFIX")
        # Trusted origins (comma separated)
        if os.getenv("TRUSTED_ORIGINS"):
            self.TRUSTED_ORIGINS = os.getenv("TRUSTED_ORIGINS")
        
        # OTP and SMS configuration
        if os.getenv("BYPASS_OTP"):
            self.BYPASS_OTP = os.getenv("BYPASS_OTP").lower() in ("true", "1", "yes")
        if os.getenv("SMS_PROVIDER"):
            self.SMS_PROVIDER = os.getenv("SMS_PROVIDER")
        if os.getenv("KAVENEGAR_API_KEY"):
            self.KAVENEGAR_API_KEY = os.getenv("KAVENEGAR_API_KEY")
        if os.getenv("KAVENEGAR_OTP_TEMPLATE"):
            self.KAVENEGAR_OTP_TEMPLATE = os.getenv("KAVENEGAR_OTP_TEMPLATE")
        if os.getenv("TWILIO_ACCOUNT_SID"):
            self.TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
        if os.getenv("TWILIO_AUTH_TOKEN"):
            self.TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
        if os.getenv("TWILIO_PHONE_NUMBER"):
            self.TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
        if os.getenv("AWS_REGION"):
            self.AWS_REGION = os.getenv("AWS_REGION")
        if os.getenv("AWS_ACCESS_KEY_ID"):
            self.AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
        if os.getenv("AWS_SECRET_ACCESS_KEY"):
            self.AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
        
        # Set environment-specific defaults
        if self.ENVIRONMENT == "production":
            self.DEBUG = False
            # In production, require Redis for refresh token revocation by default
            self.REQUIRE_REFRESH_REDIS = True

        # Fail fast when SECRET_KEY is not provided for non-development environments
        if not self.SECRET_KEY and self.ENVIRONMENT != "development":
            raise ValueError("SECRET_KEY must be set in non-development environments")
        # For security, enforce a minimum length for SECRET_KEY in non-dev
        if self.SECRET_KEY and self.ENVIRONMENT != "development" and len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long in non-development environments")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()