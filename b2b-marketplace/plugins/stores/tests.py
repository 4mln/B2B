"""
Stores Plugin Unit Tests
Basic CRUD tests for stores, products, and images
"""

import pytest
import uuid
import tempfile
import os
from unittest.mock import AsyncMock, patch
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from io import BytesIO

from .models import Store, Product, ProductImage, SubscriptionType
from .schemas import StoreCreate, StoreUpdate, ProductCreate, ProductUpdate
from .crud import StoreCRUD, ProductCRUD, ProductImageCRUD, ImageHandler


class TestStoreCRUD:
    """Test store CRUD operations"""
    
    @pytest.mark.asyncio
    async def test_create_store(self):
        """Test store creation"""
        db = AsyncMock(spec=AsyncSession)
        user_id = uuid.uuid4()
        
        store_data = StoreCreate(
            name="Test Store",
            address="123 Test Street",
            banner="/uploads/banner.jpg",
            subscription_type=SubscriptionType.FREE
        )
        
        # Mock database operations
        db.execute = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        
        # Mock no existing store
        db.execute.return_value.scalar_one_or_none.return_value = None
        
        store = await StoreCRUD.create_store(db, store_data, user_id)
        
        assert store.user_id == user_id
        assert store.name == "Test Store"
        assert store.address == "123 Test Street"
        assert store.banner == "/uploads/banner.jpg"
        assert store.subscription_type == SubscriptionType.FREE
        assert store.is_active is True
        assert store.rating == 0.0

    @pytest.mark.asyncio
    async def test_get_store(self):
        """Test getting store by ID"""
        db = AsyncMock(spec=AsyncSession)
        store_id = uuid.uuid4()
        
        mock_store = Store(
            id=store_id,
            user_id=uuid.uuid4(),
            name="Test Store",
            address="123 Test Street",
            banner="/uploads/banner.jpg"
        )
        
        db.execute.return_value.scalar_one_or_none.return_value = mock_store
        
        store = await StoreCRUD.get_store(db, store_id)
        
        assert store is not None
        assert store.id == store_id
        assert store.name == "Test Store"

    @pytest.mark.asyncio
    async def test_get_stores_with_filters(self):
        """Test getting stores with filters"""
        db = AsyncMock(spec=AsyncSession)
        user_id = uuid.uuid4()
        
        mock_stores = [
            Store(id=uuid.uuid4(), user_id=user_id, name="Store 1"),
            Store(id=uuid.uuid4(), user_id=user_id, name="Store 2")
        ]
        
        db.execute.return_value.scalars.return_value.all.return_value = mock_stores
        db.execute.return_value.scalar.return_value = 2
        
        stores, total = await StoreCRUD.get_stores(
            db=db,
            user_id=user_id,
            page=1,
            page_size=10
        )
        
        assert len(stores) == 2
        assert total == 2

    @pytest.mark.asyncio
    async def test_update_store(self):
        """Test updating store"""
        db = AsyncMock(spec=AsyncSession)
        store_id = uuid.uuid4()
        
        mock_store = Store(
            id=store_id,
            user_id=uuid.uuid4(),
            name="Old Name",
            address="Old Address"
        )
        
        db.execute.return_value.scalar_one_or_none.return_value = mock_store
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        
        update_data = StoreUpdate(
            name="New Name",
            address="New Address"
        )
        
        updated_store = await StoreCRUD.update_store(db, store_id, update_data)
        
        assert updated_store is not None
        assert updated_store.name == "New Name"
        assert updated_store.address == "New Address"


class TestProductCRUD:
    """Test product CRUD operations"""
    
    @pytest.mark.asyncio
    async def test_create_product(self):
        """Test product creation"""
        db = AsyncMock(spec=AsyncSession)
        store_id = uuid.uuid4()
        
        product_data = ProductCreate(
            name="Test Product",
            description="Test Description",
            price=99.99,
            is_active=True
        )
        
        db.add = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        
        product = await ProductCRUD.create_product(db, product_data, store_id)
        
        assert product.store_id == store_id
        assert product.name == "Test Product"
        assert product.description == "Test Description"
        assert product.price == 99.99
        assert product.is_active is True

    @pytest.mark.asyncio
    async def test_get_product(self):
        """Test getting product by ID"""
        db = AsyncMock(spec=AsyncSession)
        product_id = uuid.uuid4()
        
        mock_product = Product(
            id=product_id,
            store_id=uuid.uuid4(),
            name="Test Product",
            price=99.99
        )
        
        db.execute.return_value.scalar_one_or_none.return_value = mock_product
        
        product = await ProductCRUD.get_product(db, product_id)
        
        assert product is not None
        assert product.id == product_id
        assert product.name == "Test Product"

    @pytest.mark.asyncio
    async def test_get_products(self):
        """Test getting products in store"""
        db = AsyncMock(spec=AsyncSession)
        store_id = uuid.uuid4()
        
        mock_products = [
            Product(id=uuid.uuid4(), store_id=store_id, name="Product 1"),
            Product(id=uuid.uuid4(), store_id=store_id, name="Product 2")
        ]
        
        db.execute.return_value.scalars.return_value.all.return_value = mock_products
        db.execute.return_value.scalar.return_value = 2
        
        products, total = await ProductCRUD.get_products(
            db=db,
            store_id=store_id,
            page=1,
            page_size=10
        )
        
        assert len(products) == 2
        assert total == 2


