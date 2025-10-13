# app/core/plugin_capabilities.py
"""
Plugin Capability System
Manages user capabilities and plugin registration based on capabilities instead of Seller/Buyer roles.
"""

import logging
from typing import List, Dict, Set, Optional, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete
from sqlalchemy.orm import selectinload

from app.models.user import User

logger = logging.getLogger(__name__)

class CapabilityManager:
    """Manages user capabilities and plugin registration"""
    
    # Define available capabilities
    CAPABILITIES = {
        # Seller capabilities
        "can_post_offers": "Can create and manage product offers",
        "can_view_analytics": "Can view seller analytics dashboard",
        "can_manage_inventory": "Can manage product inventory",
        "can_process_orders": "Can process and fulfill orders",
        "can_manage_store": "Can manage store settings and policies",
        
        # Buyer capabilities
        "can_browse_products": "Can browse and search products",
        "can_create_orders": "Can create and place orders",
        "can_view_order_history": "Can view order history",
        "can_leave_reviews": "Can leave product reviews and ratings",
        "can_save_products": "Can save products to wishlist",
        
        # Shared capabilities
        "can_send_messages": "Can send messages to other users",
        "can_view_profiles": "Can view other user profiles",
        "can_participate_forums": "Can participate in community forums",
        "can_access_support": "Can access customer support",
        
        # Admin capabilities
        "can_manage_users": "Can manage user accounts",
        "can_view_system_analytics": "Can view system-wide analytics",
        "can_manage_content": "Can manage platform content",
        "can_moderate_content": "Can moderate user-generated content"
    }
    
    # Badge to capabilities mapping
    BADGE_CAPABILITIES = {
        "seller": [
            "can_post_offers", "can_view_analytics", "can_manage_inventory",
            "can_process_orders", "can_manage_store", "can_browse_products",
            "can_create_orders", "can_view_order_history", "can_leave_reviews",
            "can_save_products", "can_send_messages", "can_view_profiles",
            "can_participate_forums", "can_access_support"
        ],
        "buyer": [
            "can_browse_products", "can_create_orders", "can_view_order_history",
            "can_leave_reviews", "can_save_products", "can_send_messages",
            "can_view_profiles", "can_participate_forums", "can_access_support"
        ],
        "seller/buyer": [
            "can_post_offers", "can_view_analytics", "can_manage_inventory",
            "can_process_orders", "can_manage_store", "can_browse_products",
            "can_create_orders", "can_view_order_history", "can_leave_reviews",
            "can_save_products", "can_send_messages", "can_view_profiles",
            "can_participate_forums", "can_access_support"
        ]
    }
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def grant_capabilities_by_badge(self, user: User) -> List[str]:
        """Grant capabilities based on user badge"""
        if user.badge not in self.BADGE_CAPABILITIES:
            logger.warning(f"Unknown badge: {user.badge}")
            return []
        
        capabilities = self.BADGE_CAPABILITIES[user.badge]
        granted_capabilities = []
        
        for capability in capabilities:
            try:
                # Check if capability already exists
                result = await self.db.execute(
                    select("id").select_from("user_capabilities")
                    .where("user_id = :user_id AND capability = :capability"),
                    {"user_id": str(user.id), "capability": capability}
                )
                
                if not result.fetchone():
                    # Grant capability
                    await self.db.execute(
                        insert("user_capabilities").values(
                            user_id=str(user.id),
                            capability=capability,
                            granted_at=datetime.utcnow(),
                            granted_by=None,  # System granted
                            expires_at=None,
                            metadata={"source": "badge", "badge": user.badge}
                        )
                    )
                    granted_capabilities.append(capability)
                
            except Exception as e:
                logger.error(f"Error granting capability {capability} to user {user.id}: {e}")
        
        await self.db.commit()
        logger.info(f"Granted {len(granted_capabilities)} capabilities to user {user.unique_id}")
        return granted_capabilities
    
    async def revoke_capabilities_by_badge(self, user: User) -> List[str]:
        """Revoke capabilities that were granted by badge"""
        revoked_capabilities = []
        
        try:
            # Get capabilities granted by badge
            result = await self.db.execute(
                select("capability").select_from("user_capabilities")
                .where("user_id = :user_id AND metadata->>'source' = 'badge'"),
                {"user_id": str(user.id)}
            )
            
            capabilities_to_revoke = [row[0] for row in result.fetchall()]
            
            # Revoke capabilities
            for capability in capabilities_to_revoke:
                await self.db.execute(
                    delete("user_capabilities")
                    .where("user_id = :user_id AND capability = :capability"),
                    {"user_id": str(user.id), "capability": capability}
                )
                revoked_capabilities.append(capability)
            
            await self.db.commit()
            logger.info(f"Revoked {len(revoked_capabilities)} capabilities from user {user.unique_id}")
            
        except Exception as e:
            logger.error(f"Error revoking capabilities for user {user.id}: {e}")
        
        return revoked_capabilities
    
    async def update_user_capabilities(self, user: User) -> Dict[str, Any]:
        """Update user capabilities based on current badge"""
        # Revoke old capabilities
        revoked = await self.revoke_capabilities_by_badge(user)
        
        # Grant new capabilities
        granted = await self.grant_capabilities_by_badge(user)
        
        return {
            "revoked_capabilities": revoked,
            "granted_capabilities": granted,
            "total_capabilities": len(granted)
        }
    
    async def get_user_capabilities(self, user: User) -> List[str]:
        """Get all capabilities for a user"""
        try:
            result = await self.db.execute(
                select("capability").select_from("user_capabilities")
                .where("user_id = :user_id AND (expires_at IS NULL OR expires_at > :now)"),
                {"user_id": str(user.id), "now": datetime.utcnow()}
            )
            
            capabilities = [row[0] for row in result.fetchall()]
            return capabilities
            
        except Exception as e:
            logger.error(f"Error getting capabilities for user {user.id}: {e}")
            return []
    
    async def has_capability(self, user: User, capability: str) -> bool:
        """Check if user has a specific capability"""
        try:
            result = await self.db.execute(
                select("id").select_from("user_capabilities")
                .where("user_id = :user_id AND capability = :capability AND (expires_at IS NULL OR expires_at > :now)"),
                {"user_id": str(user.id), "capability": capability, "now": datetime.utcnow()}
            )
            
            return result.fetchone() is not None
            
        except Exception as e:
            logger.error(f"Error checking capability {capability} for user {user.id}: {e}")
            return False
    
    async def grant_capability(self, user: User, capability: str, granted_by: Optional[User] = None, 
                             expires_at: Optional[datetime] = None, metadata: Optional[Dict] = None) -> bool:
        """Grant a specific capability to a user"""
        if capability not in self.CAPABILITIES:
            logger.error(f"Unknown capability: {capability}")
            return False
        
        try:
            # Check if capability already exists
            result = await self.db.execute(
                select("id").select_from("user_capabilities")
                .where("user_id = :user_id AND capability = :capability"),
                {"user_id": str(user.id), "capability": capability}
            )
            
            if result.fetchone():
                logger.warning(f"User {user.id} already has capability {capability}")
                return False
            
            # Grant capability
            await self.db.execute(
                insert("user_capabilities").values(
                    user_id=str(user.id),
                    capability=capability,
                    granted_at=datetime.utcnow(),
                    granted_by=str(granted_by.id) if granted_by else None,
                    expires_at=expires_at,
                    metadata=metadata or {}
                )
            )
            
            await self.db.commit()
            logger.info(f"Granted capability {capability} to user {user.unique_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error granting capability {capability} to user {user.id}: {e}")
            return False
    
    async def revoke_capability(self, user: User, capability: str) -> bool:
        """Revoke a specific capability from a user"""
        try:
            result = await self.db.execute(
                delete("user_capabilities")
                .where("user_id = :user_id AND capability = :capability"),
                {"user_id": str(user.id), "capability": capability}
            )
            
            await self.db.commit()
            
            if result.rowcount > 0:
                logger.info(f"Revoked capability {capability} from user {user.unique_id}")
                return True
            else:
                logger.warning(f"User {user.id} did not have capability {capability}")
                return False
                
        except Exception as e:
            logger.error(f"Error revoking capability {capability} from user {user.id}: {e}")
            return False

