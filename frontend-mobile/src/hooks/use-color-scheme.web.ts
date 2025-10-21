import { useThemeContext } from '@/components/ThemeProvider';
import type { ColorSchemeName } from 'react-native';

// Web-specific hook: derive color scheme from unified ThemeProvider (not system)
export function useColorScheme(): ColorSchemeName {
  const { isDark } = useThemeContext();
  return isDark ? 'dark' : 'light';
}
