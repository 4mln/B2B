from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from .models import Escrow

router = APIRouter()


@router.post("/hold")
async def hold_escrow(
    order_id: int,
    amount: float,
    currency: str = "IRR",
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session),
):
    # Lazy imports to avoid circular dependencies
    from plugins.orders.models import Order
    from plugins.wallet.integrations import process_marketplace_payment

    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    ok = await process_marketplace_payment(
        db,
        user_id=order.buyer_id,
        amount=amount,
        currency=currency,
        reference=f"escrow:{order_id}",
        description="Escrow hold",
    )
    if not ok:
        raise HTTPException(status_code=400, detail="Payment failed")

    escrow = Escrow(order_id=order_id, amount=amount, currency=currency)
    db.add(escrow)
    await db.commit()
    await db.refresh(escrow)
    return escrow


@router.post("/{escrow_id}/release")
async def release_escrow(
    escrow_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session),
):
    await db.execute(update(Escrow).where(Escrow.id == escrow_id).values(status="released"))
    await db.commit()
    escrow = await db.get(Escrow, escrow_id)
    if not escrow:
        raise HTTPException(status_code=404, detail="Not found")
    return escrow


@router.post("/{escrow_id}/refund")
async def refund_escrow(
    escrow_id: int,
    db: AsyncSession = Depends(lambda: __import__("importlib").import_module("app.db.session").get_session),
):
    # Lazy imports to avoid circular dependencies
    from plugins.orders.models import Order
    from plugins.wallet.integrations import process_marketplace_refund

    escrow = await db.get(Escrow, escrow_id)
    if not escrow:
        raise HTTPException(status_code=404, detail="Not found")

    order = await db.get(Order, escrow.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    ok = await process_marketplace_refund(
        db,
        user_id=order.buyer_id,
        amount=escrow.amount,
        currency=escrow.currency,
        reference=f"escrow:{escrow.order_id}",
        description="Escrow refund",
    )
    if not ok:
        raise HTTPException(status_code=400, detail="Refund failed")

    await db.execute(update(Escrow).where(Escrow.id == escrow_id).values(status="refunded"))
    await db.commit()
    return await db.get(Escrow, escrow_id)


