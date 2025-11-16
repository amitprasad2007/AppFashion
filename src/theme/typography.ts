export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // Will use system font
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    light: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Alias for easier access (backwards compatibility)
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font weights
  fontWeight: {
    thin: '100' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Alias for easier access (backwards compatibility)
  weight: {
    thin: '100' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  // Text styles
  heading: {
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.375,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.375,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },
  },
  
  body: {
    large: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 1.625,
    },
    medium: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    small: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
  },
  
  label: {
    large: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },
    medium: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },
    small: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },
  },
  
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 1.5,
  },
  
  overline: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },
};