// Modern dark theme color palette inspired by professional UIs
export const colors = {
  // Primary brand colors (modern green)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main brand color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Secondary colors (modern blue)
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Modern blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Success green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Error red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warning yellow
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Modern dark theme backgrounds
  background: {
    light: '#ffffff',
    dark: '#131722', // Modern dark background
    gray: '#f8fafc',
    surface: '#1e222d', // Surface color
    elevated: '#2a2e39', // Elevated surface
  },
  
  // Modern text colors
  text: {
    primary: '#d1d4dc', // Primary text
    secondary: '#b2b5be', // Secondary text
    tertiary: '#787b86', // Tertiary text
    inverse: '#ffffff',
    muted: '#5d606b', // Muted text
  },
  
  // Modern border colors
  border: {
    light: '#2a2e39',
    medium: '#363a45',
    dark: '#434651',
    accent: '#2962ff', // Accent border
  },
  
  // Modern card colors
  card: {
    background: '#1e222d',
    border: '#2a2e39',
    shadow: 'rgba(0, 0, 0, 0.3)',
    elevated: '#2a2e39',
  },
} as const;

// Light mode colors (modern light theme)
export const lightColors = {
  ...colors,
  background: {
    light: '#ffffff',
    dark: '#f8fafc',
    gray: '#f1f5f9',
    surface: '#ffffff',
    elevated: '#f8fafc',
  },
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    tertiary: '#64748b',
    inverse: '#ffffff',
    muted: '#94a3b8',
  },
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
    accent: '#2962ff',
  },
  card: {
    background: '#ffffff',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    elevated: '#f8fafc',
  },
} as const;

// Dark mode colors (modern dark theme)
export const darkColors = {
  ...colors,
  background: {
    light: '#131722',
    dark: '#0d1117',
    gray: '#1e222d',
    surface: '#1e222d',
    elevated: '#2a2e39',
  },
  text: {
    primary: '#d1d4dc',
    secondary: '#b2b5be',
    tertiary: '#787b86',
    inverse: '#ffffff',
    muted: '#5d606b',
  },
  border: {
    light: '#2a2e39',
    medium: '#363a45',
    dark: '#434651',
    accent: '#2962ff',
  },
  card: {
    background: '#1e222d',
    border: '#2a2e39',
    shadow: 'rgba(0, 0, 0, 0.3)',
    elevated: '#2a2e39',
  },
} as const;
