import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/services/themeService';

/**
 * Theme Context
 * Provides theme data to all child components
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
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Theme Provider Component
 * Wraps the app to provide theme context
 */
export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
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
