#!/usr/bin/env python3
"""
Fix All Indentation - Comprehensive Indentation Fix
This script fixes all indentation issues in the admin models file.
"""

def fix_admin_models_indentation():
    """Fix all indentation issues in admin models"""
    print("Fixing admin models indentation...")
    
    with open("plugins/admin/models.py", 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix all indentation issues
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Fix lines that have incorrect indentation
        if line.strip().startswith('relationship(') and line.startswith('        '):
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
    with open("plugins/admin/models.py", 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    
    print("Fixed admin models indentation")

if __name__ == "__main__":
    fix_admin_models_indentation()
