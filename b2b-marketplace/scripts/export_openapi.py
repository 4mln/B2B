import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

resp = client.get('/openapi.json')
if resp.status_code != 200:
    print('OpenAPI schema not available (status:', resp.status_code, ')')
    exit(1)

spec = resp.json()

out = []
out.append('# API Documentation (auto-generated)')
for path, methods in spec.get('paths', {}).items():
    out.append(f'## {path}')
    for method, info in methods.items():
        summary = info.get('summary', '')
        desc = info.get('description', '')
        out.append(f'### {method.upper()} - {summary}')
        if desc:
            out.append(desc)
        out.append('')

p = Path('docs')
p.mkdir(exist_ok=True)
Path('docs/export.md').write_text('\n'.join(out))
print('Wrote docs/export.md')
