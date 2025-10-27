from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

# Optional plugin schema imports — some test runs and environments
# may not have these plugins available. Import them defensively and
# fall back to `Any` so this module can be imported during test
# collection without failing the whole test run.
try:
    from plugins.gamification.schemas import GamificationProgress
except Exception:
    GamificationProgress = Any

class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    # Use generic Any for optional plugin relations so this schema can be
    # imported even when those plugins are not installed or not loadable
    gamification: Optional[Any] = None

    model_config = {"from_attributes": True}


UserOut.model_rebuild()  # keep for backward compatibility