from typing import Any
from app.core.plugins.base import PluginBase
from . import routes


class Plugin(PluginBase):
    slug = "uploads"
    version = "0.1.0"

    def register_routes(self, app: Any):
        app.include_router(routes.router)
