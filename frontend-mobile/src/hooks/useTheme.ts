import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrentTheme, 
  getTheme, 
  setTheme, 
  toggleDarkMode, 
  setAutoDarkMode,
  createCustomTheme,
  deleteCustomTheme,
  subscribeToTheme,
  getAvailableThemes,
  getThemeConfig,
  resetTheme,
  Theme,
  ThemeConfig
} from '@/services/themeService';

/**
 * Hook for using themes in React components
 * Provides reactive theme updates and theme management
 */

export interface UseThemeOptions {
  trackUsage?: boolean;
}

export interface UseThemeReturn {
  theme: Theme | null;
  loading: boolean;
  error: string | null;
  isDark: boolean;
  isLight: boolean;
  setTheme: (name: string) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setAutoDarkMode: (enabled: boolean) => Promise<void>;
  createCustomTheme: (name: string, theme: Theme) => Promise<void>;
  deleteCustomTheme: (name: string) => Promise<void>;
  getAvailableThemes: () => string[];
  getThemeConfig: () => ThemeConfig | null;
  resetTheme: () => Promise<void>;
}

/**
 * Hook to get current theme
 */
export const useTheme = (options: UseThemeOptions = {}): UseThemeReturn => {
  const { trackUsage = true } = options;
  
  const [theme, setThemeState] = useState<Theme | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setThemeHandler = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await setTheme(name);
      
      if (trackUsage) {
        // Track theme change
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('theme', 'change', {
          themeName: name,
          isDark: theme?.isDark || false,
        });
      }
    } catch (err) {
      console.error('[useTheme] Failed to set theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [theme, trackUsage]);

  const toggleDarkModeHandler = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await toggleDarkMode();
      
      if (trackUsage) {
        // Track dark mode toggle
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('theme', 'toggle_dark_mode', {
          wasDark: theme?.isDark || false,
        });
      }
    } catch (err) {
      console.error('[useTheme] Failed to toggle dark mode:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [theme, trackUsage]);

  const setAutoDarkModeHandler = useCallback(async (enabled: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      await setAutoDarkMode(enabled);
      
      if (trackUsage) {
        // Track auto dark mode setting
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('theme', 'auto_dark_mode', {
          enabled,
        });
      }
    } catch (err) {
      console.error('[useTheme] Failed to set auto dark mode:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [trackUsage]);

  const createCustomThemeHandler = useCallback(async (name: string, customTheme: Theme) => {
    try {
      setLoading(true);
      setError(null);
      
      await createCustomTheme(name, customTheme);
      
      if (trackUsage) {
        // Track custom theme creation
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('theme', 'create_custom', {
          themeName: name,
          isDark: customTheme.isDark,
        });
      }
    } catch (err) {
      console.error('[useTheme] Failed to create custom theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [trackUsage]);

  const deleteCustomThemeHandler = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteCustomTheme(name);
      
      if (trackUsage) {
        // Track custom theme deletion
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('theme', 'delete_custom', {
          themeName: name,
        });
      }
    } catch (err) {
      console.error('[useTheme] Failed to delete custom theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [trackUsage]);

  const resetThemeHandler = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await resetTheme();
      
      if (trackUsage) {
        // Track theme reset
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('theme', 'reset', {});
      }
    } catch (err) {
      console.error('[useTheme] Failed to reset theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [trackUsage]);

  useEffect(() => {
    // Get initial theme
    const initialTheme = getCurrentTheme();
    setThemeState(initialTheme);
    setLoading(false);

    // Subscribe to theme changes
    const unsubscribe = subscribeToTheme((newTheme) => {
      setThemeState(newTheme);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  return {
    theme,
    loading,
    error,
    isDark: theme?.isDark || false,
    isLight: !theme?.isDark || false,
    setTheme: setThemeHandler,
    toggleDarkMode: toggleDarkModeHandler,
    setAutoDarkMode: setAutoDarkModeHandler,
    createCustomTheme: createCustomThemeHandler,
    deleteCustomTheme: deleteCustomThemeHandler,
    getAvailableThemes,
    getThemeConfig,
    resetTheme: resetThemeHandler,
  };
};

/**
 * Hook to get theme colors
 */
export const useThemeColors = (options: UseThemeOptions = {}) => {
  const { theme, loading, error } = useTheme(options);
  
  return {
    colors: theme?.colors || null,
    loading,
    error,
  };
};

/**
 * Hook to get theme spacing
 */
export const useThemeSpacing = (options: UseThemeOptions = {}) => {
  const { theme, loading, error } = useTheme(options);
  
  return {
    spacing: theme?.spacing || null,
    loading,
    error,
  };
};

/**
 * Hook to get theme typography
 */
export const useThemeTypography = (options: UseThemeOptions = {}) => {
  const { theme, loading, error } = useTheme(options);
  
  return {
    typography: theme?.typography || null,
    loading,
    error,
  };
};

/**
 * Hook to get theme shadows
 */
export const useThemeShadows = (options: UseThemeOptions = {}) => {
  const { theme, loading, error } = useTheme(options);
  
  return {
    shadows: theme?.shadows || null,
    loading,
    error,
  };
};

/**
 * Hook to get theme border radius
 */
export const useThemeBorderRadius = (options: UseThemeOptions = {}) => {
  const { theme, loading, error } = useTheme(options);
  
  return {
    borderRadius: theme?.borderRadius || null,
    loading,
    error,
  };
};

/**
 * Hook to check if theme is dark
 */
export const useIsDarkTheme = (options: UseThemeOptions = {}) => {
  const { isDark, loading, error } = useTheme(options);
  
  return {
    isDark,
    loading,
    error,
  };
};

/**
 * Hook to check if theme is light
 */
export const useIsLightTheme = (options: UseThemeOptions = {}) => {
  const { isLight, loading, error } = useTheme(options);
  
  return {
    isLight,
    loading,
    error,
  };
};

/**
 * Hook to get available themes
 */
export const useAvailableThemes = (options: UseThemeOptions = {}) => {
  const { loading, error } = useTheme(options);
  
  return {
    themes: getAvailableThemes(),
    loading,
    error,
  };
};

/**
 * Hook to get theme configuration
 */
export const useThemeConfig = (options: UseThemeOptions = {}) => {
  const { loading, error } = useTheme(options);
  
  return {
    config: getThemeConfig(),
    loading,
    error,
  };
};

export default useTheme;
