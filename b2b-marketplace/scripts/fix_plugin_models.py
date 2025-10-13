#!/usr/bin/env python3
"""
Fix Plugin Models - Add Missing new_user_id Columns
This script fixes all plugin models that are missing new_user_id columns.
"""

import os
import re
import sys
from pathlib import Path

def fix_model_file(file_path):
    """Fix a single model file by adding missing new_user_id columns"""
    print(f"Fixing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Find all classes that have foreign_keys=[new_user_id] but no new_user_id column
    # Look for patterns like: foreign_keys=[new_user_id]
    foreign_key_patterns = re.findall(r'foreign_keys=\[new_user_id\]', content)
    
    if not foreign_key_patterns:
        print(f"[SKIP] No new_user_id foreign keys found in {file_path}")
        return False
    
    # Find all class definitions
    class_pattern = r'class\s+(\w+)\(Base\):'
    classes = re.findall(class_pattern, content)
    
    for class_name in classes:
        # Find the class definition and its columns
        class_start = content.find(f'class {class_name}(Base):')
        if class_start == -1:
            continue
            
        # Find the end of the class (next class or end of file)
        next_class = content.find('\nclass ', class_start + 1)
        if next_class == -1:
            class_end = len(content)
        else:
            class_end = next_class
            
        class_content = content[class_start:class_end]
        
        # Check if this class has foreign_keys=[new_user_id] but no new_user_id column
        if 'foreign_keys=[new_user_id]' in class_content and 'new_user_id = Column' not in class_content:
            print(f"  Found class {class_name} missing new_user_id column")
            
            # Find the first Column definition to add new_user_id after it
            column_pattern = r'(\s+)(\w+)\s*=\s*Column\('
            first_column = re.search(column_pattern, class_content)
            
            if first_column:
                # Add new_user_id column after the first column
                indent = first_column.group(1)
                new_column = f'{indent}new_user_id = Column(UUID, ForeignKey("users_new.id"), nullable=True)\n'
                
                # Insert after the first column
                insert_pos = first_column.end()
                class_content = class_content[:insert_pos] + new_column + class_content[insert_pos:]
                
                # Update the main content
                content = content[:class_start] + class_content + content[class_end:]
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Fixed {file_path}")
        return True
    else:
        print(f"[SKIP] No changes needed for {file_path}")
        return False

def main():
    """Main function to fix all plugin models"""
    print("[INFO] Fixing plugin models with missing new_user_id columns...")
    
    plugins_dir = Path("plugins")
    fixed_files = []
    
    # Find all model files
    model_files = list(plugins_dir.glob("*/models.py"))
    
    print(f"Found {len(model_files)} model files to check")
    
    for model_file in model_files:
        try:
            if fix_model_file(model_file):
                fixed_files.append(str(model_file))
        except Exception as e:
            print(f"[ERROR] Error fixing {model_file}: {e}")
    
    print(f"\n[SUCCESS] Fixed {len(fixed_files)} model files:")
    for file in fixed_files:
        print(f"  - {file}")
    
    # Create fix report
    report = {
        "fix_timestamp": "2025-10-04T13:00:00Z",
        "fix_type": "plugin_models_new_user_id_columns",
        "files_fixed": fixed_files,
        "total_files_processed": len(model_files),
        "successful_fixes": len(fixed_files),
        "next_steps": [
            "Test application import",
            "Test all plugin endpoints",
            "Verify no broken relationships"
        ]
    }
    
    import json
    with open("plugin_models_fix_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Fix report saved to plugin_models_fix_report.json")

if __name__ == "__main__":
    main()
