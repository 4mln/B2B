# app/db/base.py
# Define Base here to avoid circular imports
from sqlalchemy.orm import declarative_base
import importlib
import pkgutil
import plugins  # your plugins package

# Base class for models (needed for Alembic autogenerate)
Base = declarative_base()

# Import core models
from app.models.user import User
from app.models.device import Device, OTPCode

# Exclude legacy plugins after migration
excluded_plugins = {"seller", "buyer"}

for _, module_name, _ in pkgutil.iter_modules(plugins.__path__):
    if module_name in excluded_plugins:
        continue  # Skip legacy plugins
    try:
        importlib.import_module(f"plugins.{module_name}.models")
    except ModuleNotFoundError:
        pass

# Re-export for backward compatibility
__all__ = ["Base"]
