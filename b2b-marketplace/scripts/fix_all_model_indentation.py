#!/usr/bin/env python3
"""
Fix All Model Indentation - Comprehensive Fix
This script fixes all indentation issues in all plugin model files.
"""

import os
import re
from pathlib import Path

def fix_model_indentation(file_path):
    """Fix indentation issues in a model file"""
    print(f"Fixing indentation in {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix all indentation issues
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Fix lines that have incorrect indentation
        if line.strip().startswith('relationship(') and line.startswith('                '):
            # Fix 16-space indentation to 4-space
            fixed_line = '    ' + line.strip()
            fixed_lines.append(fixed_line)
        elif line.strip().startswith('relationship(') and line.startswith('        '):
            # Fix 8-space indentation to 4-space
            fixed_line = '    ' + line.strip()
            fixed_lines.append(fixed_line)
        elif line.strip().startswith('relationship(') and line.startswith('    '):
            # Already correct indentation
            fixed_lines.append(line)
        else:
            # Keep other lines as is
            fixed_lines.append(line)
    
    # Write the fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    
    print(f"[OK] Fixed indentation in {file_path}")
    return True

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
            if fix_model_indentation(model_file):
                fixed_files.append(str(model_file))
        except Exception as e:
            print(f"[ERROR] Error fixing {model_file}: {e}")
    
    print(f"\n[SUCCESS] Fixed indentation in {len(fixed_files)} model files:")
    for file in fixed_files:
        print(f"  - {file}")
    
    # Create fix report
    report = {
        "fix_timestamp": "2025-10-04T14:00:00Z",
        "fix_type": "fix_all_model_indentation",
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
    with open("all_model_indentation_fix_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[INFO] Fix report saved to all_model_indentation_fix_report.json")

if __name__ == "__main__":
    main()
