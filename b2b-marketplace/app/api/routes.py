# app/api/routes.py
from fastapi import APIRouter, Depends
from app.core.config import settings
from plugins.user.routes import router as user_router
from plugins.auth.routes import router as auth_router
from app.routes.auth import router as new_auth_router
from app.routes.users import router as new_users_router
from app.routes.legacy import router as legacy_router
from app.routes.offers import router as offers_router
from app.routes.ai import router as ai_router

# Create main API router
api_router = APIRouter(prefix="/api/v1")

# Import and include plugin routers
def setup_api_routes(app):
    # Register the main API router
    app.include_router(api_router)
    
    # Include new unified auth and user routes (disabled to avoid conflicts with plugin routes)
    # app.include_router(new_auth_router, prefix="/api/v1")
    app.include_router(new_users_router, prefix="/api/v1")
    
    # Include legacy compatibility routes
    app.include_router(legacy_router, prefix="/api/v1")
    
    # Include new feature routes
    app.include_router(offers_router, prefix="/api/v1")
    app.include_router(ai_router, prefix="/api/v1")
    
    # Core user routes remain under /api/v1 via their own prefixes
    app.include_router(user_router, prefix="/api/v1")
    # Auth routes are mounted by the plugin itself under both /auth and /api/v1/auth
    # The plugins will register their own routes with the app directly
    # This function is called from main.py after plugins are loaded