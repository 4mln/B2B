from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import os
from typing import Any

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    folder: str | None = None


@router.post("/presign")
async def presign_upload(req: PresignRequest):
    """Generate a presigned POST for direct client upload to S3.

    If S3 is not configured, return 501 so clients will fallback to server upload.
    """
    from app.storage.s3 import get_s3_client

    bucket = os.getenv("S3_BUCKET")
    if not bucket:
        raise HTTPException(status_code=501, detail="S3 not configured")

    client = get_s3_client()
    if not client:
        raise HTTPException(status_code=501, detail="S3 client not available")

    key = req.filename
    if req.folder:
        key = f"{req.folder.rstrip('/')}/{req.filename}"

    try:
        # generate presigned POST
        presigned = client.generate_presigned_post(
            Bucket=bucket,
            Key=key,
            Fields={"Content-Type": req.content_type},
            Conditions=[
                ["starts-with", "$Content-Type", req.content_type],
            ],
            ExpiresIn=3600,
        )
        return {"url": presigned["url"], "fields": presigned["fields"], "key": key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