class TestProductImageCRUD:
    """Test product image CRUD operations"""
    
    @pytest.mark.asyncio
    async def test_create_image(self):
        """Test image creation"""
        db = AsyncMock(spec=AsyncSession)
        product_id = uuid.uuid4()
        image_url = "/uploads/test.jpg"
        
        db.add = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        
        image = await ProductImageCRUD.create_image(db, product_id, image_url, is_primary=True)
        
        assert image.product_id == product_id
        assert image.url == image_url
        assert image.is_primary is True

    @pytest.mark.asyncio
    async def test_get_images(self):
        """Test getting product images"""
        db = AsyncMock(spec=AsyncSession)
        product_id = uuid.uuid4()
        
        mock_images = [
            ProductImage(id=uuid.uuid4(), product_id=product_id, url="/uploads/1.jpg"),
            ProductImage(id=uuid.uuid4(), product_id=product_id, url="/uploads/2.jpg")
        ]
        
        db.execute.return_value.scalars.return_value.all.return_value = mock_images
        
        images = await ProductImageCRUD.get_images(db, product_id)
        
        assert len(images) == 2
        assert all(img.product_id == product_id for img in images)

    @pytest.mark.asyncio
    async def test_set_primary_image(self):
        """Test setting primary image"""
        db = AsyncMock(spec=AsyncSession)
        image_id = uuid.uuid4()
        product_id = uuid.uuid4()
        
        mock_image = ProductImage(
            id=image_id,
            product_id=product_id,
            url="/uploads/test.jpg",
            is_primary=False
        )
        
        db.execute.return_value.scalar_one_or_none.return_value = mock_image
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        
        image = await ProductImageCRUD.set_primary_image(db, image_id)
        
        assert image is not None
        assert image.is_primary is True


class TestImageHandler:
    """Test image handling operations"""
    
    @pytest.mark.asyncio
    async def test_save_uploaded_file(self):
        """Test saving uploaded file"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Mock upload file
            file_content = b"fake image content"
            upload_file = UploadFile(
                file=BytesIO(file_content),
                filename="test.jpg",
                content_type="image/jpeg"
            )
            
            store_id = uuid.uuid4()
            product_id = uuid.uuid4()
            
            # Change to temp directory for testing
            original_cwd = os.getcwd()
            os.chdir(temp_dir)
            
            try:
                image_path = await ImageHandler.save_uploaded_file(
                    upload_file, store_id, product_id
                )
                
                # Verify file was saved
                assert os.path.exists(image_path)
                assert image_path.startswith(f"uploads/stores/{store_id}/products/{product_id}")
                
                # Verify file content
                with open(image_path, "rb") as f:
                    saved_content = f.read()
                assert saved_content == file_content
                
            finally:
                os.chdir(original_cwd)

    @pytest.mark.asyncio
    async def test_delete_image_file(self):
        """Test deleting image file"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create a test file
            test_file = os.path.join(temp_dir, "test.jpg")
            with open(test_file, "w") as f:
                f.write("test content")
            
            # Test deleting existing file
            result = await ImageHandler.delete_image_file(test_file)
            assert result is True
            assert not os.path.exists(test_file)
            
            # Test deleting non-existent file
            result = await ImageHandler.delete_image_file("/non/existent/file.jpg")
            assert result is False


class TestStoreModels:
    """Test store model relationships"""
    
    def test_store_model(self):
        """Test store model creation"""
        store = Store(
            user_id=uuid.uuid4(),
            name="Test Store",
            address="123 Test Street",
            banner="/uploads/banner.jpg",
            subscription_type=SubscriptionType.GOLD
        )
        
        assert store.name == "Test Store"
        assert store.address == "123 Test Street"
        assert store.banner == "/uploads/banner.jpg"
        assert store.subscription_type == SubscriptionType.GOLD
        assert store.is_active is True
        assert store.rating == 0.0

    def test_product_model(self):
        """Test product model creation"""
        product = Product(
            store_id=uuid.uuid4(),
            name="Test Product",
            description="Test Description",
            price=99.99,
            is_active=True
        )
        
        assert product.name == "Test Product"
        assert product.description == "Test Description"
        assert product.price == 99.99
        assert product.is_active is True

    def test_product_image_model(self):
        """Test product image model creation"""
        image = ProductImage(
            product_id=uuid.uuid4(),
            url="/uploads/test.jpg",
            is_primary=True
        )
        
        assert image.url == "/uploads/test.jpg"
        assert image.is_primary is True


if __name__ == "__main__":
    pytest.main([__file__])

