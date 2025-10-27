import pytest
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from typing import AsyncGenerator
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from httpx import AsyncClient
try:
    # ASGITransport moved between versions; try public import first
    from httpx._transports.asgi import ASGITransport
except Exception:
    # Fallback for some httpx versions
    try:
        from httpx._client import ASGITransport  # type: ignore
    except Exception:
        ASGITransport = None  # type: ignore
from app.main import app
from app.core.db import get_session
from app.core.config import settings
import pytest_asyncio
import logging

logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("asyncpg").setLevel(logging.WARNING)



# Create test database URL
TEST_DATABASE_URL = settings.DATABASE_URL.replace("/b2b_marketplace", "/test_b2b_marketplace")

# Create test engine and session
TestingSessionLocal = None


@pytest_asyncio.fixture(scope="session")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create an async engine inside the event loop and initialize the
    module-level TestingSessionLocal sessionmaker so other fixtures can use
    it. We initialize the sessionmaker here because it requires the engine
    instance returned by this fixture.
    """
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    # Initialize the sessionmaker factory now that engine exists
    global TestingSessionLocal
    TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    try:
        yield engine
    finally:
        await engine.dispose()


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def setup_test_db(test_engine):
    """Create test database tables."""
    async with test_engine.begin() as conn:
        # Import all models to ensure they are registered with metadata
        from plugins.orders.models import Base as OrdersBase
        from plugins.products.models import Base as ProductsBase
        from plugins.user.models import Base as UserBase, User
        from plugins.rfq.models import Base as RFQBase
        from plugins.payments.models import Base as PaymentsBase
        from plugins.admin.models import Base as AdminBase
        
        # Drop tables
        await conn.run_sync(OrdersBase.metadata.drop_all)
        await conn.run_sync(ProductsBase.metadata.drop_all)
        await conn.run_sync(UserBase.metadata.drop_all)
        await conn.run_sync(RFQBase.metadata.drop_all)
        await conn.run_sync(PaymentsBase.metadata.drop_all)
        await conn.run_sync(AdminBase.metadata.drop_all)
        
        # Create tables
        await conn.run_sync(OrdersBase.metadata.create_all)
        await conn.run_sync(ProductsBase.metadata.create_all)
        await conn.run_sync(UserBase.metadata.create_all)
        await conn.run_sync(RFQBase.metadata.create_all)
        await conn.run_sync(PaymentsBase.metadata.create_all)
        await conn.run_sync(AdminBase.metadata.create_all)
    
    yield
    
    # Clean up after tests
    async with test_engine.begin() as conn:
        from plugins.orders.models import Base as OrdersBase
        from plugins.products.models import Base as ProductsBase
        from plugins.user.models import Base as UserBase, User
        from plugins.rfq.models import Base as RFQBase
        from plugins.payments.models import Base as PaymentsBase
        from plugins.admin.models import Base as AdminBase
        await conn.run_sync(OrdersBase.metadata.drop_all)
        await conn.run_sync(ProductsBase.metadata.drop_all)
        await conn.run_sync(UserBase.metadata.drop_all)
        await conn.run_sync(RFQBase.metadata.drop_all)
        await conn.run_sync(PaymentsBase.metadata.drop_all)
        await conn.run_sync(AdminBase.metadata.drop_all)


@pytest.fixture
async def db_session(setup_test_db):
    """Create a fresh database session for a test."""
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def db(db_session):
    """Legacy alias fixture used across older tests (synchronous name `db`)."""
    yield db_session


@pytest_asyncio.fixture
async def override_get_db(db_session):
    """Override the get_db dependency. Ensures the provided `db_session`
    is the actual AsyncSession instance (not an async generator)."""
    # Return a callable that will open a fresh AsyncSession from the
    # module-level TestingSessionLocal sessionmaker. This avoids returning
    # the pytest async-fixture object itself (which can be an async
    # generator) into FastAPI dependency injection, causing the
    # 'async_generator' object has no attribute 'execute' error.
    async def _override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    return _override_get_db

@pytest_asyncio.fixture(scope="session")
async def app_with_plugins(test_engine):
    from app.core.plugins.loader import PluginLoader
    loader = PluginLoader()
    await loader.load_all(app, test_engine)
    # Debug: show which routes are registered for test visibility
    try:
        print("[test] Registered routes:")
        for r in app.routes:
            if hasattr(r, 'path'):
                print(f"[test] {getattr(r, 'methods', None)} {r.path}")
    except Exception:
        pass
    return app


@pytest_asyncio.fixture
async def client(app_with_plugins, override_get_db):
    """Create an async test client with the test database."""
    # Ensure we override both exported get_session symbols — some plugins
    # import from `app.core.db`, others directly from `app.db.session`.
    from app.core import db as app_core_db
    from app import db as app_db_session  # app/db/session.py exposed as app.db
    app_with_plugins.dependency_overrides[app_core_db.get_session] = override_get_db
    try:
        app_with_plugins.dependency_overrides[app_db_session.get_session] = override_get_db
    except Exception:
        # best-effort: some import paths may differ in test environment
        pass
    # Use ASGITransport for compatibility with httpx versions that don't accept `app=` param
    transport = None
    if ASGITransport is not None:
        try:
            # Use the instrumented app instance so routes registered by the
            # plugin loader are available to the test client.
            transport = ASGITransport(app=app_with_plugins)
        except Exception:
            transport = None

    if transport is not None:
        async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
            yield ac
    else:
        # Fallback to TestClient wrapped in an AsyncClient-like adapter
        from fastapi.testclient import TestClient
        with TestClient(app_with_plugins) as sync_client:
            class SyncClientWrapper:
                def __init__(self, client):
                    self._client = client

                async def post(self, *args, **kwargs):
                    return self._client.post(*args, **kwargs)

                async def get(self, *args, **kwargs):
                    return self._client.get(*args, **kwargs)

            yield SyncClientWrapper(sync_client)

    # Clear overrides on the instrumented app instance.
    app_with_plugins.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session):
    """Create a test user."""
    from plugins.user.models import User
    from plugins.user.security import get_password_hash
    
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def auth_headers(test_user):
    """Create authentication headers for test user."""
    from plugins.auth.jwt import create_access_token
    from plugins.user.models import User
    user = await test_user
    access_token = create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
async def admin_user(db_session, test_user):
    """Promote test_user to admin with finance permissions."""
    from plugins.admin.models import AdminUser, AdminRole, AdminPermission
    admin = AdminUser(
        user_id=test_user.id,
        role=AdminRole.SUPER_ADMIN,
        permissions=[AdminPermission.VIEW_FINANCIAL_REPORTS]
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest.fixture
def admin_headers(auth_headers):
    # Uses the same token as test_user; paired with admin_user fixture makes it admin
    return auth_headers


@pytest.fixture
async def test_user_2(db_session):
    """Create a second test user."""
    from plugins.user.models import User
    from plugins.user.security import get_password_hash
    user = User(
        email="seller@example.com",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def auth_headers_user2(test_user_2):
    from plugins.auth.jwt import create_access_token
    user2 = await test_user_2
    access_token = create_access_token(data={"sub": user2.email})
    return {"Authorization": f"Bearer {access_token}"}
# Use scope argument for event loop if needed
# @pytest.mark.asyncio(scope='module')
