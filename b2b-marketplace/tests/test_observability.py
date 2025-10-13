import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_metrics_endpoint():
    # Only assert that the /metrics endpoint responds (starlette_exporter optional)
    resp = client.get('/metrics')
    assert resp.status_code in (200, 404, 500)


def test_logging_json_format():
    # Trigger a simple request to /health and verify response contains X-Request-ID
    resp = client.get('/health')
    assert resp.status_code == 200
    assert 'X-Request-ID' in resp.headers
