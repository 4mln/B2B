from datetime import datetime


class FakeRedis:
    def __init__(self):
        # store normal keys: key -> (value, expire_at)
        self._kv = {}
        # store sets: key -> set(members)
        self._sets = {}

    async def set(self, key, value, ex=None):
        expire_at = None
        if ex:
            expire_at = datetime.utcnow().timestamp() + int(ex)
        self._kv[key] = (value, expire_at)

    async def get(self, key):
        v = self._kv.get(key)
        if not v:
            return None
        value, expire_at = v
        if expire_at and datetime.utcnow().timestamp() > expire_at:
            del self._kv[key]
            return None
        return value

    async def exists(self, key):
        # check kv store only for simplicity
        v = await self.get(key)
        return 1 if v is not None else 0

    async def delete(self, *keys):
        for key in keys:
            self._kv.pop(key, None)
            self._sets.pop(key, None)

    async def sadd(self, key, member):
        s = self._sets.get(key)
        if s is None:
            s = set()
            self._sets[key] = s
        s.add(member)

    async def smembers(self, key):
        return self._sets.get(key, set()).copy()

    async def srem(self, key, member):
        s = self._sets.get(key)
        if not s:
            return 0
        if member in s:
            s.remove(member)
            return 1
        return 0

    async def ttl(self, key):
        v = self._kv.get(key)
        if not v:
            return -2
        _, expire_at = v
        if not expire_at:
            return -1
        return int(expire_at - datetime.utcnow().timestamp())

    async def expire(self, key, ex):
        v = self._kv.get(key)
        if not v:
            return False
        value, _ = v
        self._kv[key] = (value, datetime.utcnow().timestamp() + int(ex))
        return True
