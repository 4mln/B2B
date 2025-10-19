import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useTheme as useTamaguiTheme } from 'tamagui';
import { useTheme } from '@/hooks/useTheme';
import { Theme, initializeThemeService } from '@/services/themeService';

// Theme color mappings for Tamagui integration
const lightThemeColors = {
  background: '$backgroundLight0',
  backgroundSecondary: '$backgroundLight50',
  backgroundTertiary: '$backgroundLight100',
  text: '$textLight900',
  textSecondary: '$textLight700',
  textTertiary: '$textLight500',
  border: '$borderLight100',
  borderSecondary: '$borderLight200',
  primary: '$primary500',
  primaryLight: '$primary100',
  primaryDark: '$primary700',
  error: '$error500',
};

const darkThemeColors = {
  background: '$backgroundDark0',
  backgroundSecondary: '$backgroundDark50',
  backgroundTertiary: '$backgroundLight100',
  text: '$textDark100',
  textSecondary: '$textDark300',
  textTertiary: '$textLight500',
  border: '$borderLight100',
  borderSecondary: '$borderLight200',
  primary: '$primary500',
  primaryLight: '$primary100',
  primaryDark: '$primary700',
  error: '$error500',
};

/**
 * Theme Context
 * Provides unified theme data that bridges Tamagui and custom theme systems
 */

export interface ThemeContextValue {
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
  getThemeConfig: () => any;
  resetTheme: () => Promise<void>;
  // Tamagui theme integration
  tamaguiTheme?: any;
  themeName?: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Theme Provider Component
 * Provides unified theme context that works with Tamagui
 */
export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light'
}) => {
  const customThemeData = useTheme({ trackUsage: true });
  const tamaguiTheme = useTamaguiTheme();

  // Initialize theme service on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeThemeService();
        console.log('[ThemeProvider] Theme service initialized');
      } catch (error) {
        console.error('[ThemeProvider] Failed to initialize theme service:', error);
      }
    };
    init();
  }, []);

  // Sync theme changes with Tamagui using requestAnimationFrame to avoid circular updates
  useEffect(() => {
    const isDark = customThemeData.theme?.isDark ?? false;
    console.log('[ThemeProvider] Theme changed:', isDark ? 'dark' : 'light');
    
    // Schedule theme update for next frame to avoid synchronous updates
    const frameId = requestAnimationFrame(() => {
      if (typeof document !== 'undefined') {
        document.documentElement?.setAttribute('data-theme', isDark ? 'dark' : 'light');
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [customThemeData.theme?.isDark]);

  // Sync theme changes with Tamagui
  const unifiedThemeData = useMemo<ThemeContextValue>(() => {
    const isDark = customThemeData.theme?.isDark ?? false;
    const themeName = isDark ? 'dark' : 'light';

    return {
      ...customThemeData,
      isDark,
      isLight: !isDark,
      // Add Tamagui theme integration with proper token mapping
      tamaguiTheme: {
        ...tamaguiTheme,
        name: themeName,
        colors: isDark ? darkThemeColors : lightThemeColors,
        background: isDark ? '$backgroundDark0' : '$backgroundLight0',
        color: isDark ? '$textDark100' : '$textLight900',
      },
      themeName,
    };
  }, [customThemeData, tamaguiTheme]);

  return (
    <ThemeContext.Provider value={unifiedThemeData}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use unified theme context
 * Provides both custom theme data and Tamagui theme integration
 */
export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to get theme colors
 */
export const useThemeColors = () => {
  const { theme } = useThemeContext();
  return theme?.colors || null;
};

/**
 * Hook to get theme spacing
 */
export const useThemeSpacing = () => {
  const { theme } = useThemeContext();
  return theme?.spacing || null;
};

/**
 * Hook to get theme typography
 */
export const useThemeTypography = () => {
  const { theme } = useThemeContext();
  return theme?.typography || null;
};

/**
 * Hook to get theme shadows
 */
export const useThemeShadows = () => {
  const { theme } = useThemeContext();
  return theme?.shadows || null;
};

/**
 * Hook to get theme border radius
 */
export const useThemeBorderRadius = () => {
  const { theme } = useThemeContext();
  return theme?.borderRadius || null;
};

/**
 * Hook to check if theme is dark
 */
export const useIsDarkTheme = () => {
  const { isDark } = useThemeContext();
  return isDark;
};

/**
 * Hook to check if theme is light
 */
export const useIsLightTheme = () => {
  const { isLight } = useThemeContext();
  return isLight;
};

export default ThemeProvider;
