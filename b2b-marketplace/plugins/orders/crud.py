from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.exc import SQLAlchemyError
from plugins.orders.models import Order
from plugins.orders.schemas import OrderCreate, OrderUpdate, OrderStatus
from plugins.products.models import Product
from plugins.orders.__init__ import Plugin  # to get max_orders_per_user
from typing import List, Optional, Dict

async def create_order(db: AsyncSession, order: OrderCreate, buyer_id: int, new_buyer_id: Optional[str] = None):
    # Validate max orders per user
    max_orders = Plugin.config.max_orders_per_user
    where_clause = Order.new_buyer_id == new_buyer_id if new_buyer_id else Order.buyer_id == buyer_id
    existing_count = await db.scalar(select(func.count()).select_from(Order).where(where_clause))
    if existing_count >= max_orders:
        raise ValueError(f"Buyer has reached the maximum number of orders: {max_orders}")

    # Validate products exist and calculate total amount
    product_ids = [item.product_id for item in order.items]
    products = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products_list = products.scalars().all()
    products_dict = {p.id: p for p in products_list}
    
    if len(products_list) != len(product_ids):
        raise ValueError("One or more products do not exist")
    
    # Calculate total amount
    total_amount = sum(item.quantity * item.unit_price for item in order.items)
    
    # Create product_ids JSON for database storage
    product_ids_json = [{
        "product_id": item.product_id,
        "quantity": item.quantity,
        "unit_price": item.unit_price
    } for item in order.items]

    db_order = Order(
        buyer_id=buyer_id, new_buyer_id=new_buyer_id,
        seller_id=order.seller_id,
        product_ids=product_ids_json,  # Store as JSON
        total_amount=total_amount,
        status=OrderStatus.pending
    )
    try:
        db.add(db_order)
        await db.commit()
        await db.refresh(db_order)
    except SQLAlchemyError:
        await db.rollback()
        raise
    return db_order


async def get_order(db: AsyncSession, order_id: int, buyer_id: int, new_buyer_id: Optional[str] = None):
    query = select(Order).where(Order.id == order_id)
    if buyer_id:
        where_clause = Order.new_buyer_id == new_buyer_id if new_buyer_id else Order.buyer_id == buyer_id
        query = query.where(where_clause)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def update_order(db: AsyncSession, order_id: int, order_data: OrderUpdate, buyer_id: int, new_buyer_id: Optional[str] = None):
    db_order = await get_order(db, order_id, buyer_id, new_buyer_id)
    if not db_order:
        return None

    # Optional: enforce allowed status transitions
    allowed_transitions = {
        "pending": ["paid", "cancelled"],
        "paid": ["shipped", "cancelled"],
        "shipped": ["completed"],
        "completed": [],
        "cancelled": []
    }
    if order_data.status and order_data.status != db_order.status:
        if order_data.status not in allowed_transitions[db_order.status.value]:
            raise ValueError(f"Cannot change status from {db_order.status} to {order_data.status}")

    for field, value in order_data.dict(exclude_unset=True).items():
        setattr(db_order, field, value)
    await db.commit()
    await db.refresh(db_order)
    return db_order


async def delete_order(db: AsyncSession, order_id: int, buyer_id: int, new_buyer_id: Optional[str] = None):
    db_order = await get_order(db, order_id, buyer_id, new_buyer_id)
    if not db_order:
        return False
    await db.delete(db_order)
    await db.commit()
    return True


async def list_orders(
    db: AsyncSession,
    buyer_id: Optional[int] = None,
    new_buyer_id: Optional[str] = None,
    seller_id: Optional[int] = None,
    new_seller_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    query = select(Order)
    if buyer_id is not None:
        where_clause = Order.new_buyer_id == new_buyer_id if new_buyer_id else Order.buyer_id == buyer_id
        query = query.where(where_clause)
    if seller_id is not None:
        where_clause_seller = Order.new_seller_id == new_seller_id if new_seller_id else Order.seller_id == seller_id
        query = query.where(where_clause_seller)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()