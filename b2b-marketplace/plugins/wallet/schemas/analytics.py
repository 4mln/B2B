"""Wallet plugin schemas for new endpoints."""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class WalletAnalytics(BaseModel):
    total_balance: float
    total_transactions: int
    total_deposits: float
    total_withdrawals: float
    transaction_count_by_status: dict
    daily_volume: List[dict]
    created_at: datetime

class CurrencyInfo(BaseModel):
    code: str
    name: str
    symbol: str
    is_crypto: bool
    is_active: bool
    exchange_rate: Optional[float] = None

class ExchangeRate(BaseModel):
    from_currency: str
    to_currency: str
    rate: float
    last_updated: datetime

class CurrencyConversion(BaseModel):
    from_currency: str
    to_currency: str
    amount: float
    converted_amount: float
    rate: float
    timestamp: datetime