# Stores Plugin

A comprehensive B2B marketplace plugin that implements visual stores for users with "seller" capability. This plugin provides store management, product catalog, and image handling functionality.

## Features

### 🏪 Store Management
- Create and manage stores for users with seller capability
- Store activation/deactivation
- Subscription type management (Free, Silver, Gold)
- Store statistics and analytics
- Rating aggregation

### 📦 Product Management
- Product catalog within stores
- Product creation, update, and deletion
- Product activation/deactivation
- Price management
- Product descriptions

### 🖼️ Image Handling
- Product image upload and management
- Local file storage with cloud storage readiness
- Primary image designation
- Image deletion and cleanup
- Support for multiple images per product

### 🔐 Security & Permissions
- Seller capability validation
- Store ownership verification
- Admin override capabilities
- Secure file upload validation

## API Endpoints

### Store Endpoints
- `GET /stores/` - List all stores with filtering
- `GET /stores/{store_id}` - Get store details with products
- `POST /stores/create` - Create new store (seller only)
- `PUT /stores/{store_id}/update` - Update store details
- `PATCH /stores/{store_id}/activate` - Activate/deactivate store
- `GET /stores/{store_id}/stats` - Get store statistics

### Product Endpoints
- `GET /stores/{store_id}/products` - List products in store
- `GET /stores/{store_id}/products/{product_id}` - Get product details
- `POST /stores/{store_id}/products` - Create new product
- `PUT /stores/{store_id}/products/{product_id}` - Update product
- `DELETE /stores/{store_id}/products/{product_id}` - Delete product

### Image Endpoints
- `GET /stores/{store_id}/products/{product_id}/images` - List product images
- `POST /stores/{store_id}/products/{product_id}/images` - Upload image
- `PATCH /stores/{store_id}/products/{product_id}/images/{image_id}/primary` - Set primary image
- `DELETE /stores/{store_id}/products/{product_id}/images/{image_id}` - Delete image

## Models

### Store Model
```python
class Store(Base):
    id: UUID (primary key)
    user_id: UUID (foreign key to users_new.id)
    is_active: bool (default True)
    banner: str (mandatory)
    name: str (mandatory)
    address: str (mandatory)
    subscription_type: enum (free, silver, gold)
    rating: float (default 0.0)
    created_at: datetime
    updated_at: datetime
```

### Product Model
```python
class Product(Base):
    id: UUID (primary key)
    store_id: UUID (foreign key to stores.id)
    name: str (mandatory)
    description: text
    price: float (default 0.0)
    is_active: bool (default True)
    created_at: datetime
    updated_at: datetime
```

### ProductImage Model
```python
class ProductImage(Base):
    id: UUID (primary key)
    product_id: UUID (foreign key to products.id)
    url: str (local file path)
    is_primary: bool (default False)
    created_at: datetime
```

## Installation & Setup

### 1. Run Migrations
```bash
python scripts/run_stores_migrations.py
```

### 2. Create Upload Directory
```bash
mkdir -p uploads/stores
```

### 3. Add Plugin to Main App
The plugin will be automatically loaded by the plugin system.

## Usage Examples

### Create a Store
```python
from plugins.stores.schemas import StoreCreate
from plugins.stores.crud import StoreCRUD

store_data = StoreCreate(
    name="My Awesome Store",
    address="123 Business Street, City, Country",
    banner="/uploads/banner.jpg",
    subscription_type=SubscriptionType.FREE
)

store = await StoreCRUD.create_store(db, store_data, user_id)
```

### Add Products to Store
```python
from plugins.stores.schemas import ProductCreate

product_data = ProductCreate(
    name="Amazing Product",
    description="This is an amazing product",
    price=99.99,
    is_active=True
)

product = await ProductCRUD.create_product(db, product_data, store_id)
```

### Upload Product Images
```python
from fastapi import UploadFile

# Upload image file
image_file = UploadFile(file=file_content, filename="product.jpg")
image_path = await ImageHandler.save_uploaded_file(image_file, store_id, product_id)

# Create image record
image = await ProductImageCRUD.create_image(db, product_id, image_path, is_primary=True)
```

## File Storage

### Local Storage Structure
```
uploads/
└── stores/
    └── {store_id}/
        └── products/
            └── {product_id}/
                ├── {uuid}.jpg
                ├── {uuid}.png
                └── ...
```

### Cloud Storage Ready
The plugin is designed to easily switch to cloud storage by:
1. Updating the `ImageHandler.save_uploaded_file()` method
2. Modifying the `url` field to store cloud URLs
3. No other code changes required

## Testing

Run the unit tests:
```bash
pytest plugins/stores/tests.py -v
```

## Dependencies

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Python-multipart (for file uploads)

## Future Enhancements

- Cloud storage integration (AWS S3, Google Cloud Storage)
- Image optimization and resizing
- Advanced search and filtering
- Store analytics dashboard
- Multi-language support
- SEO optimization for store pages

