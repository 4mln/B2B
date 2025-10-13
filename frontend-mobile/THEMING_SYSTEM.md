# Theming System & Dark Mode

This document describes the comprehensive theming system implemented in the B2B Marketplace frontend.

## Overview

The theming system provides:
- **Dynamic Themes**: Switch between light and dark themes
- **Custom Themes**: Create and manage custom themes
- **Auto Dark Mode**: Automatically switch based on system preference
- **Consistent Styling**: Unified design system across all components
- **Responsive Design**: Adaptive styling for different screen sizes
- **Accessibility**: High contrast and readable color schemes

## Architecture

### Core Services

1. **ThemeService** (`src/services/themeService.ts`)
   - Manages theme state and configuration
   - Handles theme switching and persistence
   - Provides theme data to components

2. **ThemeProvider** (`src/components/ThemeProvider.tsx`)
   - React context provider for theme data
   - Wraps the entire app for theme access

### React Hooks

1. **useTheme** (`src/hooks/useTheme.ts`)
   - Main hook for theme functionality
   - Theme switching and management
   - Real-time theme updates

### Components

1. **ThemeToggle** (`src/components/ThemeToggle.tsx`)
   - Theme switching controls
   - Auto dark mode toggle
   - Theme selector

### Utilities

1. **themedStyles** (`src/utils/themedStyles.ts`)
   - Utility functions for creating themed styles
   - Consistent styling patterns
   - Responsive design helpers

## Usage Examples

### Basic Theme Usage

```tsx
import { useThemeContext } from '@/components/ThemeProvider';

const MyComponent = () => {
  const { theme, isDark, toggleDarkMode } = useThemeContext();
  
  if (!theme) return null;
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </Text>
      <TouchableOpacity onPress={toggleDarkMode}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Themed Styling

```tsx
import { createThemedStyles } from '@/utils/themedStyles';

const themedStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
}));

const MyComponent = () => {
  const { theme } = useThemeContext();
  const styles = themedStyles(theme);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Themed Component</Text>
      <TouchableOpacity style={styles.button}>
        <Text>Button</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Theme Toggle Component

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

const SettingsScreen = () => {
  return (
    <View>
      <ThemeToggle 
        showLabel={true}
        showAutoMode={true}
        onThemeChange={(themeName) => console.log('Theme changed:', themeName)}
        onAutoModeChange={(enabled) => console.log('Auto mode:', enabled)}
      />
    </View>
  );
};
```

### Custom Theme Creation

```tsx
import { useThemeContext } from '@/components/ThemeProvider';

const MyComponent = () => {
  const { createCustomTheme } = useThemeContext();
  
  const handleCreateCustomTheme = async () => {
    const customTheme = {
      name: 'custom',
      isDark: false,
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        background: '#FFFFFF',
        text: '#333333',
        // ... other colors
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      // ... other theme properties
    };
    
    await createCustomTheme('custom', customTheme);
  };
  
  return (
    <TouchableOpacity onPress={handleCreateCustomTheme}>
      <Text>Create Custom Theme</Text>
    </TouchableOpacity>
  );
};
```

## Theme Structure

### Theme Interface

```typescript
interface Theme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
  isDark: boolean;
}
```

### Color System

```typescript
interface ThemeColors {
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
```

### Spacing System

```typescript
interface ThemeSpacing {
  xs: number;    // 4px
  sm: number;    // 8px
  md: number;    // 16px
  lg: number;    // 24px
  xl: number;    // 32px
  xxl: number;   // 48px
}
```

### Typography System

```typescript
interface ThemeTypography {
  fontFamily: string;
  fontFamilyBold: string;
  fontFamilyLight: string;
  fontFamilyItalic: string;
  
  fontSize: {
    xs: number;    // 12px
    sm: number;    // 14px
    md: number;    // 16px
    lg: number;    // 18px
    xl: number;    // 20px
    xxl: number;   // 24px
    xxxl: number;  // 32px
  };
  
  lineHeight: {
    xs: number;    // 16px
    sm: number;    // 20px
    md: number;    // 24px
    lg: number;    // 28px
    xl: number;    // 32px
    xxl: number;   // 36px
    xxxl: number;  // 44px
  };
  
  fontWeight: {
    light: string;     // '300'
    normal: string;    // '400'
    medium: string;    // '500'
    semibold: string;  // '600'
    bold: string;      // '700'
  };
}
```

## Built-in Themes

### Light Theme

```typescript
const lightTheme = {
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
    // ... other colors
  },
  // ... other properties
};
```

### Dark Theme

```typescript
const darkTheme = {
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
    // ... other colors
  },
  // ... other properties
};
```

## Styling Utilities

### Color Styles

```typescript
import { createColorStyles } from '@/utils/themedStyles';

const colorStyles = createColorStyles(theme);

// Usage
<View style={colorStyles.primary} />
<Text style={colorStyles.text} />
<View style={colorStyles.background} />
```

### Spacing Styles

```typescript
import { createSpacingStyles } from '@/utils/themedStyles';

const spacingStyles = createSpacingStyles(theme);

// Usage
<View style={spacingStyles.paddingMd} />
<View style={spacingStyles.marginLg} />
<View style={spacingStyles.gapSm} />
```

### Typography Styles

```typescript
import { createTypographyStyles } from '@/utils/themedStyles';

const typographyStyles = createTypographyStyles(theme);

// Usage
<Text style={typographyStyles.fontSizeLg} />
<Text style={typographyStyles.fontWeightBold} />
<Text style={typographyStyles.lineHeightMd} />
```

### Shadow Styles

```typescript
import { createShadowStyles } from '@/utils/themedStyles';

