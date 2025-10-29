"""Helpers for refresh token storage & rotation using Redis.

This module stores an entry per refresh JTI and also keeps a per-user set
of JTIs to support revoking all tokens for a user.
"""
import os
from typing import Optional
from typing import Optional

# Use the centralized connection helper which implements retries and
# fallbacks; this prevents creating an unguarded Redis connection at
# import time which can trigger DNS resolution errors during tests.
try:
    from app.core.connections import get_redis as get_redis_connection
except Exception:
    # If the connections module isn't available for some reason, fall
    # back to a minimal stub that returns None.
    async def get_redis_connection():
        return None

# Backwards-compatible alias expected by plugins
async def get_redis():
    return await get_redis_connection()


def _jti_key(jti: str) -> str:
    return f"refresh_jti:{jti}"


def _user_set_key(user_sub: str) -> str:
    # user_sub may contain characters unsuitable for keys; keep it simple
    return f"refresh_jtis_for_user:{user_sub}"


async def store_refresh_jti(redis, jti: str, user_sub: str, expires_seconds: int) -> bool:
    """Store a refresh jti and add it to the user's set.

    Sets the jti key with TTL and adds the jti to a per-user set. The per-user
    set's TTL is also updated (set to at least the token ttl) so it expires
    eventually.
    """
    key = _jti_key(jti)
    user_set = _user_set_key(user_sub)
    await redis.set(key, user_sub, ex=expires_seconds)
    await redis.sadd(user_set, jti)
    # Ensure the set expires eventually; set to max(current_ttl, expires_seconds)
    try:
        cur_ttl = await redis.ttl(user_set)
        if cur_ttl < expires_seconds:
            await redis.expire(user_set, expires_seconds)
    except Exception:
        # Not critical if TTL can't be adjusted
        pass
    return True


async def is_refresh_jti_valid(redis, jti: str) -> bool:
    key = _jti_key(jti)
    return bool(await redis.exists(key))


async def revoke_refresh_jti(redis, jti: str) -> bool:
    key = _jti_key(jti)
    # If key exists, get the user_sub to remove from the set
    try:
        user_sub = await redis.get(key)
        await redis.delete(key)
        if user_sub:
            await redis.srem(_user_set_key(user_sub), jti)
    except Exception:
        # best-effort
        pass
    return True


async def revoke_all_refresh_jtis(redis, user_sub: str) -> int:
    """Revoke all refresh JTIs for the given user. Returns number of revoked JTIs."""
    user_set = _user_set_key(user_sub)
    try:
        members = await redis.smembers(user_set)
        if not members:
            return 0
        # delete each jti key
        keys = [_jti_key(j) for j in members]
        if keys:
            await redis.delete(*keys)
        # remove the set
        await redis.delete(user_set)
        return len(members)
    except Exception:
        return 0
