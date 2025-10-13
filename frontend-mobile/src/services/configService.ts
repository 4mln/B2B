import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { trackFeatureUsage } from './analytics';

/**
 * Configuration Service
 * Manages dynamic configuration and plugin settings
 * Allows enabling/disabling plugins without app updates
 */

export interface PluginConfig {
  name: string;
  enabled: boolean;
  version: string;
  permissions: string[];
  category: string;
  priority: number;
  metadata: Record<string, any>;
  conditions?: {
    platform?: string[];
    version?: string;
    userRole?: string[];
    percentage?: number;
  };
}

export interface AppConfig {
  version: string;
  lastUpdated: string;
  plugins: Record<string, PluginConfig>;
  features: Record<string, boolean>;
  settings: Record<string, any>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    darkMode: boolean;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  analytics: {
    enabled: boolean;
    trackingId: string;
    events: string[];
  };
  monitoring: {
    enabled: boolean;
    dsn: string;
    environment: string;
  };
}

class ConfigService {
  private config: AppConfig | null = null;
  private listeners: Map<string, Set<(config: any) => void>> = new Map();
  private userContext: {
    userId?: string;
    role?: string;
    platform?: string;
    version?: string;
  } = {};

  /**
   * Initialize configuration service
   */
  async initialize(): Promise<void> {
    try {
      // Load cached config
      const cachedConfig = await AsyncStorage.getItem('app_config');
      if (cachedConfig) {
        this.config = JSON.parse(cachedConfig);
      }

      // Fetch latest config from backend
      await this.fetchConfig();

      // Set up periodic updates
      this.setupPeriodicUpdates();

      console.log('[ConfigService] Initialized successfully');
    } catch (error) {
      console.error('[ConfigService] Failed to initialize:', error);
    }
  }

  /**
   * Set user context for configuration evaluation
   */
  setUserContext(context: {
    userId?: string;
    role?: string;
    platform?: string;
    version?: string;
  }): void {
    this.userContext = {
      ...this.userContext,
      ...context,
      platform: Platform.OS,
    };
  }

  /**
   * Get plugin configuration
   */
  getPluginConfig(pluginName: string): PluginConfig | null {
    if (!this.config) {
      return null;
    }

    return this.config.plugins[pluginName] || null;
  }

  /**
   * Check if plugin is enabled
   */
  isPluginEnabled(pluginName: string): boolean {
    const pluginConfig = this.getPluginConfig(pluginName);
    if (!pluginConfig) {
      return false;
    }

    // Check basic enabled state
    if (!pluginConfig.enabled) {
      return false;
    }

    // Check conditions
    if (pluginConfig.conditions) {
      if (!this.evaluateConditions(pluginConfig.conditions)) {
        return false;
      }
    }

    // Track plugin usage
    trackFeatureUsage(pluginName, 'plugin_check', {
      enabled: true,
      user_id: this.userContext.userId,
      platform: this.userContext.platform,
    });

    return true;
  }

  /**
   * Get all enabled plugins
   */
  getEnabledPlugins(): string[] {
    if (!this.config) {
      return [];
    }

    return Object.keys(this.config.plugins).filter(pluginName => 
      this.isPluginEnabled(pluginName)
    );
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): string[] {
    if (!this.config) {
      return [];
    }

    return Object.keys(this.config.plugins).filter(pluginName => {
      const pluginConfig = this.config!.plugins[pluginName];
      return pluginConfig.category === category && this.isPluginEnabled(pluginName);
    });
  }

  /**
   * Get plugin priority
   */
  getPluginPriority(pluginName: string): number {
    const pluginConfig = this.getPluginConfig(pluginName);
    return pluginConfig?.priority || 0;
  }

  /**
   * Get plugin metadata
   */
  getPluginMetadata(pluginName: string): Record<string, any> | null {
    const pluginConfig = this.getPluginConfig(pluginName);
    return pluginConfig?.metadata || null;
  }

  /**
   * Get feature configuration
   */
  getFeatureConfig(featureName: string): boolean {
    if (!this.config) {
      return false;
    }

    return this.config.features[featureName] || false;
  }

  /**
   * Get app settings
   */
  getSetting(key: string): any {
    if (!this.config) {
      return null;
    }

    return this.config.settings[key];
  }

  /**
   * Get theme configuration
   */
  getThemeConfig(): AppConfig['theme'] | null {
    if (!this.config) {
      return null;
    }

    return this.config.theme;
  }

  /**
   * Get API configuration
   */
  getApiConfig(): AppConfig['api'] | null {
    if (!this.config) {
      return null;
    }

    return this.config.api;
  }

