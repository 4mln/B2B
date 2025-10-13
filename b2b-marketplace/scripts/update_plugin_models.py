#!/usr/bin/env python3
"""
Plugin Model Updater
Updates all plugin model files to use new foreign key references.
This script modifies the SQLAlchemy model files to reference the new user model.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

class PluginModelUpdater:
    """Updates plugin model files to work with new User model"""
    
    def __init__(self):
        self.plugins_dir = Path("plugins")
        self.updates_made = []
        self.errors = []
        
        # Define the foreign key mappings for each plugin
        self.foreign_key_mappings = {
            "orders": {
                "buyer_id": "new_buyer_id",
                "seller_id": "new_seller_id"
            },
            "products": {
                "seller_id": "new_seller_id"
            },
            "payments": {
                "user_id": "new_user_id"
            },
            "ratings": {
                "rater_id": "new_rater_id",
                "ratee_id": "new_ratee_id",
                "seller_id": "new_seller_id"
            },
            "rfq": {
                "buyer_id": "new_buyer_id"
            },
            "quotes": {
                "seller_id": "new_seller_id"
            },
            "cart": {
                "user_id": "new_user_id"
            },
            "messaging": {
                "created_by": "new_created_by",
                "user_id": "new_user_id",
                "sender_id": "new_sender_id",
                "invited_by": "new_invited_by",
                "invited_user_id": "new_invited_user_id"
            },
            "notifications": {
                "user_id": "new_user_id"
            },
            "admin": {
                "user_id": "new_user_id"
            },
            "ads": {
                "seller_id": "new_seller_id",
                "user_id": "new_user_id"
            },
            "wallet": {
                "user_id": "new_user_id"
            },
            "subscriptions": {
                "user_id": "new_user_id"
            },
            "analytics": {
                "user_id": "new_user_id"
            },
            "gamification": {
                "user_id": "new_user_id"
            }
        }
    
    def update_all_plugin_models(self):
        """Update all plugin model files"""
        print("Starting plugin model updates...")
        
        for plugin_name in self.plugins_dir.iterdir():
            if plugin_name.is_dir() and not plugin_name.name.startswith('__'):
                self.update_plugin_model(plugin_name.name)
        
        self.generate_update_report()
    
    def update_plugin_model(self, plugin_name: str):
        """Update a specific plugin's model file"""
        model_file = self.plugins_dir / plugin_name / "models.py"
        
        if not model_file.exists():
            print(f"No models.py found for {plugin_name}")
            return
        
        print(f"Updating {plugin_name} models...")
        
        try:
            # Read the file
            with open(model_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Apply updates
            updated_content = self.apply_model_updates(content, plugin_name)
            
            # Write back if changes were made
            if updated_content != content:
                with open(model_file, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                
                self.updates_made.append(plugin_name)
                print(f"[OK] Updated {plugin_name}")
            else:
                print(f"- No updates needed for {plugin_name}")
                
        except Exception as e:
            error_msg = f"Error updating {plugin_name}: {e}"
            self.errors.append(error_msg)
            print(f"[ERROR] {error_msg}")
    
    def apply_model_updates(self, content: str, plugin_name: str) -> str:
        """Apply updates to model content"""
        updated_content = content
        
        # Get foreign key mappings for this plugin
        mappings = self.foreign_key_mappings.get(plugin_name, {})
        
        if not mappings:
            return updated_content
        
        # Update ForeignKey references
        for old_fk, new_fk in mappings.items():
            # Update ForeignKey definitions
            pattern = rf'(\w+)\s*=\s*Column\([^,]*ForeignKey\("users\.id"\)[^)]*\)'
            replacement = rf'\1 = Column(Integer, ForeignKey("users.id"), nullable=False)\n    {new_fk} = Column(UUID(as_uuid=True), ForeignKey("users_new.id"), nullable=True)'
            updated_content = re.sub(pattern, replacement, updated_content)
            
            # Update ForeignKey to sellers
            pattern = rf'(\w+)\s*=\s*Column\([^,]*ForeignKey\("sellers\.id"\)[^)]*\)'
            replacement = rf'\1 = Column(Integer, ForeignKey("sellers.id"), nullable=False)\n    {new_fk} = Column(UUID(as_uuid=True), ForeignKey("users_new.id"), nullable=True)'
            updated_content = re.sub(pattern, replacement, updated_content)
            
            # Update ForeignKey to buyers
            pattern = rf'(\w+)\s*=\s*Column\([^,]*ForeignKey\("buyers\.id"\)[^)]*\)'
            replacement = rf'\1 = Column(Integer, ForeignKey("buyers.id"), nullable=False)\n    {new_fk} = Column(UUID(as_uuid=True), ForeignKey("users_new.id"), nullable=True)'
            updated_content = re.sub(pattern, replacement, updated_content)
        
        # Add import for UUID if not present
        if 'UUID(as_uuid=True)' in updated_content and 'from sqlalchemy.dialects.postgresql import UUID' not in updated_content:
            # Find the import section and add UUID import
            import_pattern = r'(from sqlalchemy import [^\\n]*\n)'
            if re.search(import_pattern, updated_content):
                updated_content = re.sub(
                    import_pattern,
                    r'\1from sqlalchemy.dialects.postgresql import UUID\n',
                    updated_content
                )
            else:
                # Add at the beginning if no sqlalchemy imports found
                updated_content = 'from sqlalchemy.dialects.postgresql import UUID\n' + updated_content
        
        # Update relationship definitions
        updated_content = self.update_relationships(updated_content, plugin_name)
        
        return updated_content
    
    def update_relationships(self, content: str, plugin_name: str) -> str:
        """Update relationship definitions"""
        mappings = self.foreign_key_mappings.get(plugin_name, {})
        
        for old_fk, new_fk in mappings.items():
            # Update relationship to User
            pattern = rf'(\w+)\s*=\s*relationship\("User"[^)]*\)'
            replacement = rf'\1 = relationship("User")\n    # New relationship to unified User model\n    new_\1 = relationship("User", foreign_keys=[{new_fk}])'
            content = re.sub(pattern, replacement, content)
            
            # Update relationship to Seller
            pattern = rf'(\w+)\s*=\s*relationship\("Seller"[^)]*\)'
            replacement = rf'\1 = relationship("Seller")\n    # New relationship to unified User model\n    new_\1 = relationship("User", foreign_keys=[{new_fk}])'
            content = re.sub(pattern, replacement, content)
        
        return content
    
    def generate_update_report(self):
        """Generate update report"""
        report = {
            "update_timestamp": "2024-01-01T00:00:00Z",
            "update_type": "plugin_model_updates",
            "plugins_updated": self.updates_made,
            "plugins_with_errors": self.errors,
            "total_plugins_processed": len(list(self.plugins_dir.iterdir())),
            "successful_updates": len(self.updates_made),
            "errors": len(self.errors),
            "next_steps": [
                "Review updated model files",
                "Update CRUD operations to use new foreign keys",
                "Update route handlers to use new user references",
                "Test all plugin endpoints",
                "Update frontend to handle new user model"
            ]
        }
        
        with open("plugin_model_update_report.json", "w") as f:
            import json
            json.dump(report, f, indent=2)
        
        print(f"\nUpdate Report:")
        print(f"[OK] Successfully updated: {len(self.updates_made)} plugins")
        print(f"[ERROR] Errors: {len(self.errors)} plugins")
        print(f"Report saved to: plugin_model_update_report.json")

def main():
    """Main function"""
    updater = PluginModelUpdater()
    updater.update_all_plugin_models()

if __name__ == "__main__":
    main()
