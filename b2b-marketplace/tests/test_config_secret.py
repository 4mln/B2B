import os
import importlib
import pytest


def test_secret_key_required_in_production(monkeypatch):
    # Directly instantiate Settings with production environment and missing SECRET_KEY
    import app.core.config as config_module

    with pytest.raises(ValueError):
        _ = config_module.Settings(SECRET_KEY=None, ENVIRONMENT="production")
