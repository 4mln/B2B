import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { trackFeatureUsage } from './analytics';

/**
 * Feature Flags Service
 * Manages dynamic feature toggles and configuration
 * Allows enabling/disabling features without app updates
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  conditions?: {
    platform?: string[];
    version?: string;
    userRole?: string[];
    percentage?: number;
  };
  metadata?: Record<string, any>;
}

export interface FeatureFlagsConfig {
  version: string;
  lastUpdated: string;
  flags: Record<string, FeatureFlag>;
}

class FeatureFlagsService {
  private config: FeatureFlagsConfig | null = null;
  private listeners: Map<string, Set<(enabled: boolean) => void>> = new Map();
  private userContext: {
    userId?: string;
    role?: string;
    platform?: string;
    version?: string;
  } = {};

  /**
   * Initialize feature flags service
   */
  async initialize(): Promise<void> {
    try {
      // Load cached config
      const cachedConfig = await AsyncStorage.getItem('feature_flags_config');
      if (cachedConfig) {
        this.config = JSON.parse(cachedConfig);
      }

      // Fetch latest config from backend
      await this.fetchConfig();

      // Set up periodic updates
      this.setupPeriodicUpdates();

      console.log('[FeatureFlags] Initialized successfully');
    } catch (error) {
      console.error('[FeatureFlags] Failed to initialize:', error);
    }
  }

  /**
   * Set user context for feature flag evaluation
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
   * Check if a feature flag is enabled
   */
  isEnabled(flagName: string): boolean {
    if (!this.config) {
      return false;
    }

    const flag = this.config.flags[flagName];
    if (!flag) {
      return false;
    }

    // Check basic enabled state
    if (!flag.enabled) {
      return false;
    }

    // Check conditions
    if (flag.conditions) {
      if (!this.evaluateConditions(flag.conditions)) {
        return false;
      }
    }

    // Track feature usage
    trackFeatureUsage(flagName, 'check', {
      enabled: true,
      user_id: this.userContext.userId,
      platform: this.userContext.platform,
    });

    return true;
  }

  /**
   * Get feature flag value
   */
  getFlag(flagName: string): FeatureFlag | null {
    if (!this.config) {
      return null;
    }

    return this.config.flags[flagName] || null;
  }

  /**
   * Get all enabled feature flags
   */
  getEnabledFlags(): string[] {
    if (!this.config) {
      return [];
    }

    return Object.keys(this.config.flags).filter(flagName => 
      this.isEnabled(flagName)
    );
  }

  /**
   * Subscribe to feature flag changes
   */
  subscribe(flagName: string, callback: (enabled: boolean) => void): () => void {
    if (!this.listeners.has(flagName)) {
      this.listeners.set(flagName, new Set());
    }

    this.listeners.get(flagName)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(flagName);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(flagName);
        }
      }
    };
  }

  /**
   * Get feature flag metadata
   */
  getMetadata(flagName: string): Record<string, any> | null {
    const flag = this.getFlag(flagName);
    return flag?.metadata || null;
  }

  /**
   * Check if feature is available for current user
   */
  isAvailableForUser(flagName: string): boolean {
    const flag = this.getFlag(flagName);
    if (!flag) {
      return false;
    }

    // Check user role conditions
    if (flag.conditions?.userRole && this.userContext.role) {
      if (!flag.conditions.userRole.includes(this.userContext.role)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get feature flag description
   */
  getDescription(flagName: string): string | null {
    const flag = this.getFlag(flagName);
    return flag?.description || null;
  }

  /**
   * Force refresh feature flags
   */
  async refresh(): Promise<void> {
    await this.fetchConfig();
    this.notifyListeners();
  }

  /**
   * Clear all feature flags
   */
  async clear(): Promise<void> {
    this.config = null;
    await AsyncStorage.removeItem('feature_flags_config');
    this.notifyListeners();
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): Record<string, FeatureFlag> {
    return this.config?.flags || {};
  }

  /**
   * Check if feature flags are loaded
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
      const response = await fetch('/api/feature-flags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const config = await response.json();
        this.config = config;
        
        // Cache the config
        await AsyncStorage.setItem('feature_flags_config', JSON.stringify(config));
      }
    } catch (error) {
      console.error('[FeatureFlags] Failed to fetch config:', error);
    }
  }

  /**
   * Evaluate feature flag conditions
   */
  private evaluateConditions(conditions: FeatureFlag['conditions']): boolean {
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
    // Update every 5 minutes
    setInterval(() => {
      this.fetchConfig();
    }, 5 * 60 * 1000);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listeners, flagName) => {
      const enabled = this.isEnabled(flagName);
      listeners.forEach(callback => callback(enabled));
    });
  }
}

// Create singleton instance
const featureFlagsService = new FeatureFlagsService();

// Export convenience functions
export const initializeFeatureFlags = () => featureFlagsService.initialize();
export const isFeatureEnabled = (flagName: string) => featureFlagsService.isEnabled(flagName);
export const getFeatureFlag = (flagName: string) => featureFlagsService.getFlag(flagName);
export const getEnabledFlags = () => featureFlagsService.getEnabledFlags();
export const subscribeToFeatureFlag = (flagName: string, callback: (enabled: boolean) => void) => 
  featureFlagsService.subscribe(flagName, callback);
export const getFeatureMetadata = (flagName: string) => featureFlagsService.getMetadata(flagName);
export const isFeatureAvailableForUser = (flagName: string) => featureFlagsService.isAvailableForUser(flagName);
export const getFeatureDescription = (flagName: string) => featureFlagsService.getDescription(flagName);
export const refreshFeatureFlags = () => featureFlagsService.refresh();
export const clearFeatureFlags = () => featureFlagsService.clear();
export const getAllFeatureFlags = () => featureFlagsService.getAllFlags();
export const isFeatureFlagsLoaded = () => featureFlagsService.isLoaded();
export const getLastFeatureFlagsUpdate = () => featureFlagsService.getLastUpdate();
export const setUserContext = (context: {
  userId?: string;
  role?: string;
  platform?: string;
  version?: string;
}) => featureFlagsService.setUserContext(context);

export default featureFlagsService;
