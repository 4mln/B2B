from sqlalchemy.orm import declarative_base

# Keep only the declarative base here
Base = declarative_base()


def load_core_models() -> None:
    """Load core application models when the whole app is starting up.

    Call this from app startup (or Alembic env) to ensure core tables
    are mapped without interfering with plugin-specific initialization.
    """
    import app.models.device  # noqa: F401
    import app.models.user  # noqa: F401


__all__ = ["Base", "load_core_models"]
