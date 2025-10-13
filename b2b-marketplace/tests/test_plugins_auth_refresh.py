import pytest
from datetime import datetime

from plugins.auth import jwt as auth_jwt
from app.core import refresh as refresh_core


from tests.fake_redis import FakeRedis


@pytest.mark.asyncio
async def test_plugin_refresh_and_logout(monkeypatch):
    fake_redis = FakeRedis()

    async def _get_redis():
        return fake_redis

    monkeypatch.setattr(refresh_core, "get_redis", _get_redis)

    # Issue token pair
    tokens = auth_jwt.create_token_pair({"sub": "user@example.com"})
    refresh_token = tokens["refresh_token"]
    payload = auth_jwt.verify_token(refresh_token, Exception("invalid"))
    jti = payload.get("jti")
    exp = payload.get("exp")
    ttl = int(exp - datetime.utcnow().timestamp())

    # store jti as the login endpoint would
    await refresh_core.store_refresh_jti(await refresh_core.get_redis(), jti, "user@example.com", ttl)
    assert await refresh_core.is_refresh_jti_valid(await refresh_core.get_redis(), jti)

    # simulate refresh: revoke jti
    await refresh_core.revoke_refresh_jti(await refresh_core.get_redis(), jti)
    assert not await refresh_core.is_refresh_jti_valid(await refresh_core.get_redis(), jti)
