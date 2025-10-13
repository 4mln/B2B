import os
from datetime import timedelta

import pytest

from plugins.auth import jwt as auth_jwt
from app.core import config


def test_create_and_verify_refresh_token_contains_refresh_claim():
    payload = {"sub": "test@example.com"}
    refresh = auth_jwt.create_refresh_token(payload)
    # verify_token should return payload with 'refresh' claim
    credentials_exception = Exception("credentials")
    decoded = auth_jwt.verify_token(refresh, credentials_exception)
    assert decoded.get("sub") == "test@example.com"
    assert decoded.get("refresh") is True


def test_create_access_token_expires():
    payload = {"sub": "u1"}
    access = auth_jwt.create_access_token(payload, expires_delta=timedelta(minutes=1))
    creds_exc = Exception()
    decoded = auth_jwt.verify_token(access, creds_exc)
    assert decoded.get("sub") == "u1"
