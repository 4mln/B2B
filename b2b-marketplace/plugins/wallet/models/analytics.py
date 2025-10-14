"""Wallet plugin models for analytics and currency data."""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class SupportedCurrency(Base):
    __tablename__ = "supported_currencies"

    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    is_crypto = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id = Column(String, primary_key=True)
    from_currency = Column(String, ForeignKey("supported_currencies.code"), nullable=False)
    to_currency = Column(String, ForeignKey("supported_currencies.code"), nullable=False)
    rate = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    from_currency_ref = relationship("SupportedCurrency", foreign_keys=[from_currency])
    to_currency_ref = relationship("SupportedCurrency", foreign_keys=[to_currency])

class WalletAnalytics(Base):
    __tablename__ = "wallet_analytics"

    wallet_id = Column(String, ForeignKey("wallets.id"), primary_key=True)
    daily_stats = Column(JSON)  # Daily transaction stats
    monthly_stats = Column(JSON)  # Monthly aggregates
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())
    
    wallet = relationship("Wallet", back_populates="analytics")