import { ColorSchemeName } from 'react-native';
import { useThemeContext } from '@/components/ThemeProvider';

// Unified color scheme hook derived from app theme context (works across platforms)
export function useColorScheme(): ColorSchemeName {
  const { isDark } = useThemeContext();
  return isDark ? 'dark' : 'light';
}
