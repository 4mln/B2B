"""
Compare frontend `/api/v1` endpoints against backend registered routes.
Usage: python scripts/compare_frontend_backend.py
"""
import os
import re
import sys
from pathlib import Path

# Force development environment
os.environ.setdefault("ENVIRONMENT", "development")

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

# Collect frontend endpoints by scanning for '/api/v1' and '/v1' occurrences
# Try a few likely locations for the frontend folder
possible_frontend_paths = [
    ROOT / "frontend-mobile",
    ROOT.parent / "frontend-mobile",
    Path("c:/1/frontend-mobile"),
]
frontend_dir = None
for p in possible_frontend_paths:
    if p.exists() and p.is_dir():
        frontend_dir = p
        break
if frontend_dir is None:
    print("Could not find frontend-mobile folder. Tried:")
    for p in possible_frontend_paths:
        print("  ", p)
    raise SystemExit(1)
# file extensions to scan
extensions = ["*.ts", "*.tsx", "*.js", "*.jsx"]
# keep regex simple and permissive (allow template placeholders ${...})
endpoint_re = re.compile(r"(/api/v1[^\s'\"`\)>,]*)")
endpoint_re_alt = re.compile(r"(/v1[^\s'\"`\)>,]*)")
frontend_endpoints = set()
scanned_files = 0
files_with_matches = []

for ext in extensions:
    for p in frontend_dir.rglob(ext):
        scanned_files += 1
        try:
            txt = p.read_text(encoding='utf-8')
        except Exception:
            continue
        matched_here = set()
        # find literal /api/v1 occurrences
        for m in endpoint_re.findall(txt):
            val = m.rstrip('/,)>')
            frontend_endpoints.add(val)
            matched_here.add(val)
        # find /v1 occurrences and normalize to /api/v1
        for m in endpoint_re_alt.findall(txt):
            if m.startswith('/v1'):
                val = '/api' + m
                frontend_endpoints.add(val)
                matched_here.add(val)
        if matched_here:
            files_with_matches.append((str(p.resolve()), sorted(matched_here)))

print(f"Scanned {scanned_files} frontend files; found matches in {len(files_with_matches)} files")
for fname, matches in files_with_matches:
    print(f"  {fname}: {matches}")

# also look for occurrences where API_PREFIX is concatenated; the frontend may call buildApiUrl('/products') etc.
# we'll also scan for common resource names to detect likely endpoints (products, sellers, wallet)

# Collect backend routes
backend_routes = set()
try:
    from app.main import app
    from app.core.config import settings
except Exception as e:
    print("Failed to import app:", e)
    raise

for r in app.router.routes:
    p = getattr(r, 'path', None) or getattr(r, 'url', None) or getattr(r, 'pattern', None)
    if isinstance(p, str):
        backend_routes.add(p.rstrip('\/'))

# prepare regex patterns from backend routes by replacing {param} with [^/]+
backend_patterns = []
for p in backend_routes:
    regex = re.escape(p)
    # replace escaped '{' '}' sequences
    regex = regex.replace('\{', '{').replace('\}', '}')
    regex = re.sub(r"\{[^}]+\}", "[^/]+", regex)
    regex = '^' + regex + '/?$'
    backend_patterns.append((p, re.compile(regex)))

# matching
matched = []
unmatched = []
for fe in sorted(frontend_endpoints):
    found = False
    # Try direct exact match (strip trailing slash)
    fe_norm = fe.rstrip('/')
    if fe_norm in backend_routes:
        matched.append((fe, fe_norm))
        continue
    # Try regex match against backend patterns
    for orig, pat in backend_patterns:
        if pat.match(fe_norm):
            matched.append((fe, orig))
            found = True
            break
    if not found:
        unmatched.append(fe)

# also find backend-only routes that may be missing on frontend
backend_only = sorted(list(backend_routes - set(x[1] for x in matched)))

print("Frontend endpoints found (sample up to 200):")
for e in sorted(frontend_endpoints):
    print("  ", e)

print("\nMatched endpoints (frontend -> backend route):")
for a, b in matched:
    print("  ", a, "->", b)

print("\nUnmatched frontend endpoints (likely missing on backend):")
for e in unmatched:
    print("  ", e)

print("\nBackend routes not referenced by frontend (sample up to 200):")
for p in backend_only[:200]:
    print("  ", p)

# Summary
print(f"\nSummary: frontend endpoints={len(frontend_endpoints)}, matched={len(matched)}, unmatched={len(unmatched)}, backend_routes={len(backend_routes)}")
