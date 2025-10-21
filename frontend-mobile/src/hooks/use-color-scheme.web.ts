import { useThemeContext } from '@/components/ThemeProvider';

// Web-specific color scheme hook that follows app theme (not OS)
export function useColorScheme(): 'dark' | 'light' {
  const { isDark } = useThemeContext();
  return isDark ? 'dark' : 'light';
}
