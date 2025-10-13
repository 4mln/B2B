"""S3 storage helper with local fallback.

Provides upload_fileobj_to_s3(fileobj, bucket, key, content_type) -> public URL or None
"""
import os
import logging
from typing import BinaryIO, Optional

logger = logging.getLogger(__name__)


def _s3_client():
    try:
        import boto3
    except Exception:
        return None
    aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION")
    if aws_access_key and aws_secret:
        return boto3.client(
            "s3",
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret,
            region_name=region,
        )
    # Fallback to default credential chain
    return boto3.client("s3")


def upload_fileobj_to_s3(fileobj: BinaryIO, bucket: Optional[str], key: str, content_type: str = "application/octet-stream") -> Optional[str]:
    """Upload file-like object to S3 and return public URL or None on failure.

    If `bucket` is None or boto3 is unavailable, return None to trigger local fallback.
    """
    if not bucket:
        logger.debug("S3 bucket not configured; skipping S3 upload")
        return None

    client = _s3_client()
    if not client:
        logger.debug("boto3 not available; skipping S3 upload")
        return None

    try:
        # Ensure fileobj is at start
        try:
            fileobj.seek(0)
        except Exception:
            pass

        client.put_object(Bucket=bucket, Key=key, Body=fileobj.read(), ContentType=content_type)

        # Build URL (assumes public-read or bucket policy)
        region = os.getenv("AWS_REGION")
        if region:
            url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
        else:
            url = f"https://{bucket}.s3.amazonaws.com/{key}"
        return url
    except Exception as e:
        logger.exception("Failed to upload to S3: %s", e)
        return None
import os
import logging
from typing import Optional

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except Exception:
    boto3 = None

logger = logging.getLogger(__name__)


def get_s3_client():
    if not boto3:
        return None
    aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION", "us-east-1")
    session = boto3.session.Session()
    client = session.client(
        "s3",
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret,
        region_name=region,
    )
    return client


def upload_fileobj_to_s3(fileobj, bucket: str, key: str, content_type: Optional[str] = None) -> Optional[str]:
    """Upload file-like object to S3 and return URL. Returns None on failure or if S3 not configured."""
    client = get_s3_client()
    if not client or not bucket:
        logger.debug("S3 client or bucket not configured; skipping S3 upload")
        return None

    extra_args = {}
    if content_type:
        extra_args["ContentType"] = content_type

    try:
        client.upload_fileobj(fileobj, bucket, key, ExtraArgs=extra_args or None)
        # Construct URL (assuming public-read or CDN in front)
        domain = os.getenv("S3_DOMAIN")
        if domain:
            return f"https://{domain}/{key}"
        return f"s3://{bucket}/{key}"
    except (BotoCoreError, ClientError) as e:
        logger.exception("Failed to upload to S3: %s", e)
        return None
