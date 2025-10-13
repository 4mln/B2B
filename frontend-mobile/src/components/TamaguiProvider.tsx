import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createFont, createTamagui, isWeb, TamaguiProvider as TGProvider } from 'tamagui';

// Import the base config
import config, { tokens } from '../../tamagui.config';

// Define themes locally
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
};

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
  borderLight300: '#4b5563',

  // Feedback
  error500: '#f87171',

  // Base theme keys used by Tamagui default components
  bg: '#0b0b0b',
  color: '#f9fafb',
};

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
});

type Props = { children: React.ReactNode };

export const TamaguiProvider: React.FC<Props> = ({ children }) => {
  const { i18n } = useTranslation();

  const dynamicConfig = useMemo(() => {
    const currentLanguage = i18n.language;

    // Use Persian font for Farsi, default system font for others
    const activeFont = currentLanguage === 'fa' ? persianFont : config.fonts?.body || config.fonts?.heading;

    return createTamagui({
      fonts: {
        heading: activeFont,
        body: activeFont,
        persian: persianFont,
      },
      tokens,
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      media: config.media,
      shorthands: config.shorthands,
      defaultProps: config.defaultProps,
    });
  }, [i18n.language]);

  return (
    <TGProvider config={dynamicConfig}>
      {children}
    </TGProvider>
  );
};

export default TamaguiProvider;


