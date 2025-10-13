"""
Stores Plugin Schemas
Pydantic models for request/response validation
"""

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field, validator
from uuid import UUID
from enum import Enum

if TYPE_CHECKING:
    from .models import Store, Product, ProductImage


class SubscriptionType(str, Enum):
    """Store subscription types"""
    FREE = "free"
    SILVER = "silver"
    GOLD = "gold"


# Base schemas
class StoreBase(BaseModel):
    """Base store schema"""
    name: str = Field(..., min_length=1, max_length=255, description="Store name")
    address: str = Field(..., min_length=1, max_length=500, description="Store address")
    subscription_type: SubscriptionType = Field(default=SubscriptionType.FREE, description="Store subscription type")

    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Store name cannot be empty')
        return v.strip()

    @validator('address')
    def validate_address(cls, v):
        if not v or not v.strip():
            raise ValueError('Store address cannot be empty')
        return v.strip()


class StoreCreate(StoreBase):
    """Schema for creating a new store"""
    banner: str = Field(..., description="Banner image path (mandatory)")


class StoreUpdate(BaseModel):
    """Schema for updating store details"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    banner: Optional[str] = None
    subscription_type: Optional[SubscriptionType] = None
    is_active: Optional[bool] = None

    @validator('name')
    def validate_name(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Store name cannot be empty')
        return v.strip() if v else v

    @validator('address')
    def validate_address(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Store address cannot be empty')
        return v.strip() if v else v


class StoreOut(StoreBase):
    """Schema for store response"""
    id: UUID
    user_id: UUID
    is_active: bool
    banner: str
    rating: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StoreList(BaseModel):
    """Schema for store list response"""
    stores: List[StoreOut]
    total: int
    page: int
    page_size: int


# Product schemas - using existing product structure
class StoreProductCreate(BaseModel):
    """Schema for adding existing product to store"""
    product_id: int = Field(..., description="ID of existing product")
    store_id: UUID = Field(..., description="Store ID")


class StoreProductOut(BaseModel):
    """Schema for product in store response"""
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    status: str
    store_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    images: List['ProductImageOut'] = []

    class Config:
        from_attributes = True


class StoreProductList(BaseModel):
    """Schema for store product list response"""
    products: List[StoreProductOut]
    total: int
    page: int
    page_size: int


# Product Image schemas
class ProductImageBase(BaseModel):
    """Base product image schema"""
    url: str = Field(..., description="Image file path")
    is_primary: bool = Field(default=False, description="Primary image flag")


class ProductImageCreate(ProductImageBase):
    """Schema for creating a new product image"""
    pass


class ProductImageUpdate(BaseModel):
    """Schema for updating product image"""
    is_primary: Optional[bool] = None


class ProductImageOut(ProductImageBase):
    """Schema for product image response"""
    id: UUID
    product_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Store with products schema
class StoreWithProducts(StoreOut):
    """Schema for store with products"""
    products: List[StoreProductOut] = []


# Image upload response
class ImageUploadResponse(BaseModel):
    """Schema for image upload response"""
    id: UUID
    url: str
    is_primary: bool
    message: str


# Store statistics schema
class StoreStats(BaseModel):
    """Schema for store statistics"""
    total_products: int
    active_products: int
    total_images: int
    average_rating: float
    subscription_type: SubscriptionType


# Forward references are handled by TYPE_CHECKING
