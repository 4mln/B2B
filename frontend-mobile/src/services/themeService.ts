import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { trackFeatureUsage } from './analytics';

/**
 * Theme Service
 * Manages app theming and dark mode support
 */

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  borderTertiary: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive colors
  interactive: string;
  interactiveHover: string;
  interactivePressed: string;
  interactiveDisabled: string;
  
  // Shadow colors
  shadow: string;
  shadowLight: string;
  shadowDark: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyBold: string;
  fontFamilyLight: string;
  fontFamilyItalic: string;
  
  // Font sizes
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  
  // Line heights
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  
  // Font weights
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
  isDark: boolean;
}

export interface ThemeConfig {
  currentTheme: string;
  autoDarkMode: boolean;
  customThemes: Record<string, Theme>;
}

class ThemeService {
  private currentTheme: Theme | null = null;
  private listeners: Map<string, Set<(theme: Theme) => void>> = new Map();
  private config: ThemeConfig | null = null;

  /**
   * Initialize theme service
   */
  async initialize(): Promise<void> {
    try {
      // Load theme configuration
      await this.loadConfig();
      
      // Set up system theme monitoring
      this.setupSystemThemeMonitoring();
      
      // Apply initial theme
      await this.applyTheme();
      
      console.log('[ThemeService] Initialized successfully');
    } catch (error) {
      console.error('[ThemeService] Failed to initialize:', error);
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  /**
   * Get theme by name
   */
  getTheme(name: string): Theme | null {
    if (!this.config) {
      return null;
    }
    
    return this.config.customThemes[name] || this.getDefaultTheme(name);
  }

  /**
   * Set theme
   */
  async setTheme(name: string): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Theme service not initialized');
      }
      
      this.config.currentTheme = name;
      await this.saveConfig();
      await this.applyTheme();
      
      // Track theme change
      trackFeatureUsage('theme', 'change', {
        themeName: name,
        isDark: this.currentTheme?.isDark || false,
      });
    } catch (error) {
      console.error('[ThemeService] Failed to set theme:', error);
      throw error;
    }
  }

  /**
   * Toggle dark mode
   */
  async toggleDarkMode(): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Theme service not initialized');
      }
      
      const currentTheme = this.getCurrentTheme();
      if (!currentTheme) {
        throw new Error('No current theme');
      }
      
      const newThemeName = currentTheme.isDark ? 'light' : 'dark';
      await this.setTheme(newThemeName);
      
      // Track dark mode toggle
      trackFeatureUsage('theme', 'toggle_dark_mode', {
        newTheme: newThemeName,
        wasDark: currentTheme.isDark,
      });
    } catch (error) {
      console.error('[ThemeService] Failed to toggle dark mode:', error);
      throw error;
    }
  }

  /**
   * Set auto dark mode
   */
  async setAutoDarkMode(enabled: boolean): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Theme service not initialized');
      }
      
      this.config.autoDarkMode = enabled;
      await this.saveConfig();
      
      if (enabled) {
        await this.applySystemTheme();
      }
      
      // Track auto dark mode setting
      trackFeatureUsage('theme', 'auto_dark_mode', {
        enabled,
      });
    } catch (error) {
      console.error('[ThemeService] Failed to set auto dark mode:', error);
      throw error;
    }
  }

  /**
   * Create custom theme
   */
  async createCustomTheme(name: string, theme: Theme): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Theme service not initialized');
      }
      
      this.config.customThemes[name] = theme;
      await this.saveConfig();
      
      // Track custom theme creation
      trackFeatureUsage('theme', 'create_custom', {
        themeName: name,
        isDark: theme.isDark,
      });
    } catch (error) {
      console.error('[ThemeService] Failed to create custom theme:', error);
      throw error;
    }
  }

  /**
   * Delete custom theme
   */
  async deleteCustomTheme(name: string): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Theme service not initialized');
      }
      
      delete this.config.customThemes[name];
      await this.saveConfig();
      
      // Track custom theme deletion
      trackFeatureUsage('theme', 'delete_custom', {
        themeName: name,
      });
    } catch (error) {
      console.error('[ThemeService] Failed to delete custom theme:', error);
      throw error;
    }
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (theme: Theme) => void): () => void {
    const id = Math.random().toString(36);
    if (!this.listeners.has('theme')) {
      this.listeners.set('theme', new Set());
    }
    this.listeners.get('theme')!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get('theme');
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete('theme');
        }
      }
    };
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): string[] {
    if (!this.config) {
      return ['light', 'dark'];
    }
    
    return ['light', 'dark', ...Object.keys(this.config.customThemes)];
  }

  /**
   * Get theme configuration
   */
  getConfig(): ThemeConfig | null {
    return this.config;
  }

  /**
   * Reset to default theme
   */
  async resetToDefault(): Promise<void> {
    try {
      await this.setTheme('light');
      await this.setAutoDarkMode(false);
      
      // Track theme reset
      trackFeatureUsage('theme', 'reset', {});
    } catch (error) {
      console.error('[ThemeService] Failed to reset theme:', error);
      throw error;
    }
  }

  /**
   * Load theme configuration
   */
  private async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('theme_config');
      if (stored) {
        this.config = JSON.parse(stored);
      } else {
        this.config = {
          currentTheme: 'light',
          autoDarkMode: false,
          customThemes: {},
        };
      }
    } catch (error) {
      console.error('[ThemeService] Failed to load config:', error);
      this.config = {
        currentTheme: 'light',
        autoDarkMode: false,
        customThemes: {},
      };
    }
  }

  /**
   * Save theme configuration
   */
  private async saveConfig(): Promise<void> {
    try {
      if (this.config) {
        await AsyncStorage.setItem('theme_config', JSON.stringify(this.config));
      }
    } catch (error) {
      console.error('[ThemeService] Failed to save config:', error);
    }
  }

  /**
   * Apply theme
   */
  private async applyTheme(): Promise<void> {
    try {
      if (!this.config) {
        return;
      }
      
      const theme = this.getTheme(this.config.currentTheme);
      if (theme) {
        this.currentTheme = theme;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[ThemeService] Failed to apply theme:', error);
    }
  }

  /**
   * Apply system theme
   */
  private async applySystemTheme(): Promise<void> {
    try {
      const systemTheme = Appearance.getColorScheme();
      const themeName = systemTheme === 'dark' ? 'dark' : 'light';
      await this.setTheme(themeName);
    } catch (error) {
      console.error('[ThemeService] Failed to apply system theme:', error);
    }
  }

  /**
   * Set up system theme monitoring
   */
  private setupSystemThemeMonitoring(): void {
    Appearance.addChangeListener(({ colorScheme }) => {
      if (this.config?.autoDarkMode) {
        this.applySystemTheme();
      }
    });
  }

  /**
   * Get default theme
   */
  private getDefaultTheme(name: string): Theme | null {
    const themes = {
      light: this.getLightTheme(),
      dark: this.getDarkTheme(),
    };
    
    return themes[name as keyof typeof themes] || null;
  }

  /**
   * Get light theme
   */
  private getLightTheme(): Theme {
    return {
      name: 'light',
      isDark: false,
      colors: {
        primary: '#007AFF',
        primaryLight: '#4DA6FF',
        primaryDark: '#0056CC',
        secondary: '#5856D6',
        secondaryLight: '#8A88E6',
        secondaryDark: '#3D3B99',
        background: '#FFFFFF',
        backgroundSecondary: '#F8F9FA',
        backgroundTertiary: '#E9ECEF',
        surface: '#FFFFFF',
        surfaceSecondary: '#F8F9FA',
        surfaceTertiary: '#E9ECEF',
        text: '#000000',
        textSecondary: '#666666',
        textTertiary: '#999999',
        textInverse: '#FFFFFF',
        border: '#E1E5E9',
        borderSecondary: '#D1D5DB',
        borderTertiary: '#C1C5C9',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        info: '#007AFF',
        interactive: '#007AFF',
        interactiveHover: '#0056CC',
        interactivePressed: '#004499',
        interactiveDisabled: '#C1C5C9',
        shadow: '#000000',
        shadowLight: '#00000020',
        shadowDark: '#00000040',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      typography: {
        fontFamily: 'System',
        fontFamilyBold: 'System',
        fontFamilyLight: 'System',
        fontFamilyItalic: 'System',
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
          xxxl: 32,
        },
        lineHeight: {
          xs: 16,
          sm: 20,
          md: 24,
          lg: 28,
          xl: 32,
          xxl: 36,
          xxxl: 44,
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        md: '0 4px 8px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.1)',
        xxl: '0 32px 64px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
      },
    };
  }

  /**
   * Get dark theme
   */
  private getDarkTheme(): Theme {
    return {
      name: 'dark',
      isDark: true,
      colors: {
        primary: '#0A84FF',
        primaryLight: '#4DA6FF',
        primaryDark: '#0056CC',
        secondary: '#5E5CE6',
        secondaryLight: '#8A88E6',
        secondaryDark: '#3D3B99',
        background: '#000000',
        backgroundSecondary: '#1C1C1E',
        backgroundTertiary: '#2C2C2E',
        surface: '#1C1C1E',
        surfaceSecondary: '#2C2C2E',
        surfaceTertiary: '#3A3A3C',
        text: '#FFFFFF',
        textSecondary: '#EBEBF5',
        textTertiary: '#8E8E93',
        textInverse: '#000000',
        border: '#3A3A3C',
        borderSecondary: '#48484A',
        borderTertiary: '#636366',
        success: '#30D158',
        warning: '#FF9F0A',
        error: '#FF453A',
        info: '#0A84FF',
        interactive: '#0A84FF',
        interactiveHover: '#0056CC',
        interactivePressed: '#004499',
        interactiveDisabled: '#48484A',
        shadow: '#000000',
        shadowLight: '#00000040',
        shadowDark: '#00000080',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      typography: {
        fontFamily: 'System',
        fontFamilyBold: 'System',
        fontFamilyLight: 'System',
        fontFamilyItalic: 'System',
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
          xxxl: 32,
        },
        lineHeight: {
          xs: 16,
          sm: 20,
          md: 24,
          lg: 28,
          xl: 32,
          xxl: 36,
          xxxl: 44,
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 8px rgba(0, 0, 0, 0.3)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.3)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.3)',
        xxl: '0 32px 64px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
      },
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    if (this.currentTheme) {
      this.listeners.forEach((listeners, key) => {
        if (key === 'theme') {
          listeners.forEach(callback => callback(this.currentTheme!));
        }
      });
    }
  }
}

// Create singleton instance
const themeService = new ThemeService();

// Export convenience functions
export const initializeThemeService = () => themeService.initialize();
export const getCurrentTheme = () => themeService.getCurrentTheme();
export const getTheme = (name: string) => themeService.getTheme(name);
export const setTheme = (name: string) => themeService.setTheme(name);
export const toggleDarkMode = () => themeService.toggleDarkMode();
export const setAutoDarkMode = (enabled: boolean) => themeService.setAutoDarkMode(enabled);
export const createCustomTheme = (name: string, theme: Theme) => themeService.createCustomTheme(name, theme);
export const deleteCustomTheme = (name: string) => themeService.deleteCustomTheme(name);
export const subscribeToTheme = (callback: (theme: Theme) => void) => themeService.subscribe(callback);
export const getAvailableThemes = () => themeService.getAvailableThemes();
export const getThemeConfig = () => themeService.getConfig();
export const resetTheme = () => themeService.resetToDefault();

export default themeService;
