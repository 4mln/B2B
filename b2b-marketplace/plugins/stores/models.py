"""
Stores Plugin Models
B2B Marketplace Visual Stores for Users with Seller Capability
"""

import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Boolean, Float, Text, DateTime, ForeignKey, func, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class SubscriptionType(str, Enum):
    """Store subscription types"""
    FREE = "free"
    SILVER = "silver"
    GOLD = "gold"


class Store(Base):
    """Store model for B2B marketplace sellers"""
    __tablename__ = "stores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users_new.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    banner = Column(String, nullable=False)  # Path to banner image (mandatory)
    name = Column(String, nullable=False)  # Store name (mandatory)
    address = Column(String, nullable=False)  # Store address (mandatory)
    subscription_type = Column(String, default=SubscriptionType.FREE, nullable=False)
    rating = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    # Note: Products relationship will be handled through the existing products plugin

    def __repr__(self):
        return f"<Store(id={self.id}, name='{self.name}', user_id={self.user_id})>"


# Note: We use the existing Product model from plugins.products.models
# This model is for reference only - we'll import the actual Product model


class ProductImage(Base):
    """Product image model for storing product photos"""
    __tablename__ = "store_product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    url = Column(String, nullable=False)  # Local file path initially
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # Note: Product relationship will be handled through the existing products plugin

    def __repr__(self):
        return f"<ProductImage(id={self.id}, product_id={self.product_id}, is_primary={self.is_primary})>"
