from app.main import app
from app.core.plugins.loader import PluginLoader
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def run():
    engine = create_async_engine(settings.DATABASE_URL.replace('/b2b_marketplace','/test_b2b_marketplace'))
    loader = PluginLoader()
    await loader.load_all(app, engine)
    print('ROUTES:')
    for r in app.routes:
        try:
            print(getattr(r,'methods',None), r.path)
        except Exception:
            pass
    await engine.dispose()

asyncio.get_event_loop().run_until_complete(run())
