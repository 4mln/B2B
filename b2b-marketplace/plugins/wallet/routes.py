from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.deps import get_current_user
from app.core.security import verify_user_role
from plugins.auth.models import User
from . import crud
from .schemas import (
    WalletCreate, WalletOut, WalletUpdate,
    TransactionOut, DepositRequest, WithdrawalRequest,
    TransferRequest, UserWallets, WalletBalance
)

def resolve_user_id(user):
    """Resolve user ID for both legacy and new user models"""
    if hasattr(user, 'id'):
        # Check if it's a new user ID (UUID format)
        if str(user.id).startswith('USR-'):
            return user.id, user.id
        else:
            # Legacy user ID, need to resolve new user ID
            # This would typically query the legacy_mapping table
            # For now, return the legacy ID and None for new ID
            return user.id, None
    return None, None

router = APIRouter()

@router.post("/", response_model=WalletOut, status_code=status.HTTP_201_CREATED)
async def create_wallet(
    wallet: WalletCreate,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    # Only allow admin or the user themselves to create a wallet
    if current_user.id != wallet.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if wallet with this currency already exists for the user
    existing_wallet = await crud.get_user_wallet_by_currency(db, wallet.user_id, wallet.currency)
    if existing_wallet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User already has a wallet for {wallet.currency}"
        )
    
    return await crud.create_wallet(db, wallet)

