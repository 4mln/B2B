from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional

from app.core.config import settings
from .models import User
from .schemas import UserCreate, UserOut, TokenResponse
from .jwt import create_token_pair, verify_token
from .security import get_password_hash, verify_password
from twilio.rest import Client  # Assuming Twilio for SMS
import os
from fastapi import UploadFile, File
import random
from datetime import timedelta, datetime

from sqlalchemy import update

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token, credentials_exception)
    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception
    
    user = await db.get(User, int(user_id))
    if not user or not user.is_active:
        raise credentials_exception
    
    return user

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    # Check if user already exists
    existing_user = await db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

@router.post("/token", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    # Authenticate user
    user = await db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    
    # Create access and refresh tokens
    token_data = {"sub": str(user.id)}
    return create_token_pair(token_data)

@router.post("/send-otp")
async def send_otp(phone: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    otp = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=10)
    await db.execute(update(User).where(User.id == current_user.id).values(otp_code=otp, otp_expiry=expiry))
    await db.commit()
    # Send SMS via Twilio
    client = Client(os.environ['TWILIO_SID'], os.environ['TWILIO_TOKEN'])
    message = client.messages.create(body=f"Your OTP is {otp}", from_=os.environ['TWILIO_PHONE'], to=phone)
    return {"message": "OTP sent"}

@router.post("/verify-otp")
async def verify_otp(otp: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    if current_user.otp_code != otp or current_user.otp_expiry < datetime.now():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    await db.execute(update(User).where(User.id == current_user.id).values(kyc_status="otp_verified", otp_code=None, otp_expiry=None))
    await db.commit()
    return {"message": "OTP verified"}

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    """
    Upload KYC document (secure implementation)
    """
    if current_user.kyc_status != "otp_verified":
        raise HTTPException(status_code=400, detail="Complete OTP verification first")
    
    # Security: Validate file upload
    from app.core.file_security import validate_document_upload, generate_secure_filename, validate_upload_path
    
    # Validate file (max 10MB for documents)
    safe_filename, mime_type, file_size = await validate_document_upload(file, max_size=10 * 1024 * 1024)
    
    # Generate secure filename
    secure_filename = generate_secure_filename(safe_filename, current_user.id, prefix="kyc_doc")
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.abspath("uploads/documents")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Validate path to prevent traversal
    file_path = os.path.join(upload_dir, secure_filename)
    file_path = validate_upload_path(file_path, [upload_dir])
    
    # Save file securely
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update user record
    await db.execute(update(User).where(User.id == current_user.id).values(
        id_document=file_path,
        kyc_status="verified"
    ))
    await db.commit()
    
    return {
        "message": "Document uploaded and KYC completed",
        "filename": secure_filename,
        "size": file_size,
        "type": mime_type
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session)):
    try:
        payload = verify_token(refresh_token, HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        ))
        
        # Verify it's a refresh token
        if not payload.get("refresh"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Get user and verify account status
        user_id = payload.get("sub")
        user = await db.get(User, int(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new token pair
        token_data = {"sub": str(user.id)}
        return create_token_pair(token_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )

class Plugin:
    def __init__(self):
        self.router = router
    
    async def init_db(self, engine):
        # Database initialization logic here
        pass
    
    async def shutdown(self):
        # Cleanup logic here
        pass