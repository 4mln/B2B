export { useColorScheme as useDeviceColorScheme } from 'react-native';
import { ColorSchemeName } from 'react-native';
import { useThemeContext } from '@/components/ThemeProvider';

// Bridge hook for legacy imports to derive from unified theme context
export const useColorScheme = (): ColorSchemeName => {
  const { isDark } = useThemeContext();
  return isDark ? 'dark' : 'light';
};
