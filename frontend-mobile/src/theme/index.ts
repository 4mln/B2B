import { colors, darkColors } from './colors';
import { semanticSpacing, spacing } from './spacing';
import { fontFamilies, fontSizes, fontWeights, lineHeights, typography } from './typography';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  fontWeights: typeof fontWeights;
  spacing: typeof spacing;
  semanticSpacing: typeof semanticSpacing;
  isRTL: boolean;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors,
  typography,
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  spacing,
  semanticSpacing,
  isRTL: false,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  spacing,
  semanticSpacing,
  isRTL: false,
  isDark: true,
};

export const persianLightTheme: Theme = {
  ...lightTheme,
  isRTL: true,
};

export const persianDarkTheme: Theme = {
  ...darkTheme,
  isRTL: true,
};

// Export individual modules
export * from './colors';
export * from './spacing';
export * from './typography';

