import imghdr
from typing import BinaryIO


ALLOWED_IMAGE_TYPES = {"jpeg", "png", "gif", "webp"}
MAX_UPLOAD_SIZE_BYTES = int(10 * 1024 * 1024)  # 10 MB default


def detect_image_type(fileobj: BinaryIO) -> str | None:
    """Detect image type using magic bytes (imghdr). Returns 'jpeg', 'png', etc or None."""
    try:
        pos = fileobj.tell()
    except Exception:
        pos = None

    try:
        header = fileobj.read(512)
        kind = imghdr.what(None, h=header)
        return kind
    finally:
        try:
            if pos is not None:
                fileobj.seek(pos)
            else:
                fileobj.seek(0)
        except Exception:
            pass


def validate_image_file(fileobj: BinaryIO, content_type: str | None = None) -> bool:
    """Validate image by magic bytes and content length."""
    kind = detect_image_type(fileobj)
    if not kind:
        return False
    if kind not in ALLOWED_IMAGE_TYPES:
        return False

    # Optionally size check if fileobj supports tell
    try:
        pos = fileobj.tell()
        fileobj.seek(0, 2)
        size = fileobj.tell()
        fileobj.seek(pos)
        if size > MAX_UPLOAD_SIZE_BYTES:
            return False
    except Exception:
        # If we can't determine size, skip size check (client should limit)
        pass

    return True
"""File validation helpers for uploads."""
import imghdr
from typing import BinaryIO


def is_image(fileobj: BinaryIO) -> bool:
    try:
        fileobj.seek(0)
        header = fileobj.read(512)
        fileobj.seek(0)
        kind = imghdr.what(None, h=header)
        return kind is not None
    except Exception:
        return False


def enforce_size_limit(fileobj: BinaryIO, max_bytes: int) -> bool:
    try:
        fileobj.seek(0, 2)
        size = fileobj.tell()
        fileobj.seek(0)
        return size <= max_bytes
    except Exception:
        return False
