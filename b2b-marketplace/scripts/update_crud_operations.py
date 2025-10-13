#!/usr/bin/env python3
"""
Update CRUD Operations for New User Model
Updates all plugin CRUD operations to use new foreign key columns.
"""

import os
import re
import sys
from pathlib import Path

def update_crud_file(file_path):
    """Update a single CRUD file to use new foreign key columns"""
    print(f"Updating {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Update function parameters and variable names
    # buyer_id -> buyer_id (keep old) and add new_buyer_id
    content = re.sub(r'(\w+): int.*buyer_id', r'\1: int, buyer_id: int, new_buyer_id: str = None', content)
    content = re.sub(r'buyer_id: int\)', r'buyer_id: int, new_buyer_id: str = None)', content)
    
    # seller_id -> seller_id (keep old) and add new_seller_id  
    content = re.sub(r'(\w+): int.*seller_id', r'\1: int, seller_id: int, new_seller_id: str = None', content)
    content = re.sub(r'seller_id: int\)', r'seller_id: int, new_seller_id: str = None)', content)
    
    # user_id -> user_id (keep old) and add new_user_id
    content = re.sub(r'(\w+): int.*user_id', r'\1: int, user_id: int, new_user_id: str = None', content)
    content = re.sub(r'user_id: int\)', r'user_id: int, new_user_id: str = None)', content)
    
    # Update database queries to use new columns when available
    # Replace WHERE clauses that use old foreign keys
    content = re.sub(
        r'Order\.buyer_id == buyer_id',
        r'Order.new_buyer_id == new_buyer_id if new_buyer_id else Order.buyer_id == buyer_id',
        content
    )
    content = re.sub(
        r'Order\.seller_id == seller_id', 
        r'Order.new_seller_id == new_seller_id if new_seller_id else Order.seller_id == seller_id',
        content
    )
    
    # Update other common patterns
    content = re.sub(
        r'(\w+)\.user_id == user_id',
        r'\1.new_user_id == new_user_id if new_user_id else \1.user_id == user_id',
        content
    )
    content = re.sub(
        r'(\w+)\.buyer_id == buyer_id',
        r'\1.new_buyer_id == new_buyer_id if new_buyer_id else \1.buyer_id == buyer_id',
        content
    )
    content = re.sub(
        r'(\w+)\.seller_id == seller_id',
        r'\1.new_seller_id == new_seller_id if new_seller_id else \1.seller_id == seller_id',
        content
    )
    
    # Update object creation to use new foreign keys when available
    content = re.sub(
        r'buyer_id=buyer_id,',
        r'buyer_id=buyer_id, new_buyer_id=new_buyer_id,',
        content
    )
    content = re.sub(
        r'seller_id=seller_id,',
        r'seller_id=seller_id, new_seller_id=new_seller_id,',
        content
    )
    content = re.sub(
        r'user_id=user_id,',
        r'user_id=user_id, new_user_id=new_user_id,',
        content
    )
    
    # Update filter conditions
    content = re.sub(
        r'where\((\w+)\.buyer_id == buyer_id\)',
        r'where(\1.new_buyer_id == new_buyer_id if new_buyer_id else \1.buyer_id == buyer_id)',
        content
    )
    content = re.sub(
        r'where\((\w+)\.seller_id == seller_id\)',
        r'where(\1.new_seller_id == new_seller_id if new_seller_id else \1.seller_id == seller_id)',
        content
    )
    content = re.sub(
        r'where\((\w+)\.user_id == user_id\)',
        r'where(\1.new_user_id == new_user_id if new_user_id else \1.user_id == user_id)',
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
    """Main function to update all CRUD operations"""
    print("[INFO] Updating CRUD operations for new user model...")
    
    plugins_dir = Path("plugins")
    updated_files = []
    
    # Find all CRUD files
    crud_files = list(plugins_dir.glob("*/crud.py"))
    
    print(f"Found {len(crud_files)} CRUD files to update")
    
    for crud_file in crud_files:
        try:
            if update_crud_file(crud_file):
                updated_files.append(str(crud_file))
        except Exception as e:
            print(f"[ERROR] Error updating {crud_file}: {e}")
    
    print(f"\n[SUCCESS] Updated {len(updated_files)} CRUD files:")
    for file in updated_files:
        print(f"  - {file}")
    
    # Create update report
    report = {
        "update_timestamp": "2025-10-04T10:30:00Z",
        "update_type": "crud_operations_update",
        "files_updated": updated_files,
        "total_files_processed": len(crud_files),
        "successful_updates": len(updated_files),
        "next_steps": [
            "Update route handlers to pass new foreign key parameters",
            "Test all CRUD operations with new user model",
            "Update authentication middleware",
            "Test plugin endpoints"
        ]
    }
    
    import json
    with open("crud_update_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Update report saved to crud_update_report.json")

if __name__ == "__main__":
    main()
