from fastapi.testclient import TestClient
from app.main import app
import os
import app.storage.s3 as s3module


def test_presign_returns_501_when_no_s3():
    # Ensure S3 not configured
    os.environ.pop("S3_BUCKET", None)
    client = TestClient(app, base_url="http://127.0.0.1")
    resp = client.post("/api/uploads/presign", json={"filename": "a.jpg", "content_type": "image/jpeg"})
    assert resp.status_code == 501


def test_presign_generates_presigned(monkeypatch):
    os.environ["S3_BUCKET"] = "test-bucket"

    class DummyClient:
        def generate_presigned_post(self, Bucket, Key, Fields, Conditions, ExpiresIn):
            return {"url": f"https://{Bucket}.s3.amazonaws.com", "fields": {"key": Key}}

    monkeypatch.setattr(s3module, "get_s3_client", lambda: DummyClient())
    client = TestClient(app, base_url="http://127.0.0.1")
    resp = client.post("/api/uploads/presign", json={"filename": "a.jpg", "content_type": "image/jpeg", "folder": "stores/1"})
    assert resp.status_code == 200
    body = resp.json()
    assert "url" in body and "fields" in body
from fastapi.testclient import TestClient
from app.main import app
import os
import app.storage.s3 as s3module


def test_presign_returns_501_when_no_s3():
    # Ensure S3 not configured
    os.environ.pop("S3_BUCKET", None)
    client = TestClient(app, base_url="http://127.0.0.1")
    resp = client.post("/api/uploads/presign", json={"filename": "a.jpg", "content_type": "image/jpeg"})
    assert resp.status_code == 501


def test_presign_generates_presigned(monkeypatch):
    os.environ["S3_BUCKET"] = "test-bucket"

    class DummyClient:
        def generate_presigned_post(self, Bucket, Key, Fields, Conditions, ExpiresIn):
            return {"url": f"https://{Bucket}.s3.amazonaws.com", "fields": {"key": Key}}

    monkeypatch.setattr(s3module, "get_s3_client", lambda: DummyClient())
    client = TestClient(app, base_url="http://127.0.0.1")
    resp = client.post("/api/uploads/presign", json={"filename": "a.jpg", "content_type": "image/jpeg", "folder": "stores/1"})
    assert resp.status_code == 200
    body = resp.json()
    assert "url" in body and "fields" in body
