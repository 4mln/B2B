from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    yield

# plugins/user/__init__.py
from fastapi import FastAPI, APIRouter
from app.core.plugins.base import PluginBase, PluginConfig
import builtins


class Config(PluginConfig):
    """Config schema for User plugin"""
    max_users: int = 5000
    enable_email_verification: bool = True
    enable_2fa: bool = False


class Plugin(PluginBase):
    slug = "user"
    version = "0.1.0"
    dependencies: list[str] = []
    ConfigModel = Config

    def __init__(self, config: Config | None = None):
        super().__init__(config=config)

        from plugins.user.routes import router as user_router

        # Register the plugin's router directly. The router defined in
        # `plugins.user.routes` already uses the '/users' prefix, so adding
        # another prefix here would produce paths like '/user/users/...'
        # which the tests expect not to use. Assign the router directly so
        # the loader registers the correct paths.
        self.router = user_router

    def register_routes(self, app: FastAPI):
        app.include_router(self.router)

    def register_events(self, app: FastAPI):
        
        async def startup():
            print(f"[{self.slug}] plugin ready with config:", self.config.dict())

        
        async def shutdown():
            print(f"[{self.slug}] plugin shutting down")

    async def init_db(self, engine):
        # Optional async DB initialization
        pass