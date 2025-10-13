from pydantic import BaseModel
from typing import Optional


class SellerOut(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None

