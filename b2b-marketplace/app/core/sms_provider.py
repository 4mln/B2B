"""
SMS Provider Abstraction Layer
Provides pluggable SMS providers for OTP delivery
"""
from abc import ABC, abstractmethod
from typing import Optional
import os
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class SMSProviderType(str, Enum):
    CONSOLE = "console"
    TWILIO = "twilio"
    KAVENEGAR = "kavenegar"
    AWS_SNS = "aws_sns"

class SMSProvider(ABC):
    """Abstract base class for SMS providers"""
    
    @abstractmethod
    async def send_otp(self, phone: str, code: str) -> bool:
        """
        Send OTP code to phone number
        
        Args:
            phone: Phone number in international format
            code: 6-digit OTP code
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        pass

class ConsoleLoggerSMSProvider(SMSProvider):
    """Development SMS provider that logs to console"""
    
    async def send_otp(self, phone: str, code: str) -> bool:
        """Log OTP to console for development"""
        logger.info(f"[SMS:CONSOLE] OTP {code} sent to {phone}")
        print(f"[SMS:CONSOLE] OTP {code} sent to {phone}")
        return True

class TwilioSMSProvider(SMSProvider):
    """Twilio SMS provider"""
    
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not all([self.account_sid, self.auth_token, self.from_number]):
            raise ValueError("Twilio credentials not configured")
    
    async def send_otp(self, phone: str, code: str) -> bool:
        """Send OTP via Twilio"""
        try:
            from twilio.rest import Client
            
            client = Client(self.account_sid, self.auth_token)
            message = client.messages.create(
                body=f"Your B2B Marketplace OTP code is: {code}. Valid for 5 minutes.",
                from_=self.from_number,
                to=phone
            )
            logger.info(f"[SMS:TWILIO] OTP sent to {phone}, SID: {message.sid}")
            return True
        except Exception as e:
            logger.error(f"[SMS:TWILIO] Failed to send OTP to {phone}: {e}")
            return False

class KavenegarSMSProvider(SMSProvider):
    """Kavenegar SMS provider for Iran"""
    
    def __init__(self):
        self.api_key = os.getenv("KAVENEGAR_API_KEY")
        self.template = os.getenv("KAVENEGAR_OTP_TEMPLATE", "otp")
        
        if not self.api_key:
            raise ValueError("Kavenegar API key not configured")
    
    async def send_otp(self, phone: str, code: str) -> bool:
        """Send OTP via Kavenegar"""
        try:
            import httpx
            
            url = f"https://api.kavenegar.com/v1/{self.api_key}/verify/lookup.json"
            params = {
                "receptor": phone,
                "token": code,
                "template": self.template
            }
            
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
            logger.info(f"[SMS:KAVENEGAR] OTP sent to {phone}")
            return True
        except Exception as e:
            logger.error(f"[SMS:KAVENEGAR] Failed to send OTP to {phone}: {e}")
            return False

class AWSSNSProvider(SMSProvider):
    """AWS SNS SMS provider"""
    
    def __init__(self):
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        
        if not all([self.access_key, self.secret_key]):
            raise ValueError("AWS credentials not configured")
    
    async def send_otp(self, phone: str, code: str) -> bool:
        """Send OTP via AWS SNS"""
        try:
            import boto3
            
            sns = boto3.client(
                'sns',
                region_name=self.region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key
            )
            
            message = f"Your B2B Marketplace OTP code is: {code}. Valid for 5 minutes."
            response = sns.publish(
                PhoneNumber=phone,
                Message=message
            )
            
            logger.info(f"[SMS:AWS_SNS] OTP sent to {phone}, MessageId: {response['MessageId']}")
            return True
        except Exception as e:
            logger.error(f"[SMS:AWS_SNS] Failed to send OTP to {phone}: {e}")
            return False

def get_sms_provider() -> SMSProvider:
    """Get configured SMS provider instance"""
    provider_type = os.getenv("SMS_PROVIDER", "console").lower()
    
    try:
        if provider_type == SMSProviderType.CONSOLE:
            return ConsoleLoggerSMSProvider()
        elif provider_type == SMSProviderType.TWILIO:
            return TwilioSMSProvider()
        elif provider_type == SMSProviderType.KAVENEGAR:
            return KavenegarSMSProvider()
        elif provider_type == SMSProviderType.AWS_SNS:
            return AWSSNSProvider()
        else:
            logger.warning(f"Unknown SMS provider: {provider_type}, falling back to console")
            return ConsoleLoggerSMSProvider()
    except Exception as e:
        logger.error(f"Failed to initialize SMS provider {provider_type}: {e}")
        logger.info("Falling back to console provider")
        return ConsoleLoggerSMSProvider()


