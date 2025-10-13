"""
Stores Plugin CRUD Operations
Database operations for stores, products, and images
"""

import os
import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, UploadFile
from app.models.user import User
from .models import Store, ProductImage, SubscriptionType
from .schemas import StoreCreate, StoreUpdate, StoreProductCreate, ProductImageCreate


class StoreCRUD:
    """CRUD operations for stores"""

    @staticmethod
    async def create_store(
        db: AsyncSession, 
        store_data: StoreCreate, 
        user_id: uuid.UUID
    ) -> Store:
        """Create a new store"""
        # Check if user already has a store
        existing_store = await db.execute(
            select(Store).where(Store.user_id == user_id)
        )
        if existing_store.scalar_one_or_none():
            raise HTTPException(
                status_code=400, 
                detail="User already has a store"
            )
        
        store = Store(
            user_id=user_id,
            name=store_data.name,
            address=store_data.address,
            banner=store_data.banner,
            subscription_type=store_data.subscription_type
        )
        
        db.add(store)
        await db.commit()
        await db.refresh(store)
        return store

    @staticmethod
    async def get_store(db: AsyncSession, store_id: uuid.UUID) -> Optional[Store]:
        """Get store by ID"""
        result = await db.execute(
            select(Store).where(Store.id == store_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_store_with_products(db: AsyncSession, store_id: uuid.UUID) -> Optional[Store]:
        """Get store with products"""
        result = await db.execute(
            select(Store)
            .options(selectinload(Store.products).selectinload(Product.images))
            .where(Store.id == store_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_stores(
        db: AsyncSession,
        user_id: Optional[uuid.UUID] = None,
        subscription_type: Optional[SubscriptionType] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 10
    ) -> Tuple[List[Store], int]:
        """Get stores with filtering and pagination"""
        query = select(Store)
        
        # Apply filters
        if user_id:
            query = query.where(Store.user_id == user_id)
        if subscription_type:
            query = query.where(Store.subscription_type == subscription_type)
        if is_active is not None:
            query = query.where(Store.is_active == is_active)
        
        # Get total count
        count_query = select(func.count(Store.id))
        if user_id:
            count_query = count_query.where(Store.user_id == user_id)
        if subscription_type:
            count_query = count_query.where(Store.subscription_type == subscription_type)
        if is_active is not None:
            count_query = count_query.where(Store.is_active == is_active)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        result = await db.execute(query)
        stores = result.scalars().all()
        
        return list(stores), total

    @staticmethod
    async def update_store(
        db: AsyncSession, 
        store_id: uuid.UUID, 
        store_data: StoreUpdate
    ) -> Optional[Store]:
        """Update store details"""
        store = await StoreCRUD.get_store(db, store_id)
        if not store:
            return None
        
        update_data = store_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(store, field, value)
        
        await db.commit()
        await db.refresh(store)
        return store

    @staticmethod
    async def delete_store(db: AsyncSession, store_id: uuid.UUID) -> bool:
        """Delete store"""
        store = await StoreCRUD.get_store(db, store_id)
        if not store:
            return False
        
        await db.delete(store)
        await db.commit()
        return True

    @staticmethod
    async def get_user_store(db: AsyncSession, user_id: uuid.UUID) -> Optional[Store]:
        """Get store by user ID"""
        result = await db.execute(
            select(Store).where(Store.user_id == user_id)
        )
        return result.scalar_one_or_none()


class StoreProductCRUD:
    """CRUD operations for store products (integrating with existing products)"""

    @staticmethod
    async def add_product_to_store(
        db: AsyncSession, 
        product_id: int, 
        store_id: uuid.UUID
    ) -> bool:
        """Add existing product to store"""
        # Import here to avoid circular imports
        from plugins.products.models import Product
        
        # Get the product
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        
        if not product:
            return False
        
        # Update product with store_id
        product.store_id = store_id
        await db.commit()
        return True

    @staticmethod
    async def remove_product_from_store(
        db: AsyncSession, 
        product_id: int, 
        store_id: uuid.UUID
    ) -> bool:
        """Remove product from store"""
        # Import here to avoid circular imports
        from plugins.products.models import Product
        
        # Get the product
        result = await db.execute(
            select(Product).where(
                Product.id == product_id,
                Product.store_id == store_id
            )
        )
        product = result.scalar_one_or_none()
        
        if not product:
            return False
        
        # Remove store_id from product
        product.store_id = None
        await db.commit()
        return True

    @staticmethod
    async def get_store_products(
        db: AsyncSession,
        store_id: uuid.UUID,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> Tuple[List, int]:
        """Get products in store with filtering and pagination"""
        # Import here to avoid circular imports
        from plugins.products.models import Product
        
        query = select(Product).where(Product.store_id == store_id)
        
        if status:
            query = query.where(Product.status == status)
        
        # Get total count
        count_query = select(func.count(Product.id)).where(Product.store_id == store_id)
        if status:
            count_query = count_query.where(Product.status == status)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        result = await db.execute(query)
        products = result.scalars().all()
        
        return list(products), total

    @staticmethod
    async def get_store_product(
        db: AsyncSession, 
        product_id: int, 
        store_id: uuid.UUID
    ) -> Optional:
        """Get product in store"""
        # Import here to avoid circular imports
        from plugins.products.models import Product
        
        result = await db.execute(
            select(Product).where(
                Product.id == product_id,
                Product.store_id == store_id
            )
        )
        return result.scalar_one_or_none()


class ProductImageCRUD:
    """CRUD operations for product images"""

    @staticmethod
    async def create_image(
        db: AsyncSession, 
        product_id: uuid.UUID, 
        image_url: str,
        is_primary: bool = False
    ) -> ProductImage:
        """Create a new product image"""
        # If this is set as primary, unset other primary images
        if is_primary:
            await db.execute(
                select(ProductImage)
                .where(ProductImage.product_id == product_id)
                .update({ProductImage.is_primary: False})
            )
        
        image = ProductImage(
            product_id=product_id,
            url=image_url,
            is_primary=is_primary
        )
        
        db.add(image)
        await db.commit()
        await db.refresh(image)
        return image

    @staticmethod
    async def get_images(db: AsyncSession, product_id: uuid.UUID) -> List[ProductImage]:
        """Get all images for a product"""
        result = await db.execute(
            select(ProductImage).where(ProductImage.product_id == product_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_primary_image(db: AsyncSession, product_id: uuid.UUID) -> Optional[ProductImage]:
        """Get primary image for a product"""
        result = await db.execute(
            select(ProductImage)
            .where(ProductImage.product_id == product_id)
            .where(ProductImage.is_primary == True)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def set_primary_image(
        db: AsyncSession, 
        image_id: uuid.UUID
    ) -> Optional[ProductImage]:
        """Set an image as primary"""
        image = await db.execute(
            select(ProductImage).where(ProductImage.id == image_id)
        )
        image = image.scalar_one_or_none()
        if not image:
            return None
        
        # Unset other primary images for this product
        await db.execute(
            select(ProductImage)
            .where(ProductImage.product_id == image.product_id)
            .update({ProductImage.is_primary: False})
        )
        
        # Set this image as primary
        image.is_primary = True
        await db.commit()
        await db.refresh(image)
        return image

    @staticmethod
    async def delete_image(db: AsyncSession, image_id: uuid.UUID) -> bool:
        """Delete product image"""
        image = await db.execute(
            select(ProductImage).where(ProductImage.id == image_id)
        )
        image = image.scalar_one_or_none()
        if not image:
            return False
        
        await db.delete(image)
        await db.commit()
        return True


class ImageHandler:
    """Handle image uploads and storage"""

    @staticmethod
    async def save_uploaded_file(
        upload_file: UploadFile, 
        store_id: uuid.UUID, 
        product_id: uuid.UUID
    ) -> str:
        """Save uploaded file to S3 if configured, otherwise local storage

        Returns a URL or a local file path.
        """
        from app.storage.s3 import upload_fileobj_to_s3

        # Generate unique filename
        file_extension = upload_file.filename.split('.')[-1] if '.' in upload_file.filename else 'jpg'
        filename = f"{uuid.uuid4().hex}.{file_extension}"
        key = f"stores/{store_id}/products/{product_id}/{filename}"

        # Try S3 upload first
        upload_file.file.seek(0)
        s3_bucket = os.getenv("S3_BUCKET")
        url = upload_fileobj_to_s3(upload_file.file, s3_bucket, key, content_type=upload_file.content_type)
        if url:
            return url

        # Fallback to local storage
        upload_dir = f"uploads/stores/{store_id}/products/{product_id}"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as buffer:
            upload_file.file.seek(0)
            buffer.write(await upload_file.read())

        return file_path

    @staticmethod
    async def delete_image_file(image_url: str) -> bool:
        """Delete image file from storage"""
        try:
            if os.path.exists(image_url):
                os.remove(image_url)
                return True
            return False
        except Exception:
            return False
