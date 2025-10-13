#!/usr/bin/env python3
"""
Test Migration Status
Tests the current migration status and verifies the new user model is working.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_migration_status():
    """Test the current migration status"""
    print("[INFO] Testing migration status...")
    
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        
        # Create async engine
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            print("\n[TEST] Checking database tables...")
            
            # Check if new tables exist
            result = await conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_name IN ('users_new', 'legacy_mapping', 'user_capabilities', 'offers')
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            print(f"New tables found: {[t[0] for t in tables]}")
            
            # Check legacy mapping
            result = await conn.execute(text("""
                SELECT legacy_table, COUNT(*) as count 
                FROM legacy_mapping 
                GROUP BY legacy_table 
                ORDER BY legacy_table;
            """))
            mappings = result.fetchall()
            print(f"\nLegacy mappings:")
            for mapping in mappings:
                print(f"  {mapping[0]}: {mapping[1]} records")
            
            # Check users_new table
            result = await conn.execute(text("SELECT COUNT(*) FROM users_new"))
            users_count = result.scalar()
            print(f"\nUsers in users_new table: {users_count}")
            
            # Check legacy tables
            result = await conn.execute(text("SELECT COUNT(*) FROM users"))
            legacy_users = result.scalar()
            print(f"Users in legacy users table: {legacy_users}")
            
            result = await conn.execute(text("SELECT COUNT(*) FROM sellers"))
            legacy_sellers = result.scalar()
            print(f"Sellers in legacy sellers table: {legacy_sellers}")
            
            result = await conn.execute(text("SELECT COUNT(*) FROM buyers"))
            legacy_buyers = result.scalar()
            print(f"Buyers in legacy buyers table: {legacy_buyers}")
            
            # Test a sample user
            result = await conn.execute(text("""
                SELECT unique_id, username, email, badge 
                FROM users_new 
                LIMIT 3;
            """))
            sample_users = result.fetchall()
            print(f"\nSample users in users_new:")
            for user in sample_users:
                print(f"  {user[0]} - {user[1]} ({user[2]}) - Badge: {user[3]}")
            
            # Test legacy mapping
            result = await conn.execute(text("""
                SELECT lm.legacy_table, lm.legacy_id, un.unique_id, un.badge
                FROM legacy_mapping lm
                JOIN users_new un ON lm.new_user_id = un.id
                LIMIT 3;
            """))
            sample_mappings = result.fetchall()
            print(f"\nSample legacy mappings:")
            for mapping in sample_mappings:
                print(f"  {mapping[0]}.{mapping[1]} -> {mapping[2]} (Badge: {mapping[3]})")
            
            print("\n[SUCCESS] Migration status test completed successfully!")
            
    except Exception as e:
        print(f"[ERROR] Migration status test failed: {e}")
        return False
    
    return True

async def test_plugin_tables():
    """Test that plugin tables have the new foreign key columns"""
    print("\n[INFO] Testing plugin table foreign keys...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Check some key plugin tables for new foreign key columns
            plugin_tables = ['orders', 'products', 'payments', 'ratings', 'notifications']
            
            for table in plugin_tables:
                result = await conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '{table}' 
                    AND column_name LIKE 'new_%_id'
                    ORDER BY column_name;
                """))
                columns = result.fetchall()
                if columns:
                    print(f"  {table}: {[c[0] for c in columns]}")
                else:
                    print(f"  {table}: No new foreign key columns found")
        
        print("[SUCCESS] Plugin table foreign key test completed!")
        
    except Exception as e:
        print(f"[ERROR] Plugin table test failed: {e}")
        return False
    
    return True

async def main():
    """Main test function"""
    print("=" * 60)
    print("MIGRATION STATUS TEST")
    print("=" * 60)
    
    # Test migration status
    migration_ok = await test_migration_status()
    
    # Test plugin tables
    plugin_ok = await test_plugin_tables()
    
    # Create test report
    report = {
        "test_timestamp": datetime.utcnow().isoformat(),
        "test_type": "migration_status_test",
        "migration_status_ok": migration_ok,
        "plugin_tables_ok": plugin_ok,
        "overall_status": "PASS" if migration_ok and plugin_ok else "FAIL",
        "next_steps": [
            "Test plugin endpoints if migration is successful",
            "Update authentication middleware",
            "Test legacy compatibility endpoints",
            "Run integration tests"
        ]
    }
    
    import json
    with open("migration_status_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Test report saved to migration_status_test_report.json")
    print(f"\n[RESULT] Overall status: {report['overall_status']}")

if __name__ == "__main__":
    asyncio.run(main())
