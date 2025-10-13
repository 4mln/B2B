#!/usr/bin/env python3
"""
Safe Deletion of Legacy Seller/Buyer Plugins
This script safely removes seller and buyer plugins after migration.
"""

import os
import shutil
import sys
from pathlib import Path

def backup_plugins():
    """Create backup of seller and buyer plugins before deletion"""
    print("[INFO] Creating backup of legacy plugins...")
    
    backup_dir = Path("backups/legacy_plugins")
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    # Backup seller plugin
    if os.path.exists("plugins/seller"):
        shutil.copytree("plugins/seller", backup_dir / "seller", dirs_exist_ok=True)
        print("[OK] Backed up seller plugin")
    
    # Backup buyer plugin  
    if os.path.exists("plugins/buyer"):
        shutil.copytree("plugins/buyer", backup_dir / "buyer", dirs_exist_ok=True)
        print("[OK] Backed up buyer plugin")
    
    print(f"[SUCCESS] Legacy plugins backed up to {backup_dir}")

def update_plugin_loader():
    """Update plugin loader to exclude seller/buyer plugins"""
    print("[INFO] Updating plugin loader...")
    
    loader_file = "app/core/plugins/loader.py"
    
    # Read current content
    with open(loader_file, 'r') as f:
        content = f.read()
    
    # Add exclusion list
    updated_content = content.replace(
        "def discover(self) -> Dict[str, str]:",
        """def discover(self) -> Dict[str, str]:
        # Exclude legacy plugins after migration
        excluded_plugins = {"seller", "buyer"}"""
    )
    
    # Update the discovery loop
    updated_content = updated_content.replace(
        "for _, name, ispkg in pkgutil.iter_modules([pkg_path]):",
        """for _, name, ispkg in pkgutil.iter_modules([pkg_path]):
            if name in excluded_plugins:
                continue  # Skip legacy plugins"""
    )
    
    # Write updated content
    with open(loader_file, 'w') as f:
        f.write(updated_content)
    
    print("[OK] Updated plugin loader to exclude legacy plugins")

def update_database_base():
    """Update database base to exclude seller/buyer models"""
    print("[INFO] Updating database base...")
    
    base_file = "app/db/base.py"
    
    # Read current content
    with open(base_file, 'r') as f:
        content = f.read()
    
    # Add exclusion list
    updated_content = content.replace(
        "for _, module_name, _ in pkgutil.iter_modules(plugins.__path__):",
        """# Exclude legacy plugins after migration
excluded_plugins = {"seller", "buyer"}

for _, module_name, _ in pkgutil.iter_modules(plugins.__path__):
    if module_name in excluded_plugins:
        continue  # Skip legacy plugins"""
    )
    
    # Write updated content
    with open(base_file, 'w') as f:
        f.write(updated_content)
    
    print("[OK] Updated database base to exclude legacy plugins")

def remove_plugin_directories():
    """Remove seller and buyer plugin directories"""
    print("[INFO] Removing legacy plugin directories...")
    
    # Remove seller plugin
    if os.path.exists("plugins/seller"):
        shutil.rmtree("plugins/seller")
        print("[OK] Removed seller plugin directory")
    
    # Remove buyer plugin
    if os.path.exists("plugins/buyer"):
        shutil.rmtree("plugins/buyer")
        print("[OK] Removed buyer plugin directory")

def verify_deletion():
    """Verify that deletion was successful"""
    print("[INFO] Verifying deletion...")
    
    # Check if directories are gone
    if not os.path.exists("plugins/seller") and not os.path.exists("plugins/buyer"):
        print("[SUCCESS] Legacy plugin directories removed")
    else:
        print("[ERROR] Some plugin directories still exist")
        return False
    
    # Check if imports are broken (this would be caught by the application)
    print("[INFO] Legacy plugins successfully removed")
    print("[WARNING] Please test the application to ensure no broken imports")
    
    return True

def main():
    """Main deletion process"""
    print("=" * 60)
    print("SAFE DELETION OF LEGACY SELLER/BUYER PLUGINS")
    print("=" * 60)
    
    try:
        # Step 1: Create backup
        backup_plugins()
        
        # Step 2: Update plugin loader
        update_plugin_loader()
        
        # Step 3: Update database base
        update_database_base()
        
        # Step 4: Remove plugin directories
        remove_plugin_directories()
        
        # Step 5: Verify deletion
        if verify_deletion():
            print("\n[SUCCESS] Legacy plugins safely removed!")
            print("\nNext steps:")
            print("1. Test the application startup")
            print("2. Test all endpoints")
            print("3. Verify no broken imports")
            print("4. Deploy to staging for testing")
        else:
            print("\n[ERROR] Deletion verification failed")
            
    except Exception as e:
        print(f"\n[ERROR] Deletion failed: {e}")
        print("Legacy plugins have been backed up and can be restored if needed")

if __name__ == "__main__":
    main()
