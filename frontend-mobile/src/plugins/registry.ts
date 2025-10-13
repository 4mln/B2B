import { PluginMetadata, PluginConfig, PluginRegistry } from './types';

/**
 * Plugin Registry Implementation
 * Manages dynamic loading and registration of plugins
 */
class PluginRegistryImpl implements PluginRegistry {
  plugins: Map<string, PluginMetadata> = new Map();
  configs: Map<string, PluginConfig> = new Map();

  /**
   * Register a new plugin
   */
  register(plugin: PluginMetadata): void {
    console.log(`[PluginRegistry] Registering plugin: ${plugin.name}`);
    this.plugins.set(plugin.name, plugin);
    
    // Set default config if not exists
    if (!this.configs.has(plugin.name)) {
      this.configs.set(plugin.name, {
        name: plugin.name,
        enabled: true,
        permissions: plugin.permissions || [],
      });
    }
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): void {
    console.log(`[PluginRegistry] Unregistering plugin: ${name}`);
    this.plugins.delete(name);
    this.configs.delete(name);
  }

  /**
   * Get a specific plugin
   */
  getPlugin(name: string): PluginMetadata | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins only
   */
  getEnabledPlugins(): PluginMetadata[] {
    return this.getAllPlugins().filter(plugin => this.isEnabled(plugin.name));
  }

  /**
   * Check if a plugin is enabled
   */
  isEnabled(name: string): boolean {
    const config = this.configs.get(name);
    return config?.enabled ?? false;
  }

  /**
   * Set plugin configuration
   */
  setConfig(name: string, config: PluginConfig): void {
    this.configs.set(name, config);
  }

  /**
   * Get plugin configuration
   */
  getConfig(name: string): PluginConfig | undefined {
    return this.configs.get(name);
  }

  /**
   * Check if user has required permissions for a plugin
   */
  hasPermissions(pluginName: string, userPermissions: string[]): boolean {
    const plugin = this.getPlugin(pluginName);
    if (!plugin || !plugin.permissions) return true;
    
    return plugin.permissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Get plugins filtered by category
   */
  getPluginsByCategory(category: string): PluginMetadata[] {
    return this.getAllPlugins().filter(plugin => plugin.category === category);
  }

  /**
   * Get plugins that user has access to
   */
  getAccessiblePlugins(userPermissions: string[]): PluginMetadata[] {
    return this.getEnabledPlugins().filter(plugin => 
      this.hasPermissions(plugin.name, userPermissions)
    );
  }
}

// Create singleton instance
export const pluginRegistry = new PluginRegistryImpl();

// Export the registry instance
export default pluginRegistry;
