// Glassmorphism theme utilities
import { colors } from './colors';

export const glassmorphism = {
  // Base glassmorphism style - Clean & Subtle
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // More opaque for readability
    backdropFilter: 'blur(8px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Variations
  light: {
    backgroundColor: '#ffffff', // Solid white for cleanliness
    borderWidth: 1,
    borderColor: colors.neutral[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  dark: {
    backgroundColor: colors.neutral[800],
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },

  primary: {
    backgroundColor: colors.primary[50], // Very light maroon tint
    borderWidth: 1,
    borderColor: colors.primary[100],
  },

  secondary: {
    backgroundColor: colors.secondary[50], // Very light gold tint
    borderWidth: 1,
    borderColor: colors.secondary[100],
  },

  // Card variations - Solid and Premium
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Soft shadow
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },

  // Button variations
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(4px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Input variations
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
  },

  // Header variations
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
};

// Gradient backgrounds for glassmorphism - Subtler, Royal tones
export const glassGradients = {
  aurora: ['#be123c', '#9f1239', '#881337'], // Royal Maroon
  sunset: ['#b45309', '#d97706', '#f59e0b'], // Royal Gold
  ocean: ['#0369a1', '#0ea5e9', '#38bdf8'], // Royal Blue
  emerald: ['#047857', '#059669', '#10b981'], // Royal Green
  purple: ['#6d28d9', '#7c3aed', '#8b5cf6'], // Royal Purple
  rose: ['#be123c', '#e11d48', '#f43f5e'],
};

// Animation presets
export const glassAnimations = {
  fadeIn: {
    opacity: [0, 1],
    duration: 600,
    easing: 'ease-out',
  },
  slideUp: {
    transform: [{ translateY: 50 }, { translateY: 0 }],
    opacity: [0, 1],
    duration: 700,
    easing: 'ease-out',
  },
  scaleIn: {
    transform: [{ scale: 0.95 }, { scale: 1 }],
    opacity: [0, 1],
    duration: 500,
    easing: 'ease-out',
  },
  shimmer: {
    backgroundColor: [
      'rgba(255, 255, 255, 0.0)',
      'rgba(255, 255, 255, 0.4)',
      'rgba(255, 255, 255, 0.0)'
    ],
    duration: 1500,
  },
};