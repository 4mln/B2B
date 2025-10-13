"""Minimal seller plugin stub to satisfy cross-plugin imports during tests.

This module provides small, safe defaults so other plugins can import
`plugins.seller.*` without failing during test collection. It intentionally
avoids DB access or heavy logic.
"""
__all__ = ["schemas", "models", "crud"]

def register_routes(app):
    # No-op registration for stub plugin
    return

