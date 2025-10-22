import { createFont, createTamagui, createTokens, isWeb } from 'tamagui'

// Persian/Farsi font for RTL support
const persianFont = createFont({
  family: isWeb
    ? 'Vazirmatn-Regular, Vazirmatn, Tahoma, Arial, sans-serif'
    : 'Vazirmatn-Regular',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
  },
  lineHeight: {
    1: 18,
    2: 20,
    3: 24,
    4: 28,
    5: 28,
    6: 32,
    7: 36,
  },
  weight: {
    1: '300',
    2: '400',
    3: '500',
    4: '600',
    5: '700',
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  },
  face: {
    300: { normal: 'Vazirmatn-Light' },
    400: { normal: 'Vazirmatn-Regular' },
    500: { normal: 'Vazirmatn-Medium' },
    600: { normal: 'Vazirmatn-SemiBold' },
    700: { normal: 'Vazirmatn-Bold' },
  },
})

// Modern Tamagui Design System
// - Comprehensive light/dark themes
// - Keys align with existing component usage (e.g., $primary500, $backgroundLight0, $textLight900)
// - Expanded tokens for size/space/radius/zIndex

// Removed systemFont - using persianFont (Vazirmatn) for all text

// Tokens
const size = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 40,
  10: 48,
  11: 56,
  12: 64,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  true: 16, // default
}

export const tokens = createTokens({
  size,
  space: { ...size, true: size.true, '-1': -4, '-2': -8 },
  radius: {
    0: 0,
    1: 6,
    2: 10,
    3: 14,
    4: 18,
    5: 24,
    full: 9999,
    md: 16
  },
  zIndex: { 0: 0, 1: 10, 2: 100, 3: 1000, 4: 10000 },
  color: {
    white: '#ffffff',
    black: '#000000',
    textLight400: '#9ca3af',
  },
})

const lightTheme = {
  // Brand
  primary50: '#eff6ff',
  primary100: '#dbeafe',
  primary500: '#3b82f6',
  primary600: '#2563eb',
  primary700: '#1d4ed8',

  // Backgrounds (light)
  backgroundLight0: '#ffffff',
  backgroundLight50: '#f9fafb',
  backgroundLight100: '#f3f4f6',
  backgroundLight200: '#e5e7eb',

  // Text (light)
  textLight900: '#111827',
  textLight700: '#374151',
  textLight600: '#6b7280',
  textLight500: '#9ca3af',

  // Borders (light)
  borderLight100: '#e5e7eb',
  borderLight200: '#d1d5db',
  borderLight300: '#d1d5db',

  // Backgrounds (dark variants may be referenced explicitly)
  backgroundDark0: '#0b0b0b',
  backgroundDark50: '#111827',

  // Text (dark variants may be referenced explicitly)
  textDark100: '#f9fafb',
  textDark300: '#d1d5db',

  // Feedback
  error500: '#ef4444',

  // Base theme keys used by Tamagui default components
  bg: '#f5f7fb',
  color: '#111827',
}

const darkTheme = {
  // Brand (slightly shifted for dark)
  primary50: '#1e293b',
  primary100: '#334155',
  primary500: '#60a5fa',
  primary600: '#3b82f6',
  primary700: '#2563eb',

  // Backgrounds (dark)
  backgroundDark0: '#0b0b0b',
  backgroundDark50: '#111827',
  backgroundLight0: '#1f2937',
  backgroundLight50: '#111827',
  backgroundLight100: '#0f172a',
  backgroundLight200: '#0b1220',

  // Text (dark)
  textDark100: '#f9fafb',
  textDark300: '#d1d5db',
  textLight900: '#f9fafb',
  textLight700: '#e5e7eb',
  textLight600: '#cbd5e1',
  textLight500: '#94a3b8',

  // Borders (dark)
  borderLight100: '#374151',
  borderLight200: '#4b5563',
  borderLight300: '#4b5563',

  // Feedback
  error500: '#f87171',

  // Base theme keys used by Tamagui default components
  bg: '#0b0b0b',
  color: '#f9fafb',
}

const configBase = {
  fonts: {
    heading: persianFont,
    body: persianFont,
    persian: persianFont,
    // Use Vazirmatn as default for all components
    true: persianFont,
  },
  tokens,

  // Enable compiler optimizations
  enableCSSInterop: true,

  // Enable animations with native driver
  animations: {
    bouncy: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    quick: {
      type: 'spring',
      damping: 25,
      mass: 1,
      stiffness: 300,
    },
    slow: {
      type: 'spring',
      damping: 15,
      mass: 1,
      stiffness: 200,
    },
  },

  // Compiler settings for better performance
  experimentalFlattening: true,
  cssInterop: {
    optimize: process.env.NODE_ENV === 'production',
  },

  themes: {
    light: lightTheme,
    dark: darkTheme,
  },

  media: {
    sm: { maxWidth: 860 },
    gtSm: { minWidth: 861 },
    short: { maxHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },


  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    f: 'flex',
    m: 'margin',
    w: 'width',
    h: 'height',
    bg: 'backgroundColor',
  } as const,

  defaultProps: {
    Text: {
      // Use Vazirmatn font for all text
      fontFamily: '$body',
    },
    Button: {
      borderRadius: '$3',
    },
    Input: {
      borderRadius: '$3',
      height: 48,
    },
  },
}

const config = createTamagui(configBase)

export type AppConfig = typeof configBase

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
  interface TypeOverride {
    groupNames(): 'card' | 'surface'
  }
}

export default config
