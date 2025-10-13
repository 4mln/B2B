import { PluginMetadata } from './types';
import { pluginRegistry } from './registry';
import { initializePluginSystem } from './loader';

// Import all plugins
import { plugin as chatPlugin } from './chat';
import { plugin as productsPlugin } from './products';
import { plugin as walletPlugin } from './wallet';
import { plugin as rfqPlugin } from './rfq';
import { plugin as profilePlugin } from './profile';
import { plugin as explorePlugin } from './explore';
import { plugin as notificationsPlugin } from './notifications';

/**
 * Plugin System Main Entry Point
 * Manages all plugins and provides centralized access
 */

// Register all plugins
const registerPlugins = () => {
  console.log('[PluginSystem] Registering plugins...');
  
  // Register core plugins
  pluginRegistry.register(chatPlugin);
  pluginRegistry.register(productsPlugin);
  pluginRegistry.register(walletPlugin);
  pluginRegistry.register(rfqPlugin);
  pluginRegistry.register(profilePlugin);
  pluginRegistry.register(explorePlugin);
  pluginRegistry.register(notificationsPlugin);
  
  console.log(`[PluginSystem] Registered ${pluginRegistry.getAllPlugins().length} plugins`);
};

/**
 * Initialize the plugin system
 * This should be called when the app starts
 */
export const initializePlugins = async (): Promise<void> => {
  try {
    console.log('[PluginSystem] Initializing plugin system...');
    
    // Register all plugins
    registerPlugins();
    
    // Initialize plugin system
    await initializePluginSystem();
    
    console.log('[PluginSystem] Plugin system initialized successfully');
  } catch (error) {
    console.error('[PluginSystem] Failed to initialize plugin system:', error);
    throw error;
  }
};

/**
 * Get all registered plugins
 */
export const getAllPlugins = (): PluginMetadata[] => {
  return pluginRegistry.getAllPlugins();
};

/**
 * Get enabled plugins only
 */
export const getEnabledPlugins = (): PluginMetadata[] => {
  return pluginRegistry.getEnabledPlugins();
};

/**
 * Get plugins by category
 */
export const getPluginsByCategory = (category: string): PluginMetadata[] => {
  return pluginRegistry.getPluginsByCategory(category);
};

/**
 * Get plugins that user has access to
 */
export const getAccessiblePlugins = (userPermissions: string[]): PluginMetadata[] => {
  return pluginRegistry.getAccessiblePlugins(userPermissions);
};

/**
 * Check if a plugin is enabled
 */
export const isPluginEnabled = (name: string): boolean => {
  return pluginRegistry.isEnabled(name);
};

/**
 * Get a specific plugin
 */
export const getPlugin = (name: string): PluginMetadata | undefined => {
  return pluginRegistry.getPlugin(name);
};

// Export the plugin registry for advanced usage
export { pluginRegistry };

// Export plugin system utilities
export * from './types';
export * from './registry';
export * from './loader';

// Export individual plugins
export * from './chat';
export * from './products';
export * from './wallet';
export * from './rfq';
export * from './profile';
export * from './explore';
export * from './notifications';

// Default export
export default {
  initializePlugins,
  getAllPlugins,
  getEnabledPlugins,
  getPluginsByCategory,
  getAccessiblePlugins,
  isPluginEnabled,
  getPlugin,
  pluginRegistry,
};
