import { useThemeContext } from '@/components/ThemeProvider';

// Unified color scheme hook driven by app ThemeProvider
// Returns 'dark' or 'light' in sync with ThemeService
export function useColorScheme(): 'dark' | 'light' {
  const { isDark } = useThemeContext();
  return isDark ? 'dark' : 'light';
}
