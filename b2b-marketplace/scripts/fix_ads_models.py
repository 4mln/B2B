#!/usr/bin/env python3
"""
Fix Ads Models - Repair Broken Syntax
This script fixes the broken syntax in the ads models file.
"""

def fix_ads_models():
    """Fix the broken ads models file"""
    print("Fixing ads models file...")
    
    with open("plugins/ads/models.py", 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix all broken column definitions
    # Pattern: id = Column(\n\n    new_user_id = Column(...)\nInteger, primary_key=True, index=True)
    content = re.sub(
        r'id = Column\(\s*\n\s*\n\s*new_user_id = Column\(UUID, ForeignKey\("users_new\.id"\), nullable=True\)\nInteger, primary_key=True, index=True\)',
        r'id = Column(Integer, primary_key=True, index=True)\n    new_user_id = Column(UUID, ForeignKey("users_new.id"), nullable=True)',
        content,
        flags=re.MULTILINE
    )
    
    # Fix duplicate relationships
    # Remove duplicate new_seller and new_user relationships
    content = re.sub(
        r'# New relationship to unified User model\s*\n\s*new_\w+ = relationship\("User"\)\s*\n\s*# New relationship to unified User model\s*\n\s*new_\w+ = relationship\("User"\)\s*\n\s*# New relationship to unified User model\s*\n\s*new_new_\w+ = relationship\("User", foreign_keys=\[new_user_id\]\)',
        r'# New relationship to unified User model\n    new_user = relationship("User", foreign_keys=[new_user_id])',
        content,
        flags=re.MULTILINE
    )
    
    # Write the fixed content
    with open("plugins/ads/models.py", 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Fixed ads models file")

if __name__ == "__main__":
    import re
    fix_ads_models()
