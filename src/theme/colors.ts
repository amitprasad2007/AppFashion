export const colors = {
  // Primary Brand Colors - Royal Maroon
  primary: {
    50: '#fdf2f4',
    100: '#fse1e6',
    200: '#fecdd6',
    300: '#fda4b4',
    400: '#fb718a',
    500: '#f43f63', // Keeping some vibrancy but shifting
    600: '#e11d48',
    700: '#be123c', // Deep Red (Primary base)
    800: '#9f1239', // Royal Maroon (Primary dark)
    900: '#881337', // Darkest Maroon
    950: '#4c0519', // Almost black maroon
  },

  // Secondary Colors - Royal Gold
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Gold Main
    600: '#d97706', // Gold Dark
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Neutral Colors - Warm Cream/Greys
  neutral: {
    50: '#fafaf9', // Warm white/cream
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917', // Warm black
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

  // Info Colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Accent Colors - Teal
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },

  // Special Colors
  gold: '#D4AF37',
  goldLight: '#F4D06F',
  silver: '#E5E4E2',
  black: '#000000',
  white: '#ffffff',
  cream: '#FFFDD0',

  // Gradients
  gradients: {
    primary: ['#9f1239', '#be123c'], // Deep Maroon Gradient
    secondary: ['#B8860B', '#DAA520'], // Gold Gradient
    sunset: ['#9f1239', '#fb7185', '#fda4b4'], // Reddish sunset
    ocean: ['#0c4a6e', '#0369a1', '#0ea5e9'], // Deep Blue
    purple: ['#581c87', '#7e22ce', '#a855f7'], // Deep Purple
    emerald: ['#064e3b', '#059669', '#10b981'], // Deep Green
    royal: ['#4c0519', '#881337', '#be123c'], // Ultra Premium Maroon
  },
};

// Light theme - Default
export const lightTheme = {
  background: colors.neutral[50], // Cream/Off-white background
  surface: colors.white,
  surfaceVariant: colors.neutral[100],
  primary: colors.primary[800], // Dark Maroon as primary
  primaryContainer: colors.primary[100],
  secondary: colors.secondary[600], // Gold as secondary
  secondaryContainer: colors.secondary[100],
  tertiary: colors.neutral[600],

  // Text colors
  onBackground: colors.neutral[900],
  onSurface: colors.neutral[800],
  onPrimary: colors.white,
  onSecondary: colors.white,
  onTertiary: colors.white,

  // Semantic colors
  success: colors.success[600], // Darker green for better contrast
  warning: colors.warning[600],
  error: colors.error[600],
  info: colors.secondary[600],

  // Border colors
  border: colors.neutral[200],
  borderVariant: colors.neutral[300],

  // Shadow colors
  shadow: colors.black,
  elevation: colors.neutral[800],
};

// Dark theme
export const darkTheme = {
  background: colors.neutral[900], // Warm Black
  surface: colors.neutral[800],
  surfaceVariant: colors.neutral[700],
  primary: colors.primary[400], // Lighter Maroon/Pink for dark mode
  primaryContainer: colors.primary[900],
  secondary: colors.secondary[400], // Light Gold
  secondaryContainer: colors.secondary[900],
  tertiary: colors.neutral[400],

  // Text colors
  onBackground: colors.neutral[50],
  onSurface: colors.neutral[100],
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