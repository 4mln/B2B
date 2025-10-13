"""
Stores Plugin
B2B Marketplace Visual Stores for Users with Seller Capability

This plugin provides:
- Store management for users with seller capability
- Product management within stores
- Product image handling with local storage
- Public storefront access
- Store statistics and analytics

Features:
- Store creation and management
- Product catalog management
- Image upload and management
- Store activation/deactivation
- Subscription type management
- Rating aggregation
- Cloud storage ready architecture
"""

from .routes_minimal import router
from .models import Store, ProductImage, SubscriptionType
from .schemas import (
    StoreCreate, StoreUpdate, StoreOut, StoreList, StoreWithProducts,
    StoreProductCreate, StoreProductOut, StoreProductList,
    ProductImageOut, ImageUploadResponse, StoreStats
)
from .crud import StoreCRUD, StoreProductCRUD, ProductImageCRUD, ImageHandler

__all__ = [
    "router",
    "Store", "ProductImage", "SubscriptionType",
    "StoreCreate", "StoreUpdate", "StoreOut", "StoreList", "StoreWithProducts",
    "StoreProductCreate", "StoreProductOut", "StoreProductList",
    "ProductImageOut", "ImageUploadResponse", "StoreStats",
    "StoreCRUD", "StoreProductCRUD", "ProductImageCRUD", "ImageHandler"
]
