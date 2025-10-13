import pytest
from datetime import datetime

from app.core import refresh as refresh_core


class FakeRedis:
    def __init__(self):
        self._store = {}

    async def set(self, key, value, ex=None):
        expire_at = None
        if ex:
            expire_at = datetime.utcnow().timestamp() + int(ex)
        self._store[key] = (value, expire_at)

    async def smembers(self, key):
        # For simplicity, store sets under the key as list
        return self._store.get(key, set())

    async def sadd(self, key, member):
        s = self._store.get(key)
        if s is None:
            s = set()
            self._store[key] = s
        s.add(member)

    async def ttl(self, key):
        return -1

    async def expire(self, key, ex):
        return True

    async def delete(self, *keys):
        for k in keys:
            self._store.pop(k, None)

    async def exists(self, key):
        return 1 if key in self._store else 0

    async def get(self, key):
        v = self._store.get(key)
        if isinstance(v, tuple):
            return v[0]
        return None

    async def srem(self, key, member):
        s = self._store.get(key)
        if s and member in s:
            s.remove(member)
            return 1
        return 0


@pytest.mark.asyncio
async def test_revoke_all(monkeypatch):
    fake_redis = FakeRedis()

    async def _get_redis():
        return fake_redis

    monkeypatch.setattr(refresh_core, "get_redis", _get_redis)

    # Emulate storing multiple JTIs for a user
    user = "u@example.com"
    await refresh_core.store_refresh_jti(await refresh_core.get_redis(), "jti1", user, 3600)
    await refresh_core.store_refresh_jti(await refresh_core.get_redis(), "jti2", user, 3600)

    count = await refresh_core.revoke_all_refresh_jtis(await refresh_core.get_redis(), user)
    assert count >= 2
