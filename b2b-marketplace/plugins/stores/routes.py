"""
Stores Plugin Routes
API endpoints for store management and public storefront
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
# Note: These imports will be available when the plugin is loaded by the main application
try:
    from app.core.deps import get_db, get_current_user
    from app.models.user import User
    from app.core.plugin_capabilities import check_user_capability
except ImportError:
    # Fallback for standalone testing
    get_db = None
    get_current_user = None
    User = None
    check_user_capability = None
from .models import Store, Product, ProductImage, SubscriptionType
from .schemas import (
    StoreCreate, StoreUpdate, StoreOut, StoreList, StoreWithProducts,
    ProductCreate, ProductUpdate, ProductOut, ProductList,
    ProductImageOut, ImageUploadResponse, StoreStats
)
from .crud import StoreCRUD, ProductCRUD, ProductImageCRUD, ImageHandler

router = APIRouter(prefix="/stores", tags=["stores"])


# Store routes
@router.get("/", response_model=StoreList)
async def list_stores(
    user_id: Optional[uuid.UUID] = Query(None, description="Filter by user ID"),
    subscription_type: Optional[SubscriptionType] = Query(None, description="Filter by subscription type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db)
):
    """List all stores with optional filtering"""
    stores, total = await StoreCRUD.get_stores(
        db=db,
        user_id=user_id,
        subscription_type=subscription_type,
        is_active=is_active,
        page=page,
        page_size=page_size
    )
    
    return StoreList(
        stores=stores,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{store_id}", response_model=StoreWithProducts)
async def get_store(
    store_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get store details with products"""
    store = await StoreCRUD.get_store_with_products(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store


@router.post("/create", response_model=StoreOut)
async def create_store(
    store_data: StoreCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new store (seller only)"""
    # Check if user has seller capability
    if not await check_user_capability(current_user.id, "can_manage_store", db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with seller capability can create stores"
        )
    
    store = await StoreCRUD.create_store(db, store_data, current_user.id)
    return store


@router.put("/{store_id}/update", response_model=StoreOut)
async def update_store(
    store_id: uuid.UUID,
    store_data: StoreUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update store details"""
    # Check if user owns the store or has admin capability
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        if not await check_user_capability(current_user.id, "can_manage_store", db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own store"
            )
    
    updated_store = await StoreCRUD.update_store(db, store_id, store_data)
    if not updated_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return updated_store


@router.patch("/{store_id}/activate")
async def activate_store(
    store_id: uuid.UUID,
    is_active: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Activate/deactivate store"""
    # Check if user owns the store or has admin capability
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        if not await check_user_capability(current_user.id, "can_manage_store", db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only manage your own store"
            )
    
    store_data = StoreUpdate(is_active=is_active)
    updated_store = await StoreCRUD.update_store(db, store_id, store_data)
    
    return {
        "message": f"Store {'activated' if is_active else 'deactivated'} successfully",
        "store_id": store_id,
        "is_active": is_active
    }


# Product routes
@router.get("/{store_id}/products", response_model=ProductList)
async def list_products(
    store_id: uuid.UUID,
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db)
):
    """List products in store"""
    # Check if store exists
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    products, total = await ProductCRUD.get_products(
        db=db,
        store_id=store_id,
        is_active=is_active,
        page=page,
        page_size=page_size
    )
    
    return ProductList(
        products=products,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{store_id}/products/{product_id}", response_model=ProductOut)
async def get_product(
    store_id: uuid.UUID,
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get product details"""
    # Check if store exists
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    product = await ProductCRUD.get_product(db, product_id)
    if not product or product.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.post("/{store_id}/products", response_model=ProductOut)
async def create_product(
    store_id: uuid.UUID,
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new product in store"""
    # Check if store exists and user owns it
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add products to your own store"
        )
    
    product = await ProductCRUD.create_product(db, product_data, store_id)
    return product


@router.put("/{store_id}/products/{product_id}", response_model=ProductOut)
async def update_product(
    store_id: uuid.UUID,
    product_id: uuid.UUID,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update product details"""
    # Check if store exists and user owns it
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update products in your own store"
        )
    
    product = await ProductCRUD.get_product(db, product_id)
    if not product or product.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    updated_product = await ProductCRUD.update_product(db, product_id, product_data)
    return updated_product


@router.delete("/{store_id}/products/{product_id}")
async def delete_product(
    store_id: uuid.UUID,
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete product"""
    # Check if store exists and user owns it
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete products from your own store"
        )
    
    success = await ProductCRUD.delete_product(db, product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return {"message": "Product deleted successfully"}


# Product Image routes
@router.get("/{store_id}/products/{product_id}/images", response_model=List[ProductImageOut])
async def list_product_images(
    store_id: uuid.UUID,
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """List product images"""
    # Check if store and product exist
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    product = await ProductCRUD.get_product(db, product_id)
    if not product or product.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    images = await ProductImageCRUD.get_images(db, product_id)
    return images


@router.post("/{store_id}/products/{product_id}/images", response_model=ImageUploadResponse)
async def upload_product_image(
    store_id: uuid.UUID,
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    is_primary: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload product image"""
    # Check if store exists and user owns it
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload images to products in your own store"
        )
    
    # Check if product exists
    product = await ProductCRUD.get_product(db, product_id)
    if not product or product.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Save file
    image_url = await ImageHandler.save_uploaded_file(file, store_id, product_id)
    
    # Create image record
    image = await ProductImageCRUD.create_image(db, product_id, image_url, is_primary)
    
    return ImageUploadResponse(
        id=image.id,
        url=image.url,
        is_primary=image.is_primary,
        message="Image uploaded successfully"
    )


@router.patch("/{store_id}/products/{product_id}/images/{image_id}/primary")
async def set_primary_image(
    store_id: uuid.UUID,
    product_id: uuid.UUID,
    image_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Set product image as primary"""
    # Check if store exists and user owns it
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage images in your own store"
        )
    
    # Check if product exists
    product = await ProductCRUD.get_product(db, product_id)
    if not product or product.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    image = await ProductImageCRUD.set_primary_image(db, image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return {"message": "Primary image set successfully"}


@router.delete("/{store_id}/products/{product_id}/images/{image_id}")
async def delete_product_image(
    store_id: uuid.UUID,
    product_id: uuid.UUID,
    image_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete product image"""
    # Check if store exists and user owns it
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete images from your own store"
        )
    
    # Get image to delete file
    image = await db.execute(
        select(ProductImage).where(ProductImage.id == image_id)
    )
    image = image.scalar_one_or_none()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Delete file
    await ImageHandler.delete_image_file(image.url)
    
    # Delete image record
    success = await ProductImageCRUD.delete_image(db, image_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return {"message": "Image deleted successfully"}


# Store statistics route
@router.get("/{store_id}/stats", response_model=StoreStats)
async def get_store_stats(
    store_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get store statistics"""
    # Check if store exists and user owns it
    store = await StoreCRUD.get_store(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    if store.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view statistics for your own store"
        )
    
    # Get store with products
    store_with_products = await StoreCRUD.get_store_with_products(db, store_id)
    
    total_products = len(store_with_products.products)
    active_products = len([p for p in store_with_products.products if p.is_active])
    total_images = sum(len(p.images) for p in store_with_products.products)
    
    return StoreStats(
        total_products=total_products,
        active_products=active_products,
        total_images=total_images,
        average_rating=store.rating,
        subscription_type=store.subscription_type
    )
