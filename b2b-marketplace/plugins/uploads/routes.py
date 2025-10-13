from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import os
from typing import Optional


router = APIRouter(prefix="/uploads", tags=["uploads"])


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    size: Optional[int]


class PresignResponse(BaseModel):
    url: str
    fields: Optional[dict] = None


@router.post("/presign", response_model=PresignResponse)
async def presign_upload(req: PresignRequest, current_user=None):
    """Generate a presigned S3 upload URL for the client."""
    # Lazy import to avoid circular imports during plugin discovery
    from fastapi import Depends
    from app.core.auth import get_current_user as _get_current_user

    if current_user is None:
        # Resolve dependency manually
        current_user = await _get_current_user()

    s3_bucket = os.getenv("S3_BUCKET")
    if not s3_bucket:
        raise HTTPException(status_code=503, detail="S3 not configured")

    # Build key and return presigned URL using boto3
    import boto3
    s3 = boto3.client("s3")
    key = f"uploads/{current_user.id}/{req.filename}"

    try:
        url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={"Bucket": s3_bucket, "Key": key, "ContentType": req.content_type},
            ExpiresIn=3600,
        )
        return PresignResponse(url=url)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate presigned URL")
