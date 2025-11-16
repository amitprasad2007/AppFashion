import { colors, lightTheme, darkTheme } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  light: lightTheme,
  dark: darkTheme,
  typography,
  spacing,
  borderRadius,
  shadows,
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  
  // Common component styles
  components: {
    button: {
      height: 48,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing[6],
    },
    input: {
      height: 48,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing[4],
      borderWidth: 1,
    },
    card: {
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      ...shadows.base,
    },
  },
};

export { colors, lightTheme, darkTheme, typography, spacing, borderRadius, shadows };
export type Theme = typeof theme;
export type ThemeColors = typeof lightTheme;