# app/main.py
# Fix Python path to include /code directory
import sys
if '/code' not in sys.path:
    sys.path.insert(0, '/code')

from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine
from redis.asyncio import Redis
from app.core.config import settings
from app.core.plugins.loader import PluginLoader
from app.core.middleware import setup_middleware
from app.core.security import setup_security_middleware
from app.core.logging import setup_logging_middleware
from app.core.ip_security import setup_ip_security
from app.core.api_key import setup_api_key_management
from app.core.docs import setup_api_documentation
from app.core.security_docs import apply_security_requirements, add_security_examples
from fastapi.responses import JSONResponse
from fastapi import Request
from contextlib import asynccontextmanager
from sqlalchemy.orm import configure_mappers

# Observability imports (optional)
try:
    from starlette_exporter import PrometheusMiddleware, handle_metrics
except Exception:
    PrometheusMiddleware = None
    handle_metrics = None

try:
    import sentry_sdk
    from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
except Exception:
    sentry_sdk = None
    SentryAsgiMiddleware = None

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize services and load plugins
    try:
        # Load core models before any plugin loads (User, Device, etc.)
        try:
            from app.db.base import load_core_models
            load_core_models()
        except Exception as e:
            print(f"[startup] load_core_models skipped or failed: {e}")

        # Optionally import plugin models that are known dependencies before mapping
        # (Keep minimal to avoid cross-plugin coupling.)
        try:
            import plugins.products.models  # Ensure Product exists for string relations
        except Exception:
            pass
        try:
            import plugins.orders.models  # Ensure Order exists for User relationships
        except Exception:
            pass
        try:
            import plugins.ratings.models  # Ensure Rating exists for User relationships
        except Exception:
            pass
        try:
            import plugins.ads.models  # Ensure Ad exists for User relationships
        except Exception:
            pass
        try:
            import plugins.payments.models  # Ensure Payment exists for Order relationships
        except Exception:
            pass

        # Finalize mapper configurations after all known models are imported
        try:
            configure_mappers()
        except Exception as e:
            print(f"[startup] configure_mappers warning: {e}")
        loader = PluginLoader()
        await loader.load_all(app, engine)
        if settings.ENABLE_PLUGIN_HOT_RELOAD:
            loader.enable_hot_reload(app, engine)

        # Setup API routes after plugins are loaded
        try:
            from app.api.routes import setup_api_routes
            setup_api_routes(app)
            print("Successfully loaded API routes")
        except ImportError as e:
            print(f"Error importing routes: {e}")
        except Exception as e:
            print(f"Error setting up routes: {e}")

        # Debug: List all registered routes
        print(f"Total routes registered: {len(app.routes)}")
        for route in app.routes:
            # Only print routes that have a path attribute
            path = getattr(route, "path", None)
            if not path:
                # Skip routes without a path (could be lifecycle routes)
                continue
            # Some route types (eg. WebSocket routes) may not expose `methods`.
            # Use getattr to avoid AttributeError and print a sensible message.
            methods = getattr(route, "methods", None)
            if methods:
                try:
                    print(f"Route: {methods} {path}")
                except Exception:
                    print(f"Route: {path}")
            else:
                # WebSocket or other ASGI routes - print class name instead
                print(f"Route: (no methods) {route.__class__.__name__} {path}")

        # Apply security documentation after plugins are loaded
        apply_security_requirements(app)
        add_security_examples(app)
    except Exception as e:
        print(f"Error loading plugins: {e}")
        raise
        
    yield  # This is where the app runs
    
    # Shutdown: cleanup connections
    await engine.dispose()
    await redis.close()

# Initialize FastAPI app with metadata
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A secure and scalable B2B marketplace platform",
    docs_url="/api/docs",  # Swagger UI
    redoc_url="/api/redoc",  # ReDoc UI
    lifespan=lifespan
)
# Configure API documentation
setup_api_documentation(app)

# Mount metrics endpoint at /metrics (and keep compatibility with API_PREFIX)
if PrometheusMiddleware is not None:
    app.add_middleware(PrometheusMiddleware)
    if handle_metrics is not None:
        try:
            app.add_route("/metrics", handle_metrics)
        except Exception:
            pass

# Initialize Sentry if configured
if sentry_sdk is not None and os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"))
    if SentryAsgiMiddleware is not None:
        try:
            app.add_middleware(SentryAsgiMiddleware)
        except Exception:
            pass

# Register lightweight API routers
try:
    from app.api.uploads import router as uploads_router
    app.include_router(uploads_router)
except Exception:
    # If router can't be imported at startup, it will be included by plugin loader or later
    pass

# Include analytics plugin routes (simple plugin)
try:
    from plugins.analytics.routes import router as analytics_router
    app.include_router(analytics_router, prefix=settings.API_PREFIX)
except Exception:
    # Plugin may be optional during early startup
    pass

# Include auth routes directly (temporary fix for plugin loading issue)
try:
    from plugins.auth.routes import router as auth_router
    app.include_router(auth_router, prefix="/auth", tags=["Auth"])
    app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
    print("Successfully loaded auth routes directly")
