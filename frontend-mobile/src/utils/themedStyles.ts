import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Theme, ThemeColors, ThemeSpacing, ThemeTypography, ThemeShadows, ThemeBorderRadius } from '@/services/themeService';

/**
 * Themed Styles Utility
 * Provides utilities for creating themed styles
 */

export interface ThemedStyleSheet {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
}

/**
 * Create themed styles
 */
export const createThemedStyles = <T extends ThemedStyleSheet>(
  styleCreator: (theme: Theme) => T
): (theme: Theme) => T => {
  return styleCreator;
};

/**
 * Create styles with theme colors
 */
export const createColorStyles = (theme: Theme) => ({
  primary: {
    color: theme.colors.primary,
  },
  primaryLight: {
    color: theme.colors.primaryLight,
  },
  primaryDark: {
    color: theme.colors.primaryDark,
  },
  secondary: {
    color: theme.colors.secondary,
  },
  secondaryLight: {
    color: theme.colors.secondaryLight,
  },
  secondaryDark: {
    color: theme.colors.secondaryDark,
  },
  text: {
    color: theme.colors.text,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  textTertiary: {
    color: theme.colors.textTertiary,
  },
  textInverse: {
    color: theme.colors.textInverse,
  },
  background: {
    backgroundColor: theme.colors.background,
  },
  backgroundSecondary: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  backgroundTertiary: {
    backgroundColor: theme.colors.backgroundTertiary,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  surfaceSecondary: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  surfaceTertiary: {
    backgroundColor: theme.colors.surfaceTertiary,
  },
  border: {
    borderColor: theme.colors.border,
  },
  borderSecondary: {
    borderColor: theme.colors.borderSecondary,
  },
  borderTertiary: {
    borderColor: theme.colors.borderTertiary,
  },
  success: {
    color: theme.colors.success,
  },
  warning: {
    color: theme.colors.warning,
  },
  error: {
    color: theme.colors.error,
  },
  info: {
    color: theme.colors.info,
  },
});

/**
 * Create styles with theme spacing
 */
export const createSpacingStyles = (theme: Theme) => ({
  paddingXs: {
    padding: theme.spacing.xs,
  },
  paddingSm: {
    padding: theme.spacing.sm,
  },
  paddingMd: {
    padding: theme.spacing.md,
  },
  paddingLg: {
    padding: theme.spacing.lg,
  },
  paddingXl: {
    padding: theme.spacing.xl,
  },
  paddingXxl: {
    padding: theme.spacing.xxl,
  },
  marginXs: {
    margin: theme.spacing.xs,
  },
  marginSm: {
    margin: theme.spacing.sm,
  },
  marginMd: {
    margin: theme.spacing.md,
  },
  marginLg: {
    margin: theme.spacing.lg,
  },
  marginXl: {
    margin: theme.spacing.xl,
  },
  marginXxl: {
    margin: theme.spacing.xxl,
  },
  gapXs: {
    gap: theme.spacing.xs,
  },
  gapSm: {
    gap: theme.spacing.sm,
  },
  gapMd: {
    gap: theme.spacing.md,
  },
  gapLg: {
    gap: theme.spacing.lg,
  },
  gapXl: {
    gap: theme.spacing.xl,
  },
  gapXxl: {
    gap: theme.spacing.xxl,
  },
});

/**
 * Create styles with theme typography
 */
export const createTypographyStyles = (theme: Theme) => ({
  fontFamily: {
    fontFamily: theme.typography.fontFamily,
  },
  fontFamilyBold: {
    fontFamily: theme.typography.fontFamilyBold,
  },
  fontFamilyLight: {
    fontFamily: theme.typography.fontFamilyLight,
  },
  fontFamilyItalic: {
    fontFamily: theme.typography.fontFamilyItalic,
  },
  fontSizeXs: {
    fontSize: theme.typography.fontSize.xs,
  },
  fontSizeSm: {
    fontSize: theme.typography.fontSize.sm,
  },
  fontSizeMd: {
    fontSize: theme.typography.fontSize.md,
  },
  fontSizeLg: {
    fontSize: theme.typography.fontSize.lg,
  },
  fontSizeXl: {
    fontSize: theme.typography.fontSize.xl,
  },
  fontSizeXxl: {
    fontSize: theme.typography.fontSize.xxl,
  },
  fontSizeXxxl: {
    fontSize: theme.typography.fontSize.xxxl,
  },
  lineHeightXs: {
    lineHeight: theme.typography.lineHeight.xs,
  },
  lineHeightSm: {
    lineHeight: theme.typography.lineHeight.sm,
  },
  lineHeightMd: {
    lineHeight: theme.typography.lineHeight.md,
  },
  lineHeightLg: {
    lineHeight: theme.typography.lineHeight.lg,
  },
  lineHeightXl: {
    lineHeight: theme.typography.lineHeight.xl,
  },
  lineHeightXxl: {
    lineHeight: theme.typography.lineHeight.xxl,
  },
  lineHeightXxxl: {
    lineHeight: theme.typography.lineHeight.xxxl,
  },
  fontWeightLight: {
    fontWeight: theme.typography.fontWeight.light,
  },
  fontWeightNormal: {
    fontWeight: theme.typography.fontWeight.normal,
  },
  fontWeightMedium: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  fontWeightSemibold: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  fontWeightBold: {
    fontWeight: theme.typography.fontWeight.bold,
  },
});

/**
 * Create styles with theme shadows
 */
export const createShadowStyles = (theme: Theme) => ({
  shadowNone: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  shadowSm: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  shadowLg: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  shadowXl: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  shadowXxl: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 32,
  },
});

/**
 * Create styles with theme border radius
 */
export const createBorderRadiusStyles = (theme: Theme) => ({
  borderRadiusNone: {
    borderRadius: theme.borderRadius.none,
  },
  borderRadiusSm: {
    borderRadius: theme.borderRadius.sm,
  },
  borderRadiusMd: {
    borderRadius: theme.borderRadius.md,
  },
  borderRadiusLg: {
    borderRadius: theme.borderRadius.lg,
  },
  borderRadiusXl: {
    borderRadius: theme.borderRadius.xl,
  },
  borderRadiusFull: {
    borderRadius: theme.borderRadius.full,
  },
});

/**
 * Create common themed styles
 */
export const createCommonStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  surface: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    ...createShadowStyles(theme).shadowSm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    ...createShadowStyles(theme).shadowMd,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
  },
  textTertiary: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.fontSize.xs,
    lineHeight: theme.typography.lineHeight.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.xl,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.lineHeight.lg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
});

/**
 * Create responsive styles
 */
export const createResponsiveStyles = (theme: Theme) => ({
  small: {
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
  },
  medium: {
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
  },
  large: {
    padding: theme.spacing.lg,
    fontSize: theme.typography.fontSize.lg,
  },
});

/**
 * Create animation styles
 */
export const createAnimationStyles = (theme: Theme) => ({
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
  slideIn: {
    transform: [{ translateY: 0 }],
  },
  slideOut: {
    transform: [{ translateY: 100 }],
  },
  scaleIn: {
    transform: [{ scale: 1 }],
  },
  scaleOut: {
    transform: [{ scale: 0 }],
  },
});

export default {
  createThemedStyles,
  createColorStyles,
  createSpacingStyles,
  createTypographyStyles,
  createShadowStyles,
  createBorderRadiusStyles,
  createCommonStyles,
  createResponsiveStyles,
  createAnimationStyles,
};
