# MIGRATION_GUIDE.md
# User Model Migration Guide

## Overview

This guide covers the complete migration from the legacy Seller/Buyer model to a unified User model in the B2B Marketplace application. The migration is designed to be zero-downtime with full backward compatibility.

## What Changed

### 1. Database Schema Changes
- **New Tables**: `users_new`, `legacy_mapping`, `user_capabilities`, `offers`
- **Updated Tables**: `analytics_events`, `user_points`, `user_badges` (added new_user_id columns)
- **Legacy Tables**: `users`, `sellers`, `buyers` (preserved during migration)
- **Foreign Key Updates**: All references updated to use new user IDs

### 2. Model Changes
- **Unified User Model**: Single model replacing Seller and Buyer with capability-based access
- **Capability System**: Role-based access control using capabilities instead of separate models
- **Legacy Mapping**: Complete mapping table for rollback and compatibility

### 3. API Changes
- **New Endpoints**: Unified auth and user management endpoints
- **Legacy Compatibility**: All old endpoints continue to work via adapter layer
- **Feature Endpoints**: New offers, analytics, gamification, and AI endpoints

### 4. Plugin System Changes
- **Capability-Based**: Plugins now register based on user capabilities
- **Migration Scripts**: Automatic migration of plugin configurations

## Migration Steps

### Step 1: Pre-Migration Setup

1. **Create Feature Branch**
   ```bash
   git checkout -b refactor/single-user-model
   ```

2. **Create Database Backup**
   ```bash
   python scripts/create_backup.py
   ```

3. **Run Dry Run Tests**
   ```bash
   python scripts/test_migration_dry_run.py
   ```

### Step 2: Database Migration

1. **Run Alembic Migration**
   ```bash
   alembic upgrade head
   ```

2. **Verify New Tables**
   ```sql
   \dt users_new
   \dt legacy_mapping
   \dt user_capabilities
   ```

### Step 3: Data Migration

1. **Run Data Migration Script**
   ```bash
   python scripts/migrate_data.py
   ```

2. **Verify Migration Results**
   ```bash
   cat migration_report.json
   ```

3. **Run Comprehensive Plugin Migration**
   ```bash
   python scripts/comprehensive_plugin_migration.py
   ```

4. **Update Plugin Model Files**
   ```bash
   python scripts/update_plugin_models.py
   ```

### Step 4: Plugin Updates

1. **Review Plugin Analysis**
   ```bash
   cat PLUGIN_COMPATIBILITY_ANALYSIS.md
   ```

2. **Verify Plugin Migration**
   ```bash
   cat comprehensive_plugin_migration_report.json
   ```

3. **Verify Model Updates**
   ```bash
   cat plugin_model_update_report.json
   ```

### Step 5: Testing

1. **Run Unit Tests**
   ```bash
   pytest tests/test_user_migration.py -v
   ```

2. **Test Legacy Endpoints**
   ```bash
   curl http://localhost:8000/api/v1/legacy/sellers/1
   curl http://localhost:8000/api/v1/legacy/buyers/1
   ```

3. **Test New Endpoints**
   ```bash
   curl http://localhost:8000/api/v1/users/USR-123456789
   curl http://localhost:8000/api/v1/offers/
   ```

### Step 5: Frontend Migration

1. **Update API Calls**: Replace Seller/Buyer endpoints with User endpoints
2. **Update Authentication**: Use new auth endpoints
3. **Test User Flows**: Verify all user interactions work

### Step 6: Legacy Mode Disable

1. **Set Environment Variable**
   ```bash
   export LEGACY_MODE=false
   ```

2. **Restart Application**
   ```bash
   systemctl restart b2b-marketplace
   ```

3. **Verify Legacy Endpoints Return 410**
   ```bash
   curl http://localhost:8000/api/v1/legacy/sellers/1
   # Should return 410 Gone
   ```

### Step 7: Cleanup (Optional)

1. **Drop Legacy Tables** (Only after confirming everything works)
   ```sql
   DROP TABLE sellers;
   DROP TABLE buyers;
   DROP TABLE users_old;
   ```

## Configuration

### Environment Variables

```bash
# Enable/disable legacy mode
LEGACY_MODE=true  # Default: true

# Enable metrics collection
METRICS_ENABLED=false  # Default: false

# Database connection
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/marketplace
```

### Settings Update

The `app/core/config.py` file has been updated with:
- `LEGACY_MODE`: Controls legacy endpoint availability
- `METRICS_ENABLED`: Enables metrics collection for deprecated endpoints

## API Endpoints

### New User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | User registration |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/otp/request` | Request OTP |
| POST | `/api/v1/auth/otp/verify` | Verify OTP |
| GET | `/api/v1/users/{unique_id}` | Public user profile |
| GET | `/api/v1/users/me/profile` | Private user profile |
| PATCH | `/api/v1/users/me/profile` | Update profile |

### Legacy Compatibility Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/v1/legacy/sellers/{id}` | Get seller (mapped) | Deprecated |
| GET | `/api/v1/legacy/buyers/{id}` | Get buyer (mapped) | Deprecated |
| GET | `/api/v1/legacy/users/{id}` | Get user (mapped) | Deprecated |

### New Feature Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/offers/` | Create offer |
| GET | `/api/v1/offers/` | List offers |
| POST | `/api/v1/ai/summarize` | Summarize text |
| GET | `/api/v1/ai/recommendations` | Get recommendations |

### Existing Plugin Endpoints (Updated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analytics/events` | Track analytics event |
| GET | `/api/v1/analytics/events` | Get analytics events |
| POST | `/api/v1/gamification/points` | Award points |
| GET | `/api/v1/gamification/points/{user_id}` | Get user points |
| POST | `/api/v1/gamification/badges` | Assign badge |
| GET | `/api/v1/gamification/badges/{user_id}` | Get user badges |

## Capability System

### Available Capabilities

#### Seller Capabilities
- `can_post_offers`: Create and manage product offers
- `can_view_analytics`: View seller analytics dashboard
- `can_manage_inventory`: Manage product inventory
- `can_process_orders`: Process and fulfill orders
- `can_manage_store`: Manage store settings and policies

#### Buyer Capabilities
- `can_browse_products`: Browse and search products
- `can_create_orders`: Create and place orders
- `can_view_order_history`: View order history
- `can_leave_reviews`: Leave product reviews and ratings
- `can_save_products`: Save products to wishlist

#### Shared Capabilities
- `can_send_messages`: Send messages to other users
- `can_view_profiles`: View other user profiles
- `can_participate_forums`: Participate in community forums
- `can_access_support`: Access customer support

### Badge to Capability Mapping

- **seller**: All seller + shared capabilities
- **buyer**: All buyer + shared capabilities  
- **seller/buyer**: All capabilities

## Rollback Instructions

### Emergency Rollback

1. **Stop Application**
   ```bash
   systemctl stop b2b-marketplace
   ```

2. **Restore Database**
   ```bash
   cd backups/migration_backup_YYYYMMDD_HHMMSS
   ./rollback.sh
   ```

3. **Downgrade Migration**
   ```bash
   alembic downgrade -1
   ```

4. **Restart Application**
   ```bash
   systemctl start b2b-marketplace
   ```

### Partial Rollback

1. **Re-enable Legacy Mode**
   ```bash
   export LEGACY_MODE=true
   ```

2. **Restart Application**
   ```bash
   systemctl restart b2b-marketplace
   ```

## Monitoring and Metrics

### Migration Status Endpoint

```bash
curl http://localhost:8000/api/v1/legacy/migration/status
```

Returns:
```json
{
  "legacy_mode_enabled": true,
  "migration_stats": {
    "mappings_by_table": {
      "users": 150,
      "sellers": 75,
      "buyers": 200
    },
    "total_conflicts": 5,
    "legacy_mode_enabled": true
  }
}
```

### Logging

All legacy endpoint usage is logged with `DEPRECATED` warnings:
```
WARNING: DEPRECATED: Legacy seller endpoint used for seller_id 123
```

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check database connectivity
   - Verify backup exists
   - Run dry run tests first

2. **Legacy Endpoints Not Working**
   - Check `LEGACY_MODE` setting
   - Verify legacy mapping table exists
   - Check adapter logs

3. **Capability Issues**
   - Verify user has correct badge
   - Check capability grants in database
   - Run capability migration script

4. **Foreign Key Errors**
   - Check legacy mapping completeness
   - Verify all references updated
   - Run foreign key update script

### Debug Commands

```sql
-- Check migration status
SELECT legacy_table, COUNT(*) FROM legacy_mapping GROUP BY legacy_table;

-- Check user capabilities
SELECT u.unique_id, u.badge, uc.capability 
FROM users_new u 
LEFT JOIN user_capabilities uc ON u.id = uc.user_id 
WHERE u.unique_id = 'USR-123456789';

-- Check conflicts
SELECT * FROM legacy_mapping WHERE conflict_resolved = true;
```

## Support

For issues or questions:
1. Check the migration report files
2. Review application logs
3. Run dry run tests
4. Contact the development team

## Changelog

### Version 1.0.0 - User Model Migration
- ✅ Unified User model implementation
- ✅ Legacy compatibility layer
- ✅ Capability-based access control
- ✅ New feature endpoints (offers, analytics, gamification, AI)
- ✅ Complete migration scripts
- ✅ Comprehensive testing suite
- ✅ Zero-downtime migration process
- ✅ Rollback capabilities
