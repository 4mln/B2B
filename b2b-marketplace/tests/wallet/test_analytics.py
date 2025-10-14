"""Test cases for wallet analytics endpoints."""
import pytest
from datetime import datetime, timedelta
from fastapi import status
from httpx import AsyncClient

from plugins.wallet.models.analytics import SupportedCurrency, ExchangeRate
from plugins.wallet.seeders.currencies import seed_supported_currencies

@pytest.mark.asyncio
async def test_get_all_balances(
    async_client: AsyncClient,
    test_db,
    create_user,
    create_wallet,
    auth_headers
):
    """Test getting all wallet balances for a user."""
    user = await create_user()
    wallet1 = await create_wallet(user.id, "USD", 100)
    wallet2 = await create_wallet(user.id, "EUR", 200)
    
    response = await async_client.get(
        "/api/v1/wallet/balance",
        headers=auth_headers(user)
    )
    
    assert response.status_code == status.HTTP_200_OK
    balances = response.json()
    assert len(balances) == 2
    assert any(b["currency"] == "USD" and b["balance"] == 100 for b in balances)
    assert any(b["currency"] == "EUR" and b["balance"] == 200 for b in balances)

@pytest.mark.asyncio
async def test_get_all_transactions(
    async_client: AsyncClient,
    test_db,
    create_user,
    create_wallet,
    create_transaction,
    auth_headers
):
    """Test getting all transactions across wallets."""
    user = await create_user()
    wallet1 = await create_wallet(user.id, "USD", 100)
    wallet2 = await create_wallet(user.id, "EUR", 200)
    
    # Create some transactions
    txn1 = await create_transaction(wallet1.id, "credit", 50)
    txn2 = await create_transaction(wallet2.id, "debit", 30)
    
    response = await async_client.get(
        "/api/v1/wallet/transactions",
        headers=auth_headers(user)
    )
    
    assert response.status_code == status.HTTP_200_OK
    transactions = response.json()
    assert len(transactions) == 2
    assert any(t["id"] == str(txn1.id) for t in transactions)
    assert any(t["id"] == str(txn2.id) for t in transactions)

@pytest.mark.asyncio
async def test_wallet_analytics(
    async_client: AsyncClient,
    test_db,
    create_user,
    create_wallet,
    create_transaction,
    auth_headers
):
    """Test getting wallet analytics."""
    user = await create_user()
    wallet = await create_wallet(user.id, "USD", 1000)
    
    # Create transactions over past few days
    now = datetime.utcnow()
    dates = [now - timedelta(days=i) for i in range(5)]
    
    for date in dates:
        await create_transaction(
            wallet.id,
            "credit",
            100,
            created_at=date
        )
    
    response = await async_client.get(
        f"/api/v1/wallet/{wallet.id}/analytics",
        headers=auth_headers(user)
    )
    
    assert response.status_code == status.HTTP_200_OK
    analytics = response.json()
    assert analytics["total_balance"] == 1000
    assert analytics["total_transactions"] == 5
    assert analytics["total_deposits"] == 500
    assert analytics["transaction_count_by_status"]["completed"] == 5

@pytest.mark.asyncio
async def test_supported_currencies(
    async_client: AsyncClient,
    test_db,
    create_user,
    auth_headers
):
    """Test getting supported currencies."""
    user = await create_user()
    
    # Seed currencies
    async with test_db() as db:
        await seed_supported_currencies(db)
    
    response = await async_client.get(
        "/api/v1/wallet/currencies",
        headers=auth_headers(user)
    )
    
    assert response.status_code == status.HTTP_200_OK
    currencies = response.json()
    assert len(currencies) > 0
    assert any(c["code"] == "USD" for c in currencies)
    assert any(c["code"] == "BTC" and c["is_crypto"] for c in currencies)

@pytest.mark.asyncio
async def test_exchange_rates(
    async_client: AsyncClient,
    test_db,
    create_user,
    auth_headers
):
    """Test getting exchange rates."""
    user = await create_user()
    
    # Add some exchange rates
    async with test_db() as db:
        await seed_supported_currencies(db)
        
        rate = ExchangeRate(
            id="USD-EUR-1",
            from_currency="USD",
            to_currency="EUR",
            rate=0.85
        )
        db.add(rate)
        await db.commit()
    
    response = await async_client.get(
        "/api/v1/wallet/exchange-rates",
        headers=auth_headers(user)
    )
    
    assert response.status_code == status.HTTP_200_OK
    rates = response.json()
    assert len(rates) > 0
    usd_eur = next(r for r in rates if r["from_currency"] == "USD" and r["to_currency"] == "EUR")
    assert usd_eur["rate"] == 0.85

@pytest.mark.asyncio
async def test_currency_conversion(
    async_client: AsyncClient,
    test_db,
    create_user,
    auth_headers
):
    """Test currency conversion."""
    user = await create_user()
    
    # Add exchange rate
    async with test_db() as db:
        await seed_supported_currencies(db)
        
        rate = ExchangeRate(
            id="USD-EUR-1",
            from_currency="USD",
            to_currency="EUR",
            rate=0.85
        )
        db.add(rate)
        await db.commit()
    
    response = await async_client.post(
        "/api/v1/wallet/convert",
        params={
            "from_currency": "USD",
            "to_currency": "EUR",
            "amount": 100
        },
        headers=auth_headers(user)
    )
    
    assert response.status_code == status.HTTP_200_OK
    result = response.json()
    assert result["from_currency"] == "USD"
    assert result["to_currency"] == "EUR"
    assert result["amount"] == 100
    assert result["converted_amount"] == 85
    assert result["rate"] == 0.85