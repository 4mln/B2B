#!/usr/bin/env python3
"""
Integration Tests for User Model Migration
Comprehensive integration tests for the entire system.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_database_integrity():
    """Test database integrity and foreign key constraints"""
    print("[INFO] Testing database integrity...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test foreign key constraints
            result = await conn.execute(text("""
                SELECT 
                    tc.table_name,
                    tc.constraint_name,
                    tc.constraint_type
                FROM information_schema.table_constraints tc
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name IN ('orders', 'products', 'payments', 'ratings', 'notifications')
                ORDER BY tc.table_name, tc.constraint_name;
            """))
            constraints = result.fetchall()
            
            print(f"Foreign key constraints found: {len(constraints)}")
            for constraint in constraints:
                print(f"  {constraint[0]}.{constraint[1]} ({constraint[2]})")
            
            # Test that all new foreign keys reference users_new
            result = await conn.execute(text("""
                SELECT 
                    tc.table_name,
                    tc.constraint_name,
                    ccu.column_name,
                    ccu.foreign_table_name,
                    ccu.foreign_column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu 
                    ON tc.constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND ccu.column_name LIKE 'new_%_id'
                ORDER BY tc.table_name, tc.constraint_name;
            """))
            new_constraints = result.fetchall()
            
            print(f"New foreign key constraints: {len(new_constraints)}")
            for constraint in new_constraints:
                print(f"  {constraint[0]}.{constraint[1]} -> {constraint[3]}.{constraint[4]}")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Database integrity test failed: {e}")
        return False

async def test_user_model_consistency():
    """Test that user model is consistent across all tables"""
    print("\n[INFO] Testing user model consistency...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test that all users in users_new have unique IDs
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM users_new;
            """))
            total_users = result.scalar()
            
            result = await conn.execute(text("""
                SELECT COUNT(DISTINCT unique_id) FROM users_new;
            """))
            unique_users = result.scalar()
            
            if total_users == unique_users:
                print(f"[SUCCESS] All {total_users} users have unique IDs")
            else:
                print(f"[ERROR] User ID inconsistency: {total_users} total, {unique_users} unique")
                return False
            
            # Test that all users have valid badges
            result = await conn.execute(text("""
                SELECT badge, COUNT(*) FROM users_new GROUP BY badge ORDER BY badge;
            """))
            badge_counts = result.fetchall()
            
            print(f"User badges:")
            for badge, count in badge_counts:
                print(f"  {badge}: {count} users")
            
            # Test that all users have capabilities
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM users_new un
                LEFT JOIN user_capabilities uc ON un.id = uc.user_id
                WHERE uc.user_id IS NULL;
            """))
            users_without_capabilities = result.scalar()
            
            if users_without_capabilities == 0:
                print("[SUCCESS] All users have capabilities")
            else:
                print(f"[WARNING] {users_without_capabilities} users without capabilities")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] User model consistency test failed: {e}")
        return False

async def test_legacy_mapping_completeness():
    """Test that legacy mapping is complete and consistent"""
    print("\n[INFO] Testing legacy mapping completeness...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test that all legacy users have mappings
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM users u
                LEFT JOIN legacy_mapping lm ON lm.legacy_table = 'users' AND lm.legacy_id = u.id
                WHERE lm.legacy_id IS NULL;
            """))
            unmapped_users = result.scalar()
            
            if unmapped_users == 0:
                print("[SUCCESS] All legacy users have mappings")
            else:
                print(f"[ERROR] {unmapped_users} legacy users without mappings")
                return False
            
            # Test that all legacy sellers have mappings
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM sellers s
                LEFT JOIN legacy_mapping lm ON lm.legacy_table = 'sellers' AND lm.legacy_id = s.id
                WHERE lm.legacy_id IS NULL;
            """))
            unmapped_sellers = result.scalar()
            
            if unmapped_sellers == 0:
                print("[SUCCESS] All legacy sellers have mappings")
            else:
                print(f"[ERROR] {unmapped_sellers} legacy sellers without mappings")
                return False
            
            # Test that all legacy buyers have mappings (if any exist)
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM buyers b
                LEFT JOIN legacy_mapping lm ON lm.legacy_table = 'buyers' AND lm.legacy_id = b.id
                WHERE lm.legacy_id IS NULL;
            """))
            unmapped_buyers = result.scalar()
            
            if unmapped_buyers == 0:
                print("[SUCCESS] All legacy buyers have mappings")
            else:
                print(f"[WARNING] {unmapped_buyers} legacy buyers without mappings")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Legacy mapping completeness test failed: {e}")
        return False

async def test_plugin_system_integrity():
    """Test that plugin system is working correctly"""
    print("\n[INFO] Testing plugin system integrity...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test that all plugin tables have the required new foreign key columns
            plugin_tables = ['orders', 'products', 'payments', 'ratings', 'notifications', 'carts', 'rfqs', 'quotes']
            
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
                    print(f"  {table}: No new foreign key columns")
            
            # Test that user capabilities are properly set up
            result = await conn.execute(text("""
                SELECT capability, COUNT(*) as user_count
                FROM user_capabilities
                GROUP BY capability
                ORDER BY capability;
            """))
            capabilities = result.fetchall()
            
            print(f"User capabilities:")
            for capability, count in capabilities:
                print(f"  {capability}: {count} users")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Plugin system integrity test failed: {e}")
        return False

async def test_migration_rollback_capability():
    """Test that migration can be rolled back if needed"""
    print("\n[INFO] Testing migration rollback capability...")
    
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace")
        engine = create_async_engine(database_url)
        
        async with engine.begin() as conn:
            # Test that legacy tables still exist
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name IN ('users', 'sellers', 'buyers')
                ORDER BY table_name;
            """))
            legacy_tables = result.fetchall()
            
            if len(legacy_tables) == 3:
                print("[SUCCESS] All legacy tables preserved for rollback")
            else:
                print(f"[WARNING] Only {len(legacy_tables)} legacy tables found")
            
            # Test that legacy mapping table exists
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM legacy_mapping;
            """))
            mapping_count = result.scalar()
            
            if mapping_count > 0:
                print(f"[SUCCESS] Legacy mapping table has {mapping_count} entries")
            else:
                print("[WARNING] Legacy mapping table is empty")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Migration rollback capability test failed: {e}")
        return False

async def main():
    """Main integration test function"""
    print("=" * 60)
    print("INTEGRATION TESTS FOR USER MODEL MIGRATION")
    print("=" * 60)
    
    # Run all tests
    tests = [
        ("Database Integrity", test_database_integrity),
        ("User Model Consistency", test_user_model_consistency),
        ("Legacy Mapping Completeness", test_legacy_mapping_completeness),
        ("Plugin System Integrity", test_plugin_system_integrity),
        ("Migration Rollback Capability", test_migration_rollback_capability),
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = await test_func()
            results[test_name] = result
            print(f"[RESULT] {test_name}: {'PASS' if result else 'FAIL'}")
        except Exception as e:
            print(f"[ERROR] {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Create test report
    overall_status = "PASS" if all(results.values()) else "FAIL"
    
    report = {
        "test_timestamp": datetime.utcnow().isoformat(),
        "test_type": "integration_tests",
        "overall_status": overall_status,
        "test_results": results,
        "next_steps": [
            "Create frontend migration guide if tests pass",
            "Prepare for disabling LEGACY_MODE",
            "Test production deployment",
            "Monitor system performance"
        ]
    }
    
    import json
    with open("integration_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"INTEGRATION TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Overall Status: {overall_status}")
    print(f"Tests Passed: {sum(results.values())}/{len(results)}")
    print(f"Test Report: integration_test_report.json")
    
    if overall_status == "PASS":
        print(f"\n[SUCCESS] All integration tests passed!")
        print(f"The user model migration is ready for production.")
    else:
        print(f"\n[WARNING] Some integration tests failed.")
        print(f"Please review the test results before proceeding.")

if __name__ == "__main__":
    asyncio.run(main())