@router.get("/user/{user_id}", response_model=UserWallets)
async def get_user_wallets(
    user_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    # Only allow admin or the user themselves to view wallets
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    wallets = await crud.get_user_wallets(db, user_id)
    wallet_balances = [
        WalletBalance(
            currency=wallet.currency,
            balance=wallet.balance,
            currency_type=wallet.currency_type
        ) for wallet in wallets
    ]
    
    return UserWallets(user_id=user_id, wallets=wallet_balances)

@router.get("/me", response_model=UserWallets)
async def get_my_wallets(
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    wallets = await crud.get_user_wallets(db, current_user.id)
    wallet_balances = [
        WalletBalance(
            currency=wallet.currency,
            balance=wallet.balance,
            currency_type=wallet.currency_type
        ) for wallet in wallets
    ]
    
    return UserWallets(user_id=current_user.id, wallets=wallet_balances)

@router.get("/{wallet_id}", response_model=WalletOut)
async def get_wallet(
    wallet_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    wallet = await crud.get_wallet(db, wallet_id)
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Only allow admin or the wallet owner to view the wallet
    if current_user.id != wallet.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return wallet

@router.patch("/{wallet_id}", response_model=WalletOut)
async def update_wallet(
    wallet_id: int,
    wallet_data: WalletUpdate,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    wallet = await crud.get_wallet(db, wallet_id)
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Only allow admin to update wallet status
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return await crud.update_wallet(db, wallet_id, wallet_data)

@router.get("/{wallet_id}/transactions", response_model=List[TransactionOut])
async def get_wallet_transactions(
    wallet_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    wallet = await crud.get_wallet(db, wallet_id)
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Only allow admin or the wallet owner to view transactions
    if current_user.id != wallet.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return await crud.get_wallet_transactions(db, wallet_id)

@router.post("/deposit", response_model=TransactionOut)
async def deposit_funds(
    deposit: DepositRequest,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    # Find user's wallet for the specified currency
    wallet = await crud.get_user_wallet_by_currency(db, current_user.id, deposit.currency)
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No wallet found for currency {deposit.currency}"
        )
    
    # In a real application, this would integrate with a payment gateway
    # For now, we'll just add the funds directly
    try:
        transaction = await crud.deposit(
            db, 
            wallet.id, 
            deposit.amount, 
            description="Manual deposit"
        )
        return transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/withdraw", response_model=TransactionOut)
async def withdraw_funds(
    withdrawal: WithdrawalRequest,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    # Find user's wallet for the specified currency
    wallet = await crud.get_user_wallet_by_currency(db, current_user.id, withdrawal.currency)
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No wallet found for currency {withdrawal.currency}"
        )
    
    # In a real application, this would integrate with a payment gateway
    # For now, we'll just subtract the funds directly
    try:
        transaction = await crud.withdraw(
            db, 
            wallet.id, 
            withdrawal.amount, 
            description="Manual withdrawal"
        )
        return transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/transfer", response_model=TransactionOut)
async def transfer_funds(
    transfer: TransferRequest,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    # Find sender's wallet
    from_wallet = await crud.get_user_wallet_by_currency(db, current_user.id, transfer.currency)
    if not from_wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No wallet found for currency {transfer.currency}"
        )
    
    # Find recipient's wallet
    to_wallet = await crud.get_user_wallet_by_currency(db, transfer.recipient_id, transfer.currency)
    if not to_wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipient has no wallet for currency {transfer.currency}"
        )
    
    try:
        from_transaction, _ = await crud.transfer(
            db, 
            from_wallet.id, 
            to_wallet.id, 
            transfer.amount, 
            description=f"Transfer to user {transfer.recipient_id}"
        )
        return from_transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# New endpoints to support frontend requirements

from plugins.wallet.schemas.analytics import WalletAnalytics, CurrencyInfo, ExchangeRate, CurrencyConversion
from .crud import analytics as analytics_crud

@router.get("/balance", response_model=List[WalletBalance])
async def get_all_balances(
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    """Get all wallet balances for the current user."""
    wallets = await crud.get_user_wallets(db, current_user.id)
    return [
        WalletBalance(
            currency=w.currency,
            balance=w.balance,
            currency_type=w.currency_type
        ) for w in wallets
    ]

@router.get("/transactions", response_model=List[TransactionOut])
async def get_all_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions across user's wallets."""
    wallets = await crud.get_user_wallets(db, current_user.id)
    wallet_ids = [w.id for w in wallets]
    
    offset = (page - 1) * limit
    transactions = []
    for wallet_id in wallet_ids:
        wallet_transactions = await crud.get_wallet_transactions(db, wallet_id)
        transactions.extend(wallet_transactions)
    
    # Sort by date and paginate
    transactions.sort(key=lambda x: x.created_at, reverse=True)
    return transactions[offset:offset + limit]

@router.get("/{wallet_id}/analytics", response_model=WalletAnalytics)
async def get_wallet_analytics(
    wallet_id: str,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    """Get analytics for a specific wallet."""
    wallet = await crud.get_wallet(db, wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
        
    if wallet.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    analytics = await analytics_crud.get_wallet_analytics(db, wallet_id, days)
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics not found")
    
    return analytics

@router.get("/currencies", response_model=List[CurrencyInfo])
async def get_supported_currencies(
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    """Get list of supported currencies."""
    return await analytics_crud.get_supported_currencies(db, include_inactive)

@router.get("/exchange-rates", response_model=List[ExchangeRate])
async def get_exchange_rates(
    base_currency: Optional[str] = None,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    """Get current exchange rates."""
    return await analytics_crud.get_exchange_rates(db, base_currency)

@router.post("/convert", response_model=CurrencyConversion)
async def convert_currency(
    from_currency: str,
    to_currency: str,
    amount: float = Query(..., gt=0),
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_db_sync),
    current_user: User = Depends(get_current_user)
):
    """Convert amount between currencies."""
    converted_amount = await analytics_crud.convert_currency(
        db, from_currency, to_currency, amount
    )
    
    if converted_amount is None:
        raise HTTPException(
            status_code=400,
            detail=f"No exchange rate found for {from_currency} to {to_currency}"
        )
    
    return CurrencyConversion(
        from_currency=from_currency,
        to_currency=to_currency,
        amount=amount,
        converted_amount=converted_amount,
        rate=converted_amount / amount,
        timestamp=datetime.utcnow()
    )