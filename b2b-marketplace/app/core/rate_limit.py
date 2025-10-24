"""
Production-grade Rate Limiting Module
Prevents abuse of authentication endpoints
"""
from fastapi import HTTPException, Request, status
from typing import Optional
import time
import hashlib
from app.core.refresh import get_redis_connection as get_redis

class RateLimiter:
    """
    Rate limiter using Redis for distributed rate limiting
    """
    
    def __init__(self, redis_client=None):
        self.redis = redis_client
    
    async def _get_redis(self):
        """Get Redis connection"""
        if not self.redis:
            self.redis = await get_redis()
        return self.redis
    
    def _get_key(self, identifier: str, action: str) -> str:
        """Generate Redis key for rate limiting"""
        # Hash identifier for privacy
        hashed = hashlib.sha256(identifier.encode()).hexdigest()[:16]
        return f"rate_limit:{action}:{hashed}"
    
    async def check_rate_limit(
        self,
        identifier: str,
        action: str,
        max_attempts: int,
        window_seconds: int,
        error_message: str = "Too many requests"
    ) -> bool:
        """
        Check if request should be rate limited
        
        Args:
            identifier: Unique identifier (phone, email, IP)
            action: Action type (otp_request, login, etc.)
            max_attempts: Maximum attempts allowed
            window_seconds: Time window in seconds
            error_message: Custom error message
            
        Returns:
            True if allowed, raises HTTPException if limited
        """
        redis = await self._get_redis()
        if not redis:
            # If Redis unavailable, allow request (graceful degradation)
            return True
        
        key = self._get_key(identifier, action)
        
        try:
            # Get current count
            current = await redis.get(key)
            count = int(current) if current else 0
            
            if count >= max_attempts:
                # Get TTL to tell user when they can retry
                ttl = await redis.ttl(key)
                if ttl > 0:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"{error_message}. Try again in {ttl} seconds."
                    )
                else:
                    # TTL expired, reset counter
                    await redis.delete(key)
                    count = 0
            
            # Increment counter
            if count == 0:
                # First attempt, set with expiry
                await redis.setex(key, window_seconds, 1)
            else:
                # Increment existing
                await redis.incr(key)
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            # On error, allow request (graceful degradation)
            print(f"Rate limit error: {e}")
            return True
    
    async def get_remaining_attempts(
        self,
        identifier: str,
        action: str,
        max_attempts: int
    ) -> dict:
        """Get remaining attempts for an identifier"""
        redis = await self._get_redis()
        if not redis:
            return {"remaining": max_attempts, "reset_in": None}
        
        key = self._get_key(identifier, action)
        
        try:
            current = await redis.get(key)
            count = int(current) if current else 0
            remaining = max(0, max_attempts - count)
            ttl = await redis.ttl(key) if count > 0 else None
            
            return {
                "remaining": remaining,
                "reset_in": ttl if ttl and ttl > 0 else None
            }
        except Exception:
            return {"remaining": max_attempts, "reset_in": None}
    
    async def reset_limit(self, identifier: str, action: str):
        """Reset rate limit for an identifier (admin use)"""
        redis = await self._get_redis()
        if not redis:
            return
        
        key = self._get_key(identifier, action)
        await redis.delete(key)


# Global rate limiter instance
_rate_limiter = None

async def get_rate_limiter() -> RateLimiter:
    """Get global rate limiter instance"""
    global _rate_limiter
    if not _rate_limiter:
        _rate_limiter = RateLimiter()
    return _rate_limiter


# Convenience functions for common rate limits

async def rate_limit_otp_request(phone: str):
    """
    Rate limit OTP requests
    Max 3 requests per hour per phone number
    """
    limiter = await get_rate_limiter()
    await limiter.check_rate_limit(
        identifier=phone,
        action="otp_request",
        max_attempts=3,
        window_seconds=3600,  # 1 hour
        error_message="Too many OTP requests"
    )


async def rate_limit_otp_verify(phone: str):
    """
    Rate limit OTP verification
    Max 5 attempts per 10 minutes per phone number
    """
    limiter = await get_rate_limiter()
    await limiter.check_rate_limit(
        identifier=phone,
        action="otp_verify",
        max_attempts=5,
        window_seconds=600,  # 10 minutes
        error_message="Too many verification attempts"
    )


async def rate_limit_login(email: str):
    """
    Rate limit login attempts
    Max 5 attempts per 15 minutes per email
    """
    limiter = await get_rate_limiter()
    await limiter.check_rate_limit(
        identifier=email,
        action="login",
        max_attempts=5,
        window_seconds=900,  # 15 minutes
        error_message="Too many login attempts"
    )


async def rate_limit_token_refresh(user_sub: str):
    """
    Rate limit token refresh
    Max 10 requests per 5 minutes per user
    """
    limiter = await get_rate_limiter()
    await limiter.check_rate_limit(
        identifier=user_sub,
        action="token_refresh",
        max_attempts=10,
        window_seconds=300,  # 5 minutes
        error_message="Too many refresh requests"
    )


async def rate_limit_by_ip(ip: str, action: str, max_attempts: int = 100, window: int = 60):
    """
    Generic IP-based rate limiting
    Default: 100 requests per minute
    """
    limiter = await get_rate_limiter()
    await limiter.check_rate_limit(
        identifier=ip,
        action=f"ip_{action}",
        max_attempts=max_attempts,
        window_seconds=window,
        error_message="Too many requests from your IP"
    )


# Account lockout functionality

async def check_account_lockout(identifier: str, action: str = "login") -> bool:
    """
    Check if account is locked out
    Returns True if locked
    """
    redis = await get_redis()
    if not redis:
        return False
    
    lock_key = f"account_lockout:{action}:{hashlib.sha256(identifier.encode()).hexdigest()[:16]}"
    
    try:
        is_locked = await redis.get(lock_key)
        if is_locked:
            ttl = await redis.ttl(lock_key)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account temporarily locked. Try again in {ttl} seconds."
            )
        return False
    except HTTPException:
        raise
    except Exception:
        return False


async def record_failed_attempt(identifier: str, action: str = "login"):
    """
    Record failed authentication attempt
    Lock account after 5 failed attempts
    """
    redis = await get_redis()
    if not redis:
        return
    
    attempt_key = f"failed_attempts:{action}:{hashlib.sha256(identifier.encode()).hexdigest()[:16]}"
    lock_key = f"account_lockout:{action}:{hashlib.sha256(identifier.encode()).hexdigest()[:16]}"
    
    try:
        # Increment failed attempts
        current = await redis.get(attempt_key)
        count = int(current) if current else 0
        count += 1
        
        if count >= 5:
            # Lock account for 30 minutes
            await redis.setex(lock_key, 1800, "locked")
            await redis.delete(attempt_key)
        else:
            # Store attempt count for 15 minutes
            await redis.setex(attempt_key, 900, count)
    except Exception as e:
        print(f"Failed to record attempt: {e}")


async def clear_failed_attempts(identifier: str, action: str = "login"):
    """Clear failed attempts after successful authentication"""
    redis = await get_redis()
    if not redis:
        return
    
    attempt_key = f"failed_attempts:{action}:{hashlib.sha256(identifier.encode()).hexdigest()[:16]}"
    try:
        await redis.delete(attempt_key)
    except Exception:
        pass