const shadowStyles = createShadowStyles(theme);

// Usage
<View style={shadowStyles.shadowMd} />
<View style={shadowStyles.shadowLg} />
```

### Border Radius Styles

```typescript
import { createBorderRadiusStyles } from '@/utils/themedStyles';

const borderRadiusStyles = createBorderRadiusStyles(theme);

// Usage
<View style={borderRadiusStyles.borderRadiusMd} />
<View style={borderRadiusStyles.borderRadiusLg} />
```

### Common Styles

```typescript
import { createCommonStyles } from '@/utils/themedStyles';

const commonStyles = createCommonStyles(theme);

// Usage
<View style={commonStyles.container} />
<View style={commonStyles.card} />
<TouchableOpacity style={commonStyles.button}>
  <Text style={commonStyles.buttonText}>Button</Text>
</TouchableOpacity>
```

## Advanced Features

### Custom Theme Creation

```typescript
const customTheme = {
  name: 'custom',
  isDark: false,
  colors: {
    primary: '#FF6B6B',
    primaryLight: '#FF8E8E',
    primaryDark: '#E55555',
    secondary: '#4ECDC4',
    secondaryLight: '#7EDDD6',
    secondaryDark: '#3BB5AC',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#E9ECEF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    surfaceTertiary: '#E9ECEF',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    textTertiary: '#BDC3C7',
    textInverse: '#FFFFFF',
    border: '#E1E5E9',
    borderSecondary: '#D1D5DB',
    borderTertiary: '#C1C5C9',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
    // ... other colors
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
```

### Auto Dark Mode

```typescript
import { useThemeContext } from '@/components/ThemeProvider';

const MyComponent = () => {
  const { setAutoDarkMode, getThemeConfig } = useThemeContext();
  
  const handleAutoModeToggle = async (enabled: boolean) => {
    await setAutoDarkMode(enabled);
  };
  
  const config = getThemeConfig();
  const autoMode = config?.autoDarkMode || false;
  
  return (
    <Switch
      value={autoMode}
      onValueChange={handleAutoModeToggle}
    />
  );
};
```

### Theme Persistence

The theme system automatically persists:
- Current theme selection
- Auto dark mode setting
- Custom themes
- User preferences

### System Integration

The theme system integrates with:
- **System Appearance**: Follows system dark/light mode
- **Accessibility**: High contrast and readable colors
- **Platform**: iOS and Android specific styling
- **Responsive**: Adaptive to different screen sizes

## Best Practices

### Theme Usage

1. **Consistent Colors**: Use theme colors instead of hardcoded values
2. **Responsive Spacing**: Use theme spacing for consistent layouts
3. **Typography**: Use theme typography for consistent text styling
4. **Shadows**: Use theme shadows for consistent elevation
5. **Border Radius**: Use theme border radius for consistent shapes

### Performance

1. **Memoization**: Use React.memo for themed components
2. **Style Objects**: Create style objects outside render functions
3. **Theme Context**: Use theme context efficiently
4. **Style Caching**: Cache computed styles when possible

### Accessibility

1. **Color Contrast**: Ensure sufficient color contrast
2. **Text Size**: Use appropriate text sizes
3. **Touch Targets**: Maintain minimum touch target sizes
4. **Screen Readers**: Provide proper accessibility labels

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useTheme } from '@/hooks/useTheme';

test('should return theme data', () => {
  const { result } = renderHook(() => useTheme());
  expect(result.current.theme).toBeDefined();
  expect(result.current.isDark).toBe(false);
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

test('should toggle theme', () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
  
  const toggle = screen.getByRole('button');
  fireEvent.press(toggle);
  
  expect(screen.getByText('Dark')).toBeInTheDocument();
});
```

### E2E Tests

```typescript
// Test theme switching
describe('Theme System', () => {
  it('should switch between light and dark themes', async () => {
    // Navigate to settings
    await element(by.id('settings-tab')).tap();
    
    // Toggle theme
    await element(by.id('theme-toggle')).tap();
    
    // Verify theme change
    expect(await element(by.id('dark-theme-indicator')).toBeVisible());
  });
});
```

## Troubleshooting

### Common Issues

1. **Theme Not Applied**: Check ThemeProvider wrapping
2. **Colors Not Updating**: Verify theme context usage
3. **Performance Issues**: Optimize style calculations
4. **Accessibility**: Ensure color contrast compliance

### Debug Tools

```typescript
// Debug theme data
const { theme, isDark, isLight } = useThemeContext();
console.log('Current theme:', theme);
console.log('Is dark:', isDark);
console.log('Is light:', isLight);

// Debug theme configuration
const config = getThemeConfig();
console.log('Theme config:', config);
```

## Future Enhancements

### Advanced Features

- **Theme Editor**: Visual theme creation tool
- **Theme Sharing**: Share custom themes
- **Theme Analytics**: Track theme usage
- **Dynamic Themes**: Server-driven themes
- **Theme Presets**: Pre-built theme collections
- **Accessibility Themes**: High contrast and large text themes

### Performance Improvements

- **Theme Caching**: Cache computed styles
- **Lazy Loading**: Load themes on demand
- **Style Optimization**: Optimize style calculations
- **Memory Management**: Better memory usage

### User Experience

- **Theme Previews**: Preview themes before applying
- **Theme Recommendations**: Suggest themes based on usage
- **Theme History**: Track theme changes
- **Theme Backup**: Backup and restore themes
