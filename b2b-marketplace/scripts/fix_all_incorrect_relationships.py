#!/usr/bin/env python3
"""
Fix All Incorrect Relationships - Remove Invalid Foreign Key References
This script removes all relationships that reference non-existent columns.
"""

import os
import re
from pathlib import Path

def fix_incorrect_relationships(file_path):
    """Fix incorrect relationships in a model file"""
    print(f"Fixing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove all relationships that reference non-existent columns
    # Pattern: relationship("User", foreign_keys=[new_*_id])
    content = re.sub(
        r'# New relationship to unified User model\s*\n\s*new_\w+ = relationship\("User", foreign_keys=\[new_\w+_id\]\)\s*\n',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # Remove duplicate relationship definitions
    content = re.sub(
        r'# New relationship to unified User model\s*\n\s*new_\w+ = relationship\("User"\)\s*\n',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # Remove any remaining incorrect relationships
    content = re.sub(
        r'\s*new_\w+ = relationship\("User", foreign_keys=\[new_\w+_id\]\)\s*\n',
        '',
        content,
        flags=re.MULTILINE
    )
    
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
    """Main function to fix all model files"""
    print("[INFO] Fixing all incorrect relationships in plugin model files...")
    
    plugins_dir = Path("plugins")
    fixed_files = []
    
    # Find all model files
    model_files = list(plugins_dir.glob("*/models.py"))
    
    print(f"Found {len(model_files)} model files to check")
    
    for model_file in model_files:
        try:
            if fix_incorrect_relationships(model_file):
                fixed_files.append(str(model_file))
        except Exception as e:
            print(f"[ERROR] Error fixing {model_file}: {e}")
    
    print(f"\n[SUCCESS] Fixed {len(fixed_files)} model files:")
    for file in fixed_files:
        print(f"  - {file}")
    
    # Create fix report
    report = {
        "fix_timestamp": "2025-10-04T13:30:00Z",
        "fix_type": "remove_incorrect_relationships",
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
    with open("incorrect_relationships_fix_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Fix report saved to incorrect_relationships_fix_report.json")

if __name__ == "__main__":
    main()
