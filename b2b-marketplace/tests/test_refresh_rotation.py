import asyncio
from datetime import datetime, timedelta

import pytest

from plugins.auth import jwt as auth_jwt
from app.core import refresh as refresh_core


from tests.fake_redis import FakeRedis


@pytest.mark.asyncio
async def test_refresh_jti_store_and_rotation(monkeypatch):
    fake_redis = FakeRedis()

    # monkeypatch get_redis to return our fake redis
    async def _get_redis():
        return fake_redis

    monkeypatch.setattr(refresh_core, "get_redis", _get_redis)

    # create a token pair
    user_sub = "test-user@example.com"
    tokens = auth_jwt.create_token_pair({"sub": user_sub})
    refresh_token = tokens["refresh_token"]

    # decode to get jti and exp
    credentials_exception = Exception("invalid")
    payload = auth_jwt.verify_token(refresh_token, credentials_exception) if hasattr(auth_jwt, "verify_token") else __import__("plugins.auth.jwt").verify_token(refresh_token, credentials_exception)
    jti = payload.get("jti")
    exp = payload.get("exp")
    assert jti is not None

    # store jti via store_refresh_jti (simulate app behavior)
    ttl = int(exp - datetime.utcnow().timestamp())
    await refresh_core.store_refresh_jti(await refresh_core.get_redis(), jti, user_sub, ttl)

    # it should be valid
    assert await refresh_core.is_refresh_jti_valid(await refresh_core.get_redis(), jti)

    # simulate using the refresh token: revoke the jti
    await refresh_core.revoke_refresh_jti(await refresh_core.get_redis(), jti)

    # now it should be invalid
    assert not await refresh_core.is_refresh_jti_valid(await refresh_core.get_redis(), jti)
