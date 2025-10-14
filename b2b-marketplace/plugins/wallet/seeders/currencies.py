"""Initial data seeder for supported currencies."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from plugins.wallet.models.analytics import SupportedCurrency

async def seed_supported_currencies(db: AsyncSession):
    """Seed initial supported currencies."""
    # Check if we already have currencies
    result = await db.execute(select(SupportedCurrency))
    if result.scalars().first():
        return  # Already seeded
    
    currencies = [
        {
            "code": "USD",
            "name": "US Dollar",
            "symbol": "$",
            "is_crypto": False,
            "is_active": True
        },
        {
            "code": "EUR",
            "name": "Euro",
            "symbol": "€",
            "is_crypto": False,
            "is_active": True
        },
        {
            "code": "IRR",
            "name": "Iranian Rial",
            "symbol": "﷼",
            "is_crypto": False,
            "is_active": True
        },
        {
            "code": "BTC",
            "name": "Bitcoin",
            "symbol": "₿",
            "is_crypto": True,
            "is_active": True
        },
        {
            "code": "ETH",
            "name": "Ethereum",
            "symbol": "Ξ",
            "is_crypto": True,
            "is_active": True
        }
    ]
    
    for currency_data in currencies:
        currency = SupportedCurrency(**currency_data)
        db.add(currency)
    
    await db.commit()