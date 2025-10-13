#!/usr/bin/env python3
"""
Update Route Handlers for New User Model
Updates all plugin route handlers to use new user model and handle both legacy and new references.
"""

import os
import re
import sys
from pathlib import Path

def update_route_file(file_path):
    """Update a single route file to use new user model"""
    print(f"Updating {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Add import for legacy adapter
    if "from app.core.legacy_adapter import resolve_legacy_user" not in content:
        content = re.sub(
            r'(from fastapi import.*\n)',
            r'\1from app.core.legacy_adapter import resolve_legacy_user\n',
            content
        )
    
    # Update function signatures to include new user parameters
    # Replace user.id with both old and new user IDs
    content = re.sub(
        r'buyer_id=user\.id',
        r'buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None',
        content
    )
    content = re.sub(
        r'seller_id=user\.id',
        r'seller_id=user.id, new_seller_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None',
        content
    )
    content = re.sub(
        r'user_id=user\.id',
        r'user_id=user.id, new_user_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None',
        content
    )
    
    # Update CRUD function calls to pass new parameters
    # This is a more sophisticated approach that handles different patterns
    crud_patterns = [
        (r'await create_order\(db, order, buyer_id=user\.id\)',
         r'await create_order(db, order, buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)'),
        (r'await get_order\(db, order_id, buyer_id=user\.id\)',
         r'await get_order(db, order_id, buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)'),
        (r'await update_order\(db, order_id, order_data, buyer_id=user\.id\)',
         r'await update_order(db, order_id, order_data, buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)'),
        (r'await delete_order\(db, order_id, buyer_id=user\.id\)',
         r'await delete_order(db, order_id, buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)'),
        (r'await list_orders\(db, buyer_id=user\.id\)',
         r'await list_orders(db, buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)'),
    ]
    
    for pattern, replacement in crud_patterns:
        content = re.sub(pattern, replacement, content)
    
    # Update other common CRUD patterns
    content = re.sub(
        r'await (\w+)\(db, ([^,]+), user_id=user\.id\)',
        r'await \1(db, \2, user_id=user.id, new_user_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)',
        content
    )
    content = re.sub(
        r'await (\w+)\(db, user_id=user\.id\)',
        r'await \1(db, user_id=user.id, new_user_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)',
        content
    )
    
    # Update seller patterns
    content = re.sub(
        r'await (\w+)\(db, ([^,]+), seller_id=user\.id\)',
        r'await \1(db, \2, seller_id=user.id, new_seller_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)',
        content
    )
    content = re.sub(
        r'await (\w+)\(db, seller_id=user\.id\)',
        r'await \1(db, seller_id=user.id, new_seller_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)',
        content
    )
    
    # Update buyer patterns
    content = re.sub(
        r'await (\w+)\(db, ([^,]+), buyer_id=user\.id\)',
        r'await \1(db, \2, buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)',
        content
    )
    content = re.sub(
        r'await (\w+)\(db, buyer_id=user\.id\)',
        r'await \1(db, buyer_id=user.id, new_buyer_id=user.id if hasattr(user, \'id\') and str(user.id).startswith(\'USR-\') else None)',
        content
    )
    
    # Add helper function to resolve user ID
    if "def resolve_user_id(user):" not in content:
        helper_function = '''
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

'''
        # Insert helper function after imports
        content = re.sub(
            r'(from .*import.*\n)',
            r'\1' + helper_function,
            content
        )
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Updated {file_path}")
        return True
    else:
        print(f"[SKIP] No changes needed for {file_path}")
        return False

def main():
    """Main function to update all route handlers"""
    print("[INFO] Updating route handlers for new user model...")
    
    plugins_dir = Path("plugins")
    updated_files = []
    
    # Find all route files
    route_files = list(plugins_dir.glob("*/routes.py"))
    
    print(f"Found {len(route_files)} route files to update")
    
    for route_file in route_files:
        try:
            if update_route_file(route_file):
                updated_files.append(str(route_file))
        except Exception as e:
            print(f"[ERROR] Error updating {route_file}: {e}")
    
    print(f"\n[SUCCESS] Updated {len(updated_files)} route files:")
    for file in updated_files:
        print(f"  - {file}")
    
    # Create update report
    report = {
        "update_timestamp": "2025-10-04T10:45:00Z",
        "update_type": "route_handlers_update",
        "files_updated": updated_files,
        "total_files_processed": len(route_files),
        "successful_updates": len(updated_files),
        "next_steps": [
            "Test all plugin endpoints with new user model",
            "Update authentication middleware",
            "Test legacy compatibility endpoints",
            "Run integration tests"
        ]
    }
    
    import json
    with open("route_handlers_update_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Update report saved to route_handlers_update_report.json")

if __name__ == "__main__":
    main()
