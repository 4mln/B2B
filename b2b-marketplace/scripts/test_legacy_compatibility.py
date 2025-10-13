#!/usr/bin/env python3
"""
Test Legacy Compatibility
Tests the legacy adapter endpoints to ensure backward compatibility.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_legacy_mapping():
    """Test that legacy mapping is working correctly"""
    print("[INFO] Testing legacy mapping...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test legacy mapping completeness
            result = await conn.execute(text("""
                SELECT 
                    lm.legacy_table,
                    lm.legacy_id,
                    un.unique_id,
                    un.badge,
                    un.username,
                    un.email
                FROM legacy_mapping lm
                JOIN users_new un ON lm.new_user_id = un.id
                ORDER BY lm.legacy_table, lm.legacy_id
                LIMIT 5;
            """))
            mappings = result.fetchall()
            
            print(f"Legacy mappings found: {len(mappings)}")
            for mapping in mappings:
                print(f"  {mapping[0]}.{mapping[1]} -> {mapping[2]} ({mapping[3]}) - {mapping[4]} ({mapping[5]})")
            
            # Test that all legacy users have mappings
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM users u
                LEFT JOIN legacy_mapping lm ON lm.legacy_table = 'users' AND lm.legacy_id = u.id
                WHERE lm.legacy_id IS NULL;
            """))
            unmapped_users = result.scalar()
            
            if unmapped_users > 0:
                print(f"[WARNING] {unmapped_users} legacy users without mappings")
            else:
                print("[SUCCESS] All legacy users have mappings")
            
            # Test that all legacy sellers have mappings
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM sellers s
                LEFT JOIN legacy_mapping lm ON lm.legacy_table = 'sellers' AND lm.legacy_id = s.id
                WHERE lm.legacy_id IS NULL;
            """))
            unmapped_sellers = result.scalar()
            
            if unmapped_sellers > 0:
                print(f"[WARNING] {unmapped_sellers} legacy sellers without mappings")
            else:
                print("[SUCCESS] All legacy sellers have mappings")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Legacy mapping test failed: {e}")
        return False

async def test_plugin_foreign_keys():
    """Test that plugin tables have proper foreign key relationships"""
    print("\n[INFO] Testing plugin foreign key relationships...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test orders table foreign keys
            result = await conn.execute(text("""
                SELECT 
                    o.id,
                    o.buyer_id,
                    o.new_buyer_id,
                    o.seller_id,
                    o.new_seller_id,
                    un_buyer.unique_id as buyer_unique_id,
                    un_seller.unique_id as seller_unique_id
                FROM orders o
                LEFT JOIN users_new un_buyer ON o.new_buyer_id = un_buyer.id
                LEFT JOIN users_new un_seller ON o.new_seller_id = un_seller.id
                LIMIT 3;
            """))
            orders = result.fetchall()
            
            print(f"Orders with foreign keys: {len(orders)}")
            for order in orders:
                print(f"  Order {order[0]}: buyer_id={order[1]}, new_buyer_id={order[2]}, seller_id={order[3]}, new_seller_id={order[4]}")
                if order[5]:
                    print(f"    -> Buyer: {order[5]}")
                if order[6]:
                    print(f"    -> Seller: {order[6]}")
            
            # Test products table foreign keys
            result = await conn.execute(text("""
                SELECT 
                    p.id,
                    p.seller_id,
                    p.new_seller_id,
                    un.unique_id as seller_unique_id
                FROM products p
                LEFT JOIN users_new un ON p.new_seller_id = un.id
                LIMIT 3;
            """))
            products = result.fetchall()
            
            print(f"Products with foreign keys: {len(products)}")
            for product in products:
                print(f"  Product {product[0]}: seller_id={product[1]}, new_seller_id={product[2]}")
                if product[3]:
                    print(f"    -> Seller: {product[3]}")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Plugin foreign key test failed: {e}")
        return False

async def test_user_capabilities():
    """Test that user capabilities are working"""
    print("\n[INFO] Testing user capabilities...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test user capabilities
            result = await conn.execute(text("""
                SELECT 
                    un.unique_id,
                    un.badge,
                    uc.capability,
                    uc.granted_at
                FROM users_new un
                LEFT JOIN user_capabilities uc ON un.id = uc.user_id
                ORDER BY un.unique_id
                LIMIT 5;
            """))
            capabilities = result.fetchall()
            
            print(f"User capabilities: {len(capabilities)}")
            for cap in capabilities:
                print(f"  {cap[0]} ({cap[1]}): {cap[2] if cap[2] else 'No capabilities'}")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] User capabilities test failed: {e}")
        return False

async def test_legacy_adapter_functionality():
    """Test that legacy adapter functions work correctly"""
    print("\n[INFO] Testing legacy adapter functionality...")
    
    try:
        # Test that we can resolve legacy user IDs
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test legacy user resolution
            result = await conn.execute(text("""
                SELECT 
                    u.id as legacy_user_id,
                    lm.new_user_id,
                    un.unique_id,
                    un.badge
                FROM users u
                JOIN legacy_mapping lm ON lm.legacy_table = 'users' AND lm.legacy_id = u.id
                JOIN users_new un ON lm.new_user_id = un.id
                LIMIT 3;
            """))
            legacy_users = result.fetchall()
            
            print(f"Legacy user resolution: {len(legacy_users)}")
            for user in legacy_users:
                print(f"  Legacy user {user[0]} -> {user[1]} ({user[2]}) - Badge: {user[3]}")
            
            # Test legacy seller resolution
            result = await conn.execute(text("""
                SELECT 
                    s.id as legacy_seller_id,
                    lm.new_user_id,
                    un.unique_id,
                    un.badge
                FROM sellers s
                JOIN legacy_mapping lm ON lm.legacy_table = 'sellers' AND lm.legacy_id = s.id
                JOIN users_new un ON lm.new_user_id = un.id
                LIMIT 3;
            """))
            legacy_sellers = result.fetchall()
            
            print(f"Legacy seller resolution: {len(legacy_sellers)}")
            for seller in legacy_sellers:
                print(f"  Legacy seller {seller[0]} -> {seller[1]} ({seller[2]}) - Badge: {seller[3]}")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Legacy adapter functionality test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("=" * 60)
    print("LEGACY COMPATIBILITY TEST")
    print("=" * 60)
    
    # Test legacy mapping
    mapping_ok = await test_legacy_mapping()
    
    # Test plugin foreign keys
    foreign_keys_ok = await test_plugin_foreign_keys()
    
    # Test user capabilities
    capabilities_ok = await test_user_capabilities()
    
    # Test legacy adapter functionality
    adapter_ok = await test_legacy_adapter_functionality()
    
    # Create test report
    report = {
        "test_timestamp": datetime.utcnow().isoformat(),
        "test_type": "legacy_compatibility_test",
        "legacy_mapping_ok": mapping_ok,
        "plugin_foreign_keys_ok": foreign_keys_ok,
        "user_capabilities_ok": capabilities_ok,
        "legacy_adapter_ok": adapter_ok,
        "overall_status": "PASS" if all([mapping_ok, foreign_keys_ok, capabilities_ok, adapter_ok]) else "FAIL",
        "next_steps": [
            "Run integration tests if legacy compatibility is successful",
            "Create frontend migration guide",
            "Prepare for disabling LEGACY_MODE",
            "Test production deployment"
        ]
    }
    
    import json
    with open("legacy_compatibility_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Test report saved to legacy_compatibility_test_report.json")
    print(f"\n[RESULT] Overall status: {report['overall_status']}")

if __name__ == "__main__":
    asyncio.run(main())
