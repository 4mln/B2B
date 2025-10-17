import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useTheme as useTamaguiTheme } from 'tamagui';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/services/themeService';

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
  const customThemeData = useTheme();
  const tamaguiTheme = useTamaguiTheme();

  // Bridge between custom theme and Tamagui theme
  const unifiedThemeData = useMemo<ThemeContextValue>(() => ({
    ...customThemeData,
    // Add Tamagui theme integration
    tamaguiTheme: tamaguiTheme || {},
    themeName: defaultTheme,
  }), [customThemeData, tamaguiTheme, defaultTheme]);

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
