from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class CurrencyType(str, enum.Enum):
    FIAT = "fiat"
    CRYPTO = "crypto"


class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    CASHBACK = "cashback"
    FEE = "fee"


class Wallet(Base):
    __tablename__ = "wallets"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    new_user_id = Column(UUID, ForeignKey("users_new.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users_new.id"), nullable=False)
    balance = Column(Float, default=0.0)
    currency = Column(String, default="IRR")
    currency_type = Column(Enum(CurrencyType), default=CurrencyType.FIAT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    transactions = relationship("Transaction", back_populates="wallet")


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    reference = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    wallet = relationship("Wallet", back_populates="transactions")


# Expose analytics submodule so importers can use plugins.wallet.models.analytics
from . import analytics  # noqa: F401