class PluginCapabilityRegistry:
    """Registry for plugin capabilities and requirements"""
    
    def __init__(self):
        self.plugin_requirements: Dict[str, List[str]] = {}
        self.plugin_capabilities: Dict[str, List[str]] = {}
    
    def register_plugin(self, plugin_name: str, required_capabilities: List[str], 
                       provided_capabilities: List[str] = None):
        """Register a plugin with its capability requirements"""
        self.plugin_requirements[plugin_name] = required_capabilities
        self.plugin_capabilities[plugin_name] = provided_capabilities or []
        
        logger.info(f"Registered plugin {plugin_name} with requirements: {required_capabilities}")
    
    def can_activate_plugin(self, plugin_name: str, user_capabilities: Set[str]) -> bool:
        """Check if a plugin can be activated for a user"""
        if plugin_name not in self.plugin_requirements:
            logger.warning(f"Unknown plugin: {plugin_name}")
            return False
        
        required_capabilities = set(self.plugin_requirements[plugin_name])
        user_capabilities_set = set(user_capabilities)
        
        return required_capabilities.issubset(user_capabilities_set)
    
    def get_available_plugins(self, user_capabilities: Set[str]) -> List[str]:
        """Get list of plugins available to a user"""
        available_plugins = []
        
        for plugin_name, required_capabilities in self.plugin_requirements.items():
            if self.can_activate_plugin(plugin_name, user_capabilities):
                available_plugins.append(plugin_name)
        
        return available_plugins

# Global plugin registry
plugin_registry = PluginCapabilityRegistry()

# Register existing plugins with their capability requirements
plugin_registry.register_plugin(
    "seller_management",
    required_capabilities=["can_post_offers", "can_manage_inventory"],
    provided_capabilities=["can_view_analytics", "can_manage_store"]
)

plugin_registry.register_plugin(
    "buyer_dashboard",
    required_capabilities=["can_browse_products", "can_create_orders"],
    provided_capabilities=["can_view_order_history", "can_save_products"]
)

plugin_registry.register_plugin(
    "messaging",
    required_capabilities=["can_send_messages"],
    provided_capabilities=["can_view_profiles"]
)

plugin_registry.register_plugin(
    "analytics",
    required_capabilities=["can_view_analytics"],
    provided_capabilities=["can_view_system_analytics"]
)

plugin_registry.register_plugin(
    "admin_panel",
    required_capabilities=["can_manage_users", "can_view_system_analytics"],
    provided_capabilities=["can_manage_content", "can_moderate_content"]
)

# Dependency injection
async def get_capability_manager(db: AsyncSession) -> CapabilityManager:
    """Get capability manager instance"""
    return CapabilityManager(db)
