export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e', // Main primary
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main secondary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Special Colors
  gold: '#ffd700',
  silver: '#c0c0c0',
  black: '#000000',
  white: '#ffffff',
  
  // Gradients
  gradients: {
    primary: ['#f43f5e', '#e11d48'],
    secondary: ['#0ea5e9', '#0284c7'],
    sunset: ['#ff6b6b', '#ffa500', '#ffff00'],
    ocean: ['#0ea5e9', '#06b6d4', '#0891b2'],
    purple: ['#8b5cf6', '#a855f7', '#c084fc'],
    emerald: ['#10b981', '#059669', '#047857'],
  },
};

// Light theme
export const lightTheme = {
  background: colors.white,
  surface: colors.neutral[50],
  surfaceVariant: colors.neutral[100],
  primary: colors.primary[500],
  primaryContainer: colors.primary[100],
  secondary: colors.secondary[500],
  secondaryContainer: colors.secondary[100],
  tertiary: colors.neutral[600],
  
  // Text colors
  onBackground: colors.neutral[900],
  onSurface: colors.neutral[800],
  onPrimary: colors.white,
  onSecondary: colors.white,
  onTertiary: colors.white,
  
  // Semantic colors
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.error[500],
  info: colors.secondary[500],
  
  // Border colors
  border: colors.neutral[200],
  borderVariant: colors.neutral[300],
  
  // Shadow colors
  shadow: colors.black,
  elevation: colors.neutral[800],
};

// Dark theme
export const darkTheme = {
  background: colors.neutral[900],
  surface: colors.neutral[800],
  surfaceVariant: colors.neutral[700],
  primary: colors.primary[400],
  primaryContainer: colors.primary[800],
  secondary: colors.secondary[400],
  secondaryContainer: colors.secondary[800],
  tertiary: colors.neutral[400],
  
  // Text colors
  onBackground: colors.neutral[100],
  onSurface: colors.neutral[200],
  onPrimary: colors.neutral[900],
  onSecondary: colors.neutral[900],
  onTertiary: colors.neutral[900],
  
  // Semantic colors
  success: colors.success[400],
  warning: colors.warning[400],
  error: colors.error[400],
  info: colors.secondary[400],
  
  // Border colors
  border: colors.neutral[700],
  borderVariant: colors.neutral[600],
  
  // Shadow colors
  shadow: colors.black,
  elevation: colors.neutral[900],
};