import { apiClient } from './client';

/**
 * Configuration API
 * Handles dynamic configuration and feature flags
 */

export interface ConfigResponse {
  version: string;
  lastUpdated: string;
  plugins: Record<string, any>;
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

export interface FeatureFlagsResponse {
  version: string;
  lastUpdated: string;
  flags: Record<string, any>;
}

/**
 * Get app configuration
 */
export const getAppConfig = async (): Promise<ConfigResponse> => {
  try {
    const response = await apiClient.get('/config');
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get app config:', error);
    throw error;
  }
};

/**
 * Get feature flags
 */
export const getFeatureFlags = async (): Promise<FeatureFlagsResponse> => {
  try {
    const response = await apiClient.get('/feature-flags');
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get feature flags:', error);
    throw error;
  }
};

/**
 * Update plugin configuration
 */
export const updatePluginConfig = async (
  pluginName: string,
  config: any
): Promise<void> => {
  try {
    await apiClient.put(`/config/plugins/${pluginName}`, config);
  } catch (error) {
    console.error('[ConfigAPI] Failed to update plugin config:', error);
    throw error;
  }
};

/**
 * Update feature flag
 */
export const updateFeatureFlag = async (
  flagName: string,
  enabled: boolean
): Promise<void> => {
  try {
    await apiClient.put(`/feature-flags/${flagName}`, { enabled });
  } catch (error) {
    console.error('[ConfigAPI] Failed to update feature flag:', error);
    throw error;
  }
};

/**
 * Update app setting
 */
export const updateSetting = async (
  key: string,
  value: any
): Promise<void> => {
  try {
    await apiClient.put(`/config/settings/${key}`, { value });
  } catch (error) {
    console.error('[ConfigAPI] Failed to update setting:', error);
    throw error;
  }
};

/**
 * Update theme configuration
 */
export const updateThemeConfig = async (
  theme: ConfigResponse['theme']
): Promise<void> => {
  try {
    await apiClient.put('/config/theme', theme);
  } catch (error) {
    console.error('[ConfigAPI] Failed to update theme config:', error);
    throw error;
  }
};

/**
 * Get plugin configuration
 */
export const getPluginConfig = async (pluginName: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/config/plugins/${pluginName}`);
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get plugin config:', error);
    throw error;
  }
};

/**
 * Get feature flag
 */
export const getFeatureFlag = async (flagName: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/feature-flags/${flagName}`);
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get feature flag:', error);
    throw error;
  }
};

/**
 * Get app setting
 */
export const getSetting = async (key: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/config/settings/${key}`);
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get setting:', error);
    throw error;
  }
};

/**
 * Get theme configuration
 */
export const getThemeConfig = async (): Promise<ConfigResponse['theme']> => {
  try {
    const response = await apiClient.get('/config/theme');
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get theme config:', error);
    throw error;
  }
};

/**
 * Get analytics configuration
 */
export const getAnalyticsConfig = async (): Promise<ConfigResponse['analytics']> => {
  try {
    const response = await apiClient.get('/config/analytics');
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get analytics config:', error);
    throw error;
  }
};

/**
 * Get monitoring configuration
 */
export const getMonitoringConfig = async (): Promise<ConfigResponse['monitoring']> => {
  try {
    const response = await apiClient.get('/config/monitoring');
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get monitoring config:', error);
    throw error;
  }
};

/**
 * Get API configuration
 */
export const getApiConfig = async (): Promise<ConfigResponse['api']> => {
  try {
    const response = await apiClient.get('/config/api');
    return response.data;
  } catch (error) {
    console.error('[ConfigAPI] Failed to get API config:', error);
    throw error;
  }
};

export default {
  getAppConfig,
  getFeatureFlags,
  updatePluginConfig,
  updateFeatureFlag,
  updateSetting,
  updateThemeConfig,
  getPluginConfig,
  getFeatureFlag,
  getSetting,
  getThemeConfig,
  getAnalyticsConfig,
  getMonitoringConfig,
  getApiConfig,
};
