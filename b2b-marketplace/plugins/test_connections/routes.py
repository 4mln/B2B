from fastapi import APIRouter

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

from app.core.legacy_adapter import LegacyAdapter

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

from app.core.connections import get_redis, get_rabbitmq_connection

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

import aio_pika

router = APIRouter()

@router.get("/test/redis")
async def test_redis():
    redis = await get_redis()
    await redis.set("test_key", "Hello from Redis!", ex=10)
    value = await redis.get("test_key")
    return {"status": "ok", "redis_value": value}

@router.get("/test/rabbitmq")
async def test_rabbitmq():
    connection = await get_rabbitmq_connection()
    channel = await connection.channel()

    queue = await channel.declare_queue("test_queue", durable=True)
    message = aio_pika.Message(body=b"Hello from RabbitMQ!")
    await channel.default_exchange.publish(message, routing_key=queue.name)

    return {"status": "ok", "message": "Message published to RabbitMQ"}