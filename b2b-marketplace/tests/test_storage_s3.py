import io
import os
from unittest import mock

from app.storage.s3 import upload_fileobj_to_s3


def test_upload_fileobj_to_s3_fallback_when_no_bucket(monkeypatch):
    buf = io.BytesIO(b"hello")
    url = upload_fileobj_to_s3(buf, None, "key.jpg", content_type="image/jpeg")
    assert url is None


def test_upload_fileobj_to_s3_calls_boto3(monkeypatch):
    buf = io.BytesIO(b"hello")

    class DummyClient:
        def __init__(self):
            self.calls = []
        def upload_fileobj(self, Fileobj, Bucket, Key, ExtraArgs=None):
            assert Bucket == "test-bucket"
            assert Key == "key.jpg"
            if ExtraArgs:
                assert ExtraArgs.get("ContentType") == "image/jpeg"
            # consume Fileobj
            try:
                Fileobj.read()
            except Exception:
                pass
            return True

    dummy = DummyClient()

    monkeypatch.setenv("AWS_REGION", "us-east-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "AKIAFAKE")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "FAKESECRET")

    # Patch the internal get_s3_client factory to return our dummy client
    import app.storage.s3 as s3module
    monkeypatch.setattr(s3module, "get_s3_client", lambda: dummy)
    # Set S3_DOMAIN so upload_fileobj_to_s3 returns an HTTPS URL
    monkeypatch.setenv("S3_DOMAIN", "test-bucket.s3.us-east-1.amazonaws.com")

    url = upload_fileobj_to_s3(buf, "test-bucket", "key.jpg", content_type="image/jpeg")
    assert url == "https://test-bucket.s3.us-east-1.amazonaws.com/key.jpg"
