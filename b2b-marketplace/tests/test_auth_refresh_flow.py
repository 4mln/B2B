import pytest
from plugins.auth import jwt as auth_jwt
from fastapi import HTTPException


def test_refresh_rotation_creates_new_tokens():
    payload = {"sub": "user@example.com"}
    tokens = auth_jwt.create_token_pair(payload)
    assert "access_token" in tokens and "refresh_token" in tokens

    # Verify old refresh token decodes
    creds_exc = HTTPException(status_code=401, detail="invalid")
    decoded = auth_jwt.verify_token(tokens["refresh_token"], creds_exc)
    assert decoded.get("refresh") is True

    # Rotate using helper
    new_tokens = auth_jwt.rotate_refresh_token(tokens["refresh_token"])
    assert "access_token" in new_tokens and "refresh_token" in new_tokens
    # New refresh token should be different
    assert new_tokens["refresh_token"] != tokens["refresh_token"]