  /**
   * Get analytics configuration
   */
  getAnalyticsConfig(): AppConfig['analytics'] | null {
    if (!this.config) {
      return null;
    }

    return this.config.analytics;
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig(): AppConfig['monitoring'] | null {
    if (!this.config) {
      return null;
    }

    return this.config.monitoring;
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(key: string, callback: (config: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Force refresh configuration
   */
  async refresh(): Promise<void> {
    await this.fetchConfig();
    this.notifyListeners();
  }

  /**
   * Clear all configuration
   */
  async clear(): Promise<void> {
    this.config = null;
    await AsyncStorage.removeItem('app_config');
    this.notifyListeners();
  }

  /**
   * Get all configuration
   */
  getAllConfig(): AppConfig | null {
    return this.config;
  }

  /**
   * Check if configuration is loaded
   */
  isLoaded(): boolean {
    return this.config !== null;
  }

  /**
   * Get last update time
   */
  getLastUpdate(): string | null {
    return this.config?.lastUpdated || null;
  }

  /**
   * Fetch config from backend
   */
  private async fetchConfig(): Promise<void> {
    try {
      // In a real app, this would fetch from your backend
      const response = await fetch('/api/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const config = await response.json();
        this.config = config;
        
        // Cache the config
        await AsyncStorage.setItem('app_config', JSON.stringify(config));
      }
    } catch (error) {
      console.error('[ConfigService] Failed to fetch config:', error);
    }
  }

  /**
   * Evaluate plugin conditions
   */
  private evaluateConditions(conditions: PluginConfig['conditions']): boolean {
    if (!conditions) {
      return true;
    }

    // Check platform condition
    if (conditions.platform && this.userContext.platform) {
      if (!conditions.platform.includes(this.userContext.platform)) {
        return false;
      }
    }

    // Check version condition
    if (conditions.version && this.userContext.version) {
      if (this.userContext.version !== conditions.version) {
        return false;
      }
    }

    // Check user role condition
    if (conditions.userRole && this.userContext.role) {
      if (!conditions.userRole.includes(this.userContext.role)) {
        return false;
      }
    }

    // Check percentage rollout
    if (conditions.percentage !== undefined) {
      const hash = this.hashString(this.userContext.userId || 'anonymous');
      const percentage = hash % 100;
      if (percentage >= conditions.percentage) {
        return false;
      }
    }

    return true;
  }

  /**
   * Hash string for percentage rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Set up periodic updates
   */
  private setupPeriodicUpdates(): void {
    // Update every 10 minutes
    setInterval(() => {
      this.fetchConfig();
    }, 10 * 60 * 1000);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listeners, key) => {
      const config = this.getConfigByKey(key);
      listeners.forEach(callback => callback(config));
    });
  }

  /**
   * Get configuration by key
   */
  private getConfigByKey(key: string): any {
    if (!this.config) {
      return null;
    }

    switch (key) {
      case 'plugins':
        return this.config.plugins;
      case 'features':
        return this.config.features;
      case 'settings':
        return this.config.settings;
      case 'theme':
        return this.config.theme;
      case 'api':
        return this.config.api;
      case 'analytics':
        return this.config.analytics;
      case 'monitoring':
        return this.config.monitoring;
      default:
        return this.config;
    }
  }
}

// Create singleton instance
const configService = new ConfigService();

// Export convenience functions
export const initializeConfig = () => configService.initialize();
export const isPluginEnabled = (pluginName: string) => configService.isPluginEnabled(pluginName);
export const getPluginConfig = (pluginName: string) => configService.getPluginConfig(pluginName);
export const getEnabledPlugins = () => configService.getEnabledPlugins();
export const getPluginsByCategory = (category: string) => configService.getPluginsByCategory(category);
export const getPluginPriority = (pluginName: string) => configService.getPluginPriority(pluginName);
export const getPluginMetadata = (pluginName: string) => configService.getPluginMetadata(pluginName);
export const getFeatureConfig = (featureName: string) => configService.getFeatureConfig(featureName);
export const getSetting = (key: string) => configService.getSetting(key);
export const getThemeConfig = () => configService.getThemeConfig();
export const getApiConfig = () => configService.getApiConfig();
export const getAnalyticsConfig = () => configService.getAnalyticsConfig();
export const getMonitoringConfig = () => configService.getMonitoringConfig();
export const subscribeToConfig = (key: string, callback: (config: any) => void) => 
  configService.subscribe(key, callback);
export const refreshConfig = () => configService.refresh();
export const clearConfig = () => configService.clear();
export const getAllConfig = () => configService.getAllConfig();
export const isConfigLoaded = () => configService.isLoaded();
export const getLastConfigUpdate = () => configService.getLastUpdate();
export const setUserContext = (context: {
  userId?: string;
  role?: string;
  platform?: string;
  version?: string;
}) => configService.setUserContext(context);

export default configService;