except Exception as e:
    print(f"Error loading auth routes: {e}")
    # Fallback: create minimal auth routes
    from fastapi import APIRouter
    from pydantic import BaseModel
    
    class OTPRequest(BaseModel):
        phone: str
        is_signup: bool = False
    
    auth_fallback = APIRouter()
    
    @auth_fallback.post("/otp/request")
    async def otp_request_fallback(payload: OTPRequest):
        return {"detail": "OTP request received", "phone": payload.phone, "is_signup": payload.is_signup}
    
    @auth_fallback.post("/otp/verify")
    async def otp_verify_fallback(payload: dict):
        # Simple bypass for development
        if payload.get("code") == "000000":
            return {
                "access_token": "bypass-access-token",
                "refresh_token": "bypass-refresh-token",
                "token_type": "bearer",
                "expires_in": 900,  # 15 minutes
                "user": {
                    "id": "bypass-user",
                    "phone": payload.get("phone", "unknown"),
                    "name": "Bypass User",
                    "email": f"{payload.get('phone', 'unknown')}@otp.local",
                    "avatar": None,
                    "isVerified": True,
                    "createdAt": __import__('datetime').datetime.utcnow().isoformat(),
                    "updatedAt": __import__('datetime').datetime.utcnow().isoformat(),
                },
                "device": {
                    "id": "bypass-device",
                    "type": "mobile",
                    "name": "Bypass Device"
                }
            }
        return {"detail": "Invalid OTP"}
    
    app.include_router(auth_fallback, prefix="/auth", tags=["Auth"])
    app.include_router(auth_fallback, prefix="/api/v1/auth", tags=["Auth"])
    print("Loaded fallback auth routes")

# Setup API routes (moved inside lifespan after plugin loading)
import sys
print(f"Python path: {sys.path}")
try:
    from app.api.routes import setup_api_routes
    setup_api_routes(app)
    print("Successfully loaded API routes")
except ImportError as e:
    print(f"Error importing routes: {e}")
    # Try alternative import path
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("routes", "/code/app/api/routes.py")
        routes_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(routes_module)
        routes_module.setup_api_routes(app)
        print("Successfully loaded routes from alternative path")
    except Exception as e2:
        print(f"Failed alternative import: {e2}")
        # Create router directly as fallback
        from fastapi import APIRouter
        api_router = APIRouter(prefix="/api/v1")
        app.include_router(api_router)
        print("Created fallback API router")


# Configure CORS
trusted = []
if settings.TRUSTED_ORIGINS:
    trusted = [o.strip() for o in settings.TRUSTED_ORIGINS.split(',') if o.strip()]
elif settings.DEBUG:
    # Development: Allow local origins
    trusted = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8081",   # Frontend development port
        "http://localhost:19006",
        "http://localhost:19000",  # Expo default
        "http://localhost:3000",   # Common frontend port
        "http://192.168.*",        # Local network (for mobile testing)
    ]
else:
    trusted = ["https://yourdomain.com"]

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=trusted if not settings.DEBUG else ["*"],  # Allow all in debug for easier development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Import engine from session to avoid duplication
from app.db.session import async_engine as engine

# Create Redis connection (guarded for test environments where Redis
# may not be available). If creating the client raises an error (for
# example DNS resolution failure), fall back to a no-op fake Redis
# implementation so the app can be imported and tests can run without
# a real Redis server.
try:
    redis = Redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20
    )
except Exception as _e:
    # Minimal fake Redis that provides commonly used async methods and a
    # no-op close() so middleware/setup functions can be called safely
    class _FakeRedis:
        def __getattr__(self, name):
            async def _noop(*args, **kwargs):
                return None
            return _noop

        async def close(self):
            return None

    redis = _FakeRedis()

# Initialize API key manager BEFORE other middleware to ensure proper order
global api_key_manager
api_key_manager = setup_api_key_management(app, redis)

# Setup security middlewares
setup_security_middleware(app)
setup_logging_middleware(app)
setup_ip_security(app, redis)
setup_middleware(app, redis)  # Rate limiting

# Health check endpoint - No authentication required
@app.get("/health")
@app.get("/api/v1/health")  # Also available under API prefix for consistency
async def health_check(request: Request):
    """
    Production-grade health check endpoint
    Returns detailed status of system components
    """
    try:
        # Test database connection
        db_healthy = False
        try:
            async with engine.connect() as conn:
                await conn.execute("SELECT 1")
                db_healthy = True
        except Exception as e:
            print(f"Database health check failed: {e}")
        
        # Test Redis connection
        redis_healthy = False
        try:
            if hasattr(redis, 'ping'):
                await redis.ping()
                redis_healthy = True
            else:
                # Fake redis for tests
                redis_healthy = True
        except Exception as e:
            print(f"Redis health check failed: {e}")
        
        # Determine overall status
        # For frontend connectivity detection, return 200 if API is responding
        # Database issues are reported in the response but don't fail the health check
        overall_healthy = True  # API is healthy if it can respond
        status_code = 200  # Always return 200 for frontend connectivity detection
        
        return JSONResponse(
            status_code=status_code,
            content={
                "status": "healthy" if overall_healthy else "degraded",
                "app_name": settings.APP_NAME,
                "version": settings.APP_VERSION,
                "environment": settings.ENVIRONMENT,
                "debug": settings.DEBUG,
                "components": {
                    "database": "healthy" if db_healthy else "unhealthy",
                    "redis": "healthy" if redis_healthy else "unhealthy",
                },
                "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
            }
        )
    except Exception as e:
        print(f"Health check error: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
            }
        )
# Engine and Redis variables are defined here for use in the lifespan context manager


@app.get("/manifest.json")
async def pwa_manifest():
    return JSONResponse(
        {
            "name": settings.APP_NAME,
            "short_name": settings.APP_NAME,
            "start_url": "/",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#0d9488",
            "icons": [],
            "lang": "fa",
            "dir": "rtl",
        }
    )


@app.get("/service-worker.js")
async def service_worker():
    js = (
        "self.addEventListener('install', e => { self.skipWaiting(); });\n"
        "self.addEventListener('activate', e => { self.clients.claim(); });\n"
        "self.addEventListener('fetch', e => { e.respondWith(fetch(e.request).catch(() => new Response('', {status: 200}))); });\n"
    )
    return JSONResponse(js, media_type="application/javascript")