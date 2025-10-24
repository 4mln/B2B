"""
Production-grade file upload security module
Prevents path traversal, validates file types, and enforces size limits
"""
import os
import re
import hashlib
import mimetypes
from typing import Optional, Tuple
from fastapi import HTTPException, UploadFile, status
import logging

logger = logging.getLogger(__name__)

# Maximum file size: 10MB by default
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10 * 1024 * 1024))

# Allowed MIME types and extensions
ALLOWED_IMAGE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
}

ALLOWED_DOCUMENT_TYPES = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

ALL_ALLOWED_TYPES = {**ALLOWED_IMAGE_TYPES, **ALLOWED_DOCUMENT_TYPES}


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks
    
    - Removes path components (../, ../../, etc.)
    - Removes leading/trailing spaces and dots
    - Replaces dangerous characters
    - Limits length
    """
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty"
        )
    
    # Get just the filename, no path
    filename = os.path.basename(filename)
    
    # Remove any remaining path traversal attempts
    filename = filename.replace('..', '').replace('/', '').replace('\\', '')
    
    # Remove leading/trailing spaces and dots
    filename = filename.strip('. ')
    
    # Replace dangerous characters with underscores
    filename = re.sub(r'[^\w\s\-.]', '_', filename)
    
    # Collapse multiple underscores/spaces
    filename = re.sub(r'[_\s]+', '_', filename)
    
    # Limit length (preserve extension)
    name, ext = os.path.splitext(filename)
    if len(name) > 200:
        name = name[:200]
    filename = name + ext
    
    if not filename or filename == ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename after sanitization"
        )
    
    return filename


def validate_file_extension(filename: str, allowed_types: dict = ALL_ALLOWED_TYPES) -> str:
    """
    Validate file extension against allowed types
    Returns the lowercase extension
    """
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have an extension"
        )
    
    # Check if extension is in any of the allowed types
    allowed_extensions = []
    for mime_type, extensions in allowed_types.items():
        allowed_extensions.extend(extensions)
    
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' not allowed. Allowed: {', '.join(allowed_extensions)}"
        )
    
    return ext


def validate_mime_type(content_type: str, allowed_types: dict = ALL_ALLOWED_TYPES) -> str:
    """
    Validate MIME type against allowed types
    Returns the validated MIME type
    """
    if not content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content type must be specified"
        )
    
    # Normalize MIME type
    content_type = content_type.lower().split(';')[0].strip()
    
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME type '{content_type}' not allowed. Allowed: {', '.join(allowed_types.keys())}"
        )
    
    return content_type


async def validate_file_size(file: UploadFile, max_size: int = MAX_FILE_SIZE) -> int:
    """
    Validate file size by reading the file
    Returns the file size in bytes
    """
    # Read file to validate size
    content = await file.read()
    size = len(content)
    
    # Reset file pointer
    await file.seek(0)
    
    if size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({size} bytes) exceeds maximum allowed ({max_size} bytes)"
        )
    
    if size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )
    
    return size


async def validate_file_content(file: UploadFile, expected_type: str) -> bool:
    """
    Validate file content matches its declared MIME type
    Uses magic bytes to detect actual file type
    """
    # Read first 8KB for magic byte detection
    content = await file.read(8192)
    await file.seek(0)
    
    # Check magic bytes for common types
    magic_bytes = {
        b'\xFF\xD8\xFF': 'image/jpeg',
        b'\x89PNG\r\n\x1a\n': 'image/png',
        b'GIF87a': 'image/gif',
        b'GIF89a': 'image/gif',
        b'RIFF': 'image/webp',  # Partial, needs more checking
        b'%PDF': 'application/pdf',
    }
    
    detected_type = None
    for magic, mime_type in magic_bytes.items():
        if content.startswith(magic):
            detected_type = mime_type
            break
    
    # For WEBP, need to check further
    if content.startswith(b'RIFF') and b'WEBP' in content[:12]:
        detected_type = 'image/webp'
    
    if detected_type and detected_type != expected_type:
        logger.warning(
            f"File type mismatch: declared={expected_type}, detected={detected_type}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File content does not match declared type. Expected: {expected_type}, Got: {detected_type}"
        )
    
    return True


def generate_secure_filename(original_filename: str, user_id: int, prefix: str = "") -> str:
    """
    Generate a secure, unique filename
    
    Args:
        original_filename: Original filename from user
        user_id: User ID for namespacing
        prefix: Optional prefix for organization
    
    Returns:
        Secure filename with format: prefix_userid_timestamp_hash.ext
    """
    import uuid
    from datetime import datetime
    
    # Sanitize original filename
    safe_filename = sanitize_filename(original_filename)
    
    # Get extension
    _, ext = os.path.splitext(safe_filename)
    
    # Generate unique identifier
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    
    # Build secure filename
    if prefix:
        filename = f"{prefix}_{user_id}_{timestamp}_{unique_id}{ext}"
    else:
        filename = f"{user_id}_{timestamp}_{unique_id}{ext}"
    
    return filename


async def validate_upload_file(
    file: UploadFile,
    allowed_types: dict = ALL_ALLOWED_TYPES,
    max_size: int = MAX_FILE_SIZE,
    check_content: bool = True
) -> Tuple[str, str, int]:
    """
    Comprehensive file upload validation
    
    Args:
        file: The uploaded file
        allowed_types: Dictionary of allowed MIME types and extensions
        max_size: Maximum file size in bytes
        check_content: Whether to validate file content (slower but more secure)
    
    Returns:
        Tuple of (sanitized_filename, validated_mime_type, file_size)
    
    Raises:
        HTTPException: If validation fails
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # 1. Sanitize filename
    safe_filename = sanitize_filename(file.filename)
    
    # 2. Validate extension
    ext = validate_file_extension(safe_filename, allowed_types)
    
    # 3. Validate MIME type
    mime_type = validate_mime_type(file.content_type, allowed_types)
    
    # 4. Validate file size
    file_size = await validate_file_size(file, max_size)
    
    # 5. Validate file content (optional, more thorough but slower)
    if check_content:
        await validate_file_content(file, mime_type)
    
    logger.info(
        f"File validation passed: {safe_filename} "
        f"(type={mime_type}, size={file_size} bytes)"
    )
    
    return safe_filename, mime_type, file_size


def validate_upload_path(path: str, allowed_base_dirs: list) -> str:
    """
    Validate that the upload path is within allowed directories
    Prevents path traversal attacks
    
    Args:
        path: The path to validate
        allowed_base_dirs: List of allowed base directories
    
    Returns:
        Absolute, normalized path
    
    Raises:
        HTTPException: If path is invalid or outside allowed directories
    """
    # Normalize and make absolute
    abs_path = os.path.abspath(path)
    
    # Check if path is within any allowed directory
    is_allowed = False
    for base_dir in allowed_base_dirs:
        abs_base = os.path.abspath(base_dir)
        try:
            # Check if path is under base_dir
            os.path.commonpath([abs_base, abs_path])
            if abs_path.startswith(abs_base):
                is_allowed = True
                break
        except ValueError:
            # Different drives on Windows
            continue
    
    if not is_allowed:
        logger.error(f"Attempted path traversal: {path}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid upload path"
        )
    
    return abs_path


# Convenience functions for specific file types

async def validate_image_upload(file: UploadFile, max_size: int = 5 * 1024 * 1024) -> Tuple[str, str, int]:
    """Validate image file upload (max 5MB by default)"""
    return await validate_upload_file(file, ALLOWED_IMAGE_TYPES, max_size, check_content=True)


async def validate_document_upload(file: UploadFile, max_size: int = 10 * 1024 * 1024) -> Tuple[str, str, int]:
    """Validate document file upload (max 10MB by default)"""
    return await validate_upload_file(file, ALLOWED_DOCUMENT_TYPES, max_size, check_content=True)
