#!/usr/bin/env python3
"""
Fix Indentation Issues - Fix All Indentation Problems
This script fixes all indentation issues in plugin model files.
"""

import os
import re
from pathlib import Path

def fix_indentation_issues(file_path):
    """Fix indentation issues in a model file"""
    print(f"Fixing indentation in {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix common indentation issues
    # Fix lines that have extra indentation
    content = re.sub(
        r'^(\s{8,})relationship\(',
        r'    relationship(',
        content,
        flags=re.MULTILINE
    )
    
    # Fix lines that have incorrect indentation
    content = re.sub(
        r'^(\s{4,6})relationship\(',
        r'    relationship(',
        content,
        flags=re.MULTILINE
    )
    
    # Fix lines that have too much indentation
    content = re.sub(
        r'^(\s{12,})relationship\(',
        r'    relationship(',
        content,
        flags=re.MULTILINE
    )
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Fixed indentation in {file_path}")
        return True
    else:
        print(f"[SKIP] No indentation issues found in {file_path}")
        return False

def main():
    """Main function to fix all indentation issues"""
    print("[INFO] Fixing all indentation issues in plugin model files...")
    
    plugins_dir = Path("plugins")
    fixed_files = []
    
    # Find all model files
    model_files = list(plugins_dir.glob("*/models.py"))
    
    print(f"Found {len(model_files)} model files to check")
    
    for model_file in model_files:
        try:
            if fix_indentation_issues(model_file):
                fixed_files.append(str(model_file))
        except Exception as e:
            print(f"[ERROR] Error fixing {model_file}: {e}")
    
    print(f"\n[SUCCESS] Fixed indentation in {len(fixed_files)} model files:")
    for file in fixed_files:
        print(f"  - {file}")
    
    # Create fix report
    report = {
        "fix_timestamp": "2025-10-04T13:45:00Z",
        "fix_type": "fix_indentation_issues",
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
    with open("indentation_fix_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Fix report saved to indentation_fix_report.json")

if __name__ == "__main__":
    main()
