#!/usr/bin/env python3
"""
Fix All Broken Models - Comprehensive Fix
This script fixes all broken syntax in plugin model files.
"""

import os
import re
from pathlib import Path

def fix_broken_syntax(file_path):
    """Fix broken syntax in a model file"""
    print(f"Fixing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix broken column definitions
    # Pattern: id = Column(\n\n    new_user_id = Column(...)\nInteger, primary_key=True, index=True)
    content = re.sub(
        r'id = Column\(\s*\n\s*\n\s*new_user_id = Column\(UUID, ForeignKey\("users_new\.id"\), nullable=True\)\nInteger, primary_key=True, index=True\)',
        r'id = Column(Integer, primary_key=True, index=True)\n    new_user_id = Column(UUID, ForeignKey("users_new.id"), nullable=True)',
        content,
        flags=re.MULTILINE
    )
    
    # Add UUID import if missing
    if 'from sqlalchemy.dialects.postgresql import UUID' not in content and 'UUID' in content:
        # Find the first sqlalchemy import line
        sqlalchemy_import = re.search(r'from sqlalchemy import.*\n', content)
        if sqlalchemy_import:
            # Add UUID import after the first sqlalchemy import
            insert_pos = sqlalchemy_import.end()
            content = content[:insert_pos] + 'from sqlalchemy.dialects.postgresql import UUID\n' + content[insert_pos:]
    
    # Fix duplicate relationships
    # Remove duplicate new_user relationships
    content = re.sub(
        r'# New relationship to unified User model\s*\n\s*new_\w+ = relationship\("User"\)\s*\n\s*# New relationship to unified User model\s*\n\s*new_\w+ = relationship\("User"\)\s*\n\s*# New relationship to unified User model\s*\n\s*new_new_\w+ = relationship\("User", foreign_keys=\[new_user_id\]\)',
        r'# New relationship to unified User model\n    new_user = relationship("User", foreign_keys=[new_user_id])',
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
    """Main function to fix all broken model files"""
    print("[INFO] Fixing all broken plugin model files...")
    
    plugins_dir = Path("plugins")
    fixed_files = []
    
    # Find all model files
    model_files = list(plugins_dir.glob("*/models.py"))
    
    print(f"Found {len(model_files)} model files to check")
    
    for model_file in model_files:
        try:
            if fix_broken_syntax(model_file):
                fixed_files.append(str(model_file))
        except Exception as e:
            print(f"[ERROR] Error fixing {model_file}: {e}")
    
    print(f"\n[SUCCESS] Fixed {len(fixed_files)} model files:")
    for file in fixed_files:
        print(f"  - {file}")
    
    # Create fix report
    report = {
        "fix_timestamp": "2025-10-04T13:15:00Z",
        "fix_type": "comprehensive_model_syntax_fix",
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
    with open("comprehensive_model_fix_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Fix report saved to comprehensive_model_fix_report.json")

if __name__ == "__main__":
    main()
