import os
import importlib
import sys

# Ensure development environment so SECRET_KEY enforcement doesn't block imports
os.environ.setdefault("ENVIRONMENT", "development")

# Add project root to path
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

try:
    from app.main import app
    from app.core.config import settings
except Exception as e:
    print("ERROR importing app:", type(e).__name__, e)
    raise

prefix = settings.API_PREFIX or "/api/v1"
print(f"Using API prefix: {prefix}\n")

routes = []
for r in app.routes:
    # FastAPI router routes have .path and .methods; starlette routes may differ.
    path = getattr(r, "path", None) or getattr(r, "url", None) or getattr(r, "pattern", None)
    methods = getattr(r, "methods", None) or getattr(r, "methods_set", None)
    if not path:
        continue
    if isinstance(path, str) and path.startswith(prefix):
        routes.append((path, methods))

if not routes:
    print(f"No routes found under prefix {prefix} — available routes (first 50):\n")
    # show some sample routes
    for r in app.routes[:50]:
        p = getattr(r, "path", None) or getattr(r, "url", None) or getattr(r, "pattern", None)
        print(p)
else:
    print(f"Found {len(routes)} routes under {prefix}:\n")
    for p, methods in routes:
        print(p, methods)
