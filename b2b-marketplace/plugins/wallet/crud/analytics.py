"""CRUD operations for wallet analytics and currencies."""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from plugins.wallet.models.analytics import SupportedCurrency, ExchangeRate, WalletAnalytics
from plugins.wallet.models.wallet import Wallet, Transaction
from plugins.wallet.schemas.analytics import WalletAnalytics as WalletAnalyticsSchema
from plugins.wallet.schemas.analytics import CurrencyInfo, ExchangeRate as ExchangeRateSchema

async def get_wallet_analytics(
    db: AsyncSession, 
    wallet_id: str,
    days: int = 30
) -> Optional[Dict[str, Any]]:
    """Get analytics for a specific wallet."""
    since_date = datetime.utcnow() - timedelta(days=days)
    
    # Get wallet transactions
    result = await db.execute(
        select(Transaction)
        .where(
            and_(
                Transaction.wallet_id == wallet_id,
                Transaction.created_at >= since_date
            )
        )
    )
    transactions = result.scalars().all()
    
    # Calculate analytics
    total_deposits = sum(t.amount for t in transactions if t.type == 'credit')
    total_withdrawals = sum(t.amount for t in transactions if t.type == 'debit')
    
    status_count = {}
    for t in transactions:
        status_count[t.status] = status_count.get(t.status, 0) + 1
    
    # Get current balance
    result = await db.execute(
        select(Wallet).where(Wallet.id == wallet_id)
    )
    wallet = result.scalar_one_or_none()
    
    if not wallet:
        return None
        
    return {
        "total_balance": wallet.balance,
        "total_transactions": len(transactions),
        "total_deposits": total_deposits,
        "total_withdrawals": total_withdrawals,
        "transaction_count_by_status": status_count,
        "daily_volume": [],  # TODO: Implement daily aggregation
        "created_at": datetime.utcnow()
    }

async def get_supported_currencies(
    db: AsyncSession,
    include_inactive: bool = False
) -> List[CurrencyInfo]:
    """Get list of supported currencies."""
    query = select(SupportedCurrency)
    if not include_inactive:
        query = query.where(SupportedCurrency.is_active == True)
    
    result = await db.execute(query)
    currencies = result.scalars().all()
    
    return [
        CurrencyInfo(
            code=c.code,
            name=c.name,
            symbol=c.symbol,
            is_crypto=c.is_crypto,
            is_active=c.is_active
        )
        for c in currencies
    ]

async def get_exchange_rates(
    db: AsyncSession,
    base_currency: Optional[str] = None
) -> List[ExchangeRateSchema]:
    """Get current exchange rates."""
    query = select(ExchangeRate)
    if base_currency:
        query = query.where(ExchangeRate.from_currency == base_currency)
    
    result = await db.execute(query)
    rates = result.scalars().all()
    
    return [
        ExchangeRateSchema(
            from_currency=r.from_currency,
            to_currency=r.to_currency,
            rate=r.rate,
            last_updated=r.created_at
        )
        for r in rates
    ]

async def convert_currency(
    db: AsyncSession,
    from_currency: str,
    to_currency: str,
    amount: float
) -> Optional[float]:
    """Convert amount between currencies using latest exchange rate."""
    result = await db.execute(
        select(ExchangeRate)
        .where(
            and_(
                ExchangeRate.from_currency == from_currency,
                ExchangeRate.to_currency == to_currency
            )
        )
        .order_by(ExchangeRate.created_at.desc())
        .limit(1)
    )
    rate = result.scalar_one_or_none()
    
    if not rate:
        return None
        
    return amount * rate.rate