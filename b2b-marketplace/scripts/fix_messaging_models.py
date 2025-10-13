#!/usr/bin/env python3
"""
Fix Messaging Models - Remove Duplicate Relationships
This script fixes the broken relationships in the messaging models file.
"""

def fix_messaging_models():
    """Fix the broken messaging models file"""
    print("Fixing messaging models file...")
    
    with open("plugins/messaging/models.py", 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove all the duplicate and incorrect relationships
    # Keep only the original relationships
    content = re.sub(
        r'# New relationship to unified User model\s*\n\s*new_\w+ = relationship\("User"[^)]*\)\s*\n',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # Remove duplicate relationship definitions
    content = re.sub(
        r'(\s+)(\w+) = relationship\("User"[^)]*\)\s*\n\s*# New relationship to unified User model\s*\n\s*\1\2 = relationship\("User"[^)]*\)\s*\n',
        r'\1\2 = relationship("User")\n',
        content,
        flags=re.MULTILINE
    )
    
    # Write the fixed content
    with open("plugins/messaging/models.py", 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Fixed messaging models file")

if __name__ == "__main__":
    import re
    fix_messaging_models()
