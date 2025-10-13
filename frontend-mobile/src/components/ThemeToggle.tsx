import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useThemeContext } from './ThemeProvider';

/**
 * Theme Toggle Component
 * Allows users to toggle between light and dark themes
 */

export interface ThemeToggleProps {
  showLabel?: boolean;
  showAutoMode?: boolean;
  onThemeChange?: (themeName: string) => void;
  onAutoModeChange?: (enabled: boolean) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = true,
  showAutoMode = true,
  onThemeChange,
  onAutoModeChange,
}) => {
  const { 
    theme, 
    isDark, 
    setTheme, 
    toggleDarkMode, 
    setAutoDarkMode,
    getThemeConfig 
  } = useThemeContext();

  const config = getThemeConfig();
  const autoMode = config?.autoDarkMode || false;

  const handleToggle = async () => {
    try {
      await toggleDarkMode();
      onThemeChange?.(isDark ? 'light' : 'dark');
    } catch (error) {
      console.error('[ThemeToggle] Failed to toggle theme:', error);
    }
  };

  const handleAutoModeToggle = async (enabled: boolean) => {
    try {
      await setAutoDarkMode(enabled);
      onAutoModeChange?.(enabled);
    } catch (error) {
      console.error('[ThemeToggle] Failed to toggle auto mode:', error);
    }
  };

  if (!theme) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Theme
        </Text>
      )}
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.themeButton,
            { 
              backgroundColor: isDark ? theme.colors.primary : theme.colors.surfaceSecondary,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={handleToggle}
        >
          <Text style={[
            styles.themeButtonText,
            { color: isDark ? theme.colors.textInverse : theme.colors.text }
          ]}>
            {isDark ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.themeText, { color: theme.colors.textSecondary }]}>
          {isDark ? 'Dark' : 'Light'}
        </Text>
      </View>
      
      {showAutoMode && (
        <View style={styles.autoModeContainer}>
          <Text style={[styles.autoModeLabel, { color: theme.colors.text }]}>
            Auto
          </Text>
          <Switch
            value={autoMode}
            onValueChange={handleAutoModeToggle}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.colors.primary 
            }}
            thumbColor={autoMode ? theme.colors.textInverse : theme.colors.text}
          />
        </View>
      )}
    </View>
  );
};

/**
 * Compact Theme Toggle
 * Shows minimal theme toggle
 */
export const CompactThemeToggle: React.FC<{
  onThemeChange?: (themeName: string) => void;
}> = ({ onThemeChange }) => {
  const { isDark, toggleDarkMode } = useThemeContext();

  const handleToggle = async () => {
    try {
      await toggleDarkMode();
      onThemeChange?.(isDark ? 'light' : 'dark');
    } catch (error) {
      console.error('[CompactThemeToggle] Failed to toggle theme:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.compactButton}
      onPress={handleToggle}
    >
      <Text style={styles.compactIcon}>
        {isDark ? '🌙' : '☀️'}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Theme Selector
 * Shows all available themes
 */
export const ThemeSelector: React.FC<{
  onThemeChange?: (themeName: string) => void;
}> = ({ onThemeChange }) => {
  const { 
    theme, 
    setTheme, 
    getAvailableThemes 
  } = useThemeContext();

  const availableThemes = getAvailableThemes();

  const handleThemeSelect = async (themeName: string) => {
    try {
      await setTheme(themeName);
      onThemeChange?.(themeName);
    } catch (error) {
      console.error('[ThemeSelector] Failed to select theme:', error);
    }
  };

  if (!theme) {
    return null;
  }

  return (
    <View style={[styles.selectorContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text }]}>
        Select Theme
      </Text>
      
      {availableThemes.map((themeName) => (
        <TouchableOpacity
          key={themeName}
          style={[
            styles.themeOption,
            { 
              backgroundColor: theme.name === themeName ? theme.colors.primary : theme.colors.surfaceSecondary,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={() => handleThemeSelect(themeName)}
        >
          <Text style={[
            styles.themeOptionText,
            { 
              color: theme.name === themeName ? theme.colors.textInverse : theme.colors.text 
            }
          ]}>
            {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    margin: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 8,
  },
  themeButtonText: {
    fontSize: 18,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  autoModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  autoModeLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  compactIcon: {
    fontSize: 16,
  },
  selectorContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 8,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeToggle;
