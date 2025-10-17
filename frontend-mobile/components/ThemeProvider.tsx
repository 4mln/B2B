import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  currentTheme: {
    name: string;
    isDark: boolean;
    colors: {
      primary: string;
      primaryLight: string;
      primaryDark: string;
      secondary: string;
      secondaryLight: string;
      secondaryDark: string;
      background: string;
      backgroundSecondary: string;
      backgroundTertiary: string;
      surface: string;
      surfaceSecondary: string;
      surfaceTertiary: string;
      text: string;
      textSecondary: string;
      textTertiary: string;
      textInverse: string;
      border: string;
      borderSecondary: string;
      borderTertiary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      interactive: string;
      interactiveHover: string;
      interactivePressed: string;
      interactiveDisabled: string;
      shadow: string;
      shadowLight: string;
      shadowDark: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    typography: {
      fontFamily: string;
      fontFamilyBold: string;
      fontFamilyLight: string;
      fontFamilyItalic: string;
      fontSize: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
        xxxl: number;
      };
      lineHeight: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
        xxxl: number;
      };
      fontWeight: {
        light: string;
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
      };
    };
    shadows: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    borderRadius: {
      none: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
    };
  };
  setTheme: (themeName: string) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const setTheme = async (themeName: string) => {
    console.log('Theme switched to:', themeName);
    // TODO: Implement theme switching logic
  };

  const toggleDarkMode = async () => {
    console.log('Dark mode toggled');
    // TODO: Implement dark mode toggle logic
  };

  const contextValue: ThemeContextType = {
    currentTheme: {
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
    },
    setTheme,
    toggleDarkMode,
    availableThemes: ['light', 'dark'],
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;