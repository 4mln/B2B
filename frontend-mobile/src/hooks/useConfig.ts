import { useState, useEffect, useCallback } from 'react';
import { 
  isPluginEnabled, 
  getPluginConfig,
  getEnabledPlugins,
  getPluginsByCategory,
  getPluginPriority,
  getPluginMetadata,
  getFeatureConfig,
  getSetting,
  getThemeConfig,
  getApiConfig,
  getAnalyticsConfig,
  getMonitoringConfig,
  subscribeToConfig,
  refreshConfig,
  PluginConfig
} from '@/services/configService';

/**
 * Hook for using configuration in React components
 * Provides reactive updates when configuration changes
 */

export interface UseConfigOptions {
  defaultValue?: any;
  trackUsage?: boolean;
}

export interface UseConfigReturn {
  value: any;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to check if a plugin is enabled
 */
export const usePluginEnabled = (
  pluginName: string,
  options: UseConfigOptions = {}
): UseConfigReturn => {
  const { defaultValue = false, trackUsage = true } = options;
  
  const [enabled, setEnabled] = useState<boolean>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isEnabled = isPluginEnabled(pluginName);
      setEnabled(isEnabled);

      if (trackUsage && isEnabled) {
        // Track plugin usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage(pluginName, 'plugin_check', {
          enabled: isEnabled,
        });
      }
    } catch (err) {
      console.error(`[usePluginEnabled] Error checking plugin ${pluginName}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [pluginName, trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToConfig('plugins', (config) => {
      if (config && config[pluginName]) {
        const isEnabled = isPluginEnabled(pluginName);
        setEnabled(isEnabled);
        
        if (trackUsage && isEnabled) {
          // Track plugin usage
          import('@/services/analytics').then(({ trackFeatureUsage }) => {
            trackFeatureUsage(pluginName, 'plugin_change', {
              enabled: isEnabled,
            });
          });
        }
      }
    });

    return unsubscribe;
  }, [pluginName, refresh, trackUsage]);

  return {
    value: enabled,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to get plugin configuration
 */
export const usePluginConfig = (
  pluginName: string,
  options: UseConfigOptions = {}
): UseConfigReturn & { config: PluginConfig | null } => {
  const { defaultValue = null, trackUsage = true } = options;
  
  const [config, setConfig] = useState<PluginConfig | null>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pluginConfig = getPluginConfig(pluginName);
      setConfig(pluginConfig);

      if (trackUsage && pluginConfig) {
        // Track plugin usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage(pluginName, 'config_check', {
          enabled: pluginConfig.enabled,
        });
      }
    } catch (err) {
      console.error(`[usePluginConfig] Error getting config for ${pluginName}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [pluginName, trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToConfig('plugins', (config) => {
      if (config && config[pluginName]) {
        const pluginConfig = getPluginConfig(pluginName);
        setConfig(pluginConfig);
        
        if (trackUsage && pluginConfig) {
          // Track plugin usage
          import('@/services/analytics').then(({ trackFeatureUsage }) => {
            trackFeatureUsage(pluginName, 'config_change', {
              enabled: pluginConfig.enabled,
            });
          });
        }
      }
    });

    return unsubscribe;
  }, [pluginName, refresh, trackUsage]);

  return {
    value: config,
    config,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to get enabled plugins
 */
export const useEnabledPlugins = (
  options: UseConfigOptions = {}
): UseConfigReturn & { plugins: string[] } => {
  const { defaultValue = [], trackUsage = true } = options;
  
  const [plugins, setPlugins] = useState<string[]>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const enabledPlugins = getEnabledPlugins();
      setPlugins(enabledPlugins);

      if (trackUsage) {
        // Track plugin usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('enabled_plugins', 'list_check', {
          count: enabledPlugins.length,
          plugins: enabledPlugins,
        });
      }
    } catch (err) {
      console.error(`[useEnabledPlugins] Error getting enabled plugins:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToConfig('plugins', (config) => {
      if (config) {
        const enabledPlugins = getEnabledPlugins();
        setPlugins(enabledPlugins);
        
        if (trackUsage) {
          // Track plugin usage
          import('@/services/analytics').then(({ trackFeatureUsage }) => {
            trackFeatureUsage('enabled_plugins', 'list_change', {
              count: enabledPlugins.length,
              plugins: enabledPlugins,
            });
          });
        }
      }
    });

    return unsubscribe;
  }, [refresh, trackUsage]);

  return {
    value: plugins,
    plugins,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to get plugins by category
 */
export const usePluginsByCategory = (
  category: string,
  options: UseConfigOptions = {}
): UseConfigReturn & { plugins: string[] } => {
  const { defaultValue = [], trackUsage = true } = options;
  
  const [plugins, setPlugins] = useState<string[]>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryPlugins = getPluginsByCategory(category);
      setPlugins(categoryPlugins);

      if (trackUsage) {
        // Track plugin usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('category_plugins', 'list_check', {
          category,
          count: categoryPlugins.length,
          plugins: categoryPlugins,
        });
      }
    } catch (err) {
      console.error(`[usePluginsByCategory] Error getting plugins for category ${category}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [category, trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToConfig('plugins', (config) => {
      if (config) {
        const categoryPlugins = getPluginsByCategory(category);
        setPlugins(categoryPlugins);
        
        if (trackUsage) {
          // Track plugin usage
          import('@/services/analytics').then(({ trackFeatureUsage }) => {
            trackFeatureUsage('category_plugins', 'list_change', {
              category,
              count: categoryPlugins.length,
              plugins: categoryPlugins,
            });
          });
        }
      }
    });

    return unsubscribe;
  }, [category, refresh, trackUsage]);

  return {
    value: plugins,
    plugins,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to get feature configuration
 */
export const useFeatureConfig = (
  featureName: string,
  options: UseConfigOptions = {}
): UseConfigReturn => {
  const { defaultValue = false, trackUsage = true } = options;
  
  const [enabled, setEnabled] = useState<boolean>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isEnabled = getFeatureConfig(featureName);
      setEnabled(isEnabled);

      if (trackUsage && isEnabled) {
        // Track feature usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage(featureName, 'feature_check', {
          enabled: isEnabled,
        });
      }
    } catch (err) {
      console.error(`[useFeatureConfig] Error checking feature ${featureName}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [featureName, trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToConfig('features', (config) => {
      if (config && config[featureName] !== undefined) {
        const isEnabled = getFeatureConfig(featureName);
        setEnabled(isEnabled);
        
        if (trackUsage && isEnabled) {
          // Track feature usage
          import('@/services/analytics').then(({ trackFeatureUsage }) => {
            trackFeatureUsage(featureName, 'feature_change', {
              enabled: isEnabled,
            });
          });
        }
      }
    });

    return unsubscribe;
  }, [featureName, refresh, trackUsage]);

  return {
    value: enabled,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to get app setting
 */
export const useSetting = (
  key: string,
  options: UseConfigOptions = {}
): UseConfigReturn => {
  const { defaultValue = null, trackUsage = true } = options;
  
  const [value, setValue] = useState<any>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const settingValue = getSetting(key);
      setValue(settingValue);

      if (trackUsage) {
        // Track setting usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('setting', 'check', {
          key,
          value: settingValue,
        });
      }
    } catch (err) {
      console.error(`[useSetting] Error getting setting ${key}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [key, trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToConfig('settings', (config) => {
      if (config && config[key] !== undefined) {
        const settingValue = getSetting(key);
        setValue(settingValue);
        
        if (trackUsage) {
          // Track setting usage
          import('@/services/analytics').then(({ trackFeatureUsage }) => {
            trackFeatureUsage('setting', 'change', {
              key,
              value: settingValue,
            });
          });
        }
      }
    });

    return unsubscribe;
  }, [key, refresh, trackUsage]);

  return {
    value,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to get theme configuration
 */
export const useThemeConfig = (
  options: UseConfigOptions = {}
): UseConfigReturn & { theme: any } => {
  const { defaultValue = null, trackUsage = true } = options;
  
  const [theme, setTheme] = useState<any>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const themeConfig = getThemeConfig();
      setTheme(themeConfig);

      if (trackUsage && themeConfig) {
        // Track theme usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('theme', 'check', {
          darkMode: themeConfig.darkMode,
          primaryColor: themeConfig.primaryColor,
        });
      }
    } catch (err) {
      console.error(`[useThemeConfig] Error getting theme config:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToConfig('theme', (config) => {
      if (config) {
        const themeConfig = getThemeConfig();
        setTheme(themeConfig);
        
        if (trackUsage && themeConfig) {
          // Track theme usage
          import('@/services/analytics').then(({ trackFeatureUsage }) => {
            trackFeatureUsage('theme', 'change', {
              darkMode: themeConfig.darkMode,
              primaryColor: themeConfig.primaryColor,
            });
          });
        }
      }
    });

    return unsubscribe;
  }, [refresh, trackUsage]);

  return {
    value: theme,
    theme,
    loading,
    error,
    refresh,
  };
};

export default usePluginEnabled;
