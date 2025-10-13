#!/usr/bin/env python3
"""
Fix Ads Models Comprehensive - Fix All Remaining Issues
This script fixes all remaining issues in the ads models file.
"""

def fix_ads_models():
    """Fix all remaining issues in ads models"""
    print("Fixing ads models comprehensively...")
    
    with open("plugins/ads/models.py", 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix all indentation issues
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # Fix lines that have incorrect indentation
        if line.strip().startswith('relationship(') and line.startswith('                '):
            # Fix 16-space indentation to 4-space
            fixed_line = '    ' + line.strip()
            fixed_lines.append(fixed_line)
        elif line.strip().startswith('relationship(') and line.startswith('        '):
            # Fix 8-space indentation to 4-space
            fixed_line = '    ' + line.strip()
            fixed_lines.append(fixed_line)
        elif line.strip().startswith('class ') and line.startswith('            '):
            # Fix malformed class definitions
            fixed_line = line.strip()
            fixed_lines.append(fixed_line)
        else:
            # Keep other lines as is
            fixed_lines.append(line)
    
    # Write the fixed content
    with open("plugins/ads/models.py", 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    
    print("Fixed ads models comprehensively")

if __name__ == "__main__":
    fix_ads_models()

