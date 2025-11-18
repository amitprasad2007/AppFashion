// Glassmorphism theme utilities
export const glassmorphism = {
  // Base glassmorphism style
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  
  // Variations
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  primary: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  
  secondary: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  
  // Card variations
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  
  // Button variations
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(12px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  
  // Input variations
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Header variations
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(25px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
};

// Gradient backgrounds for glassmorphism
export const glassGradients = {
  aurora: ['rgba(251, 113, 133, 0.6)', 'rgba(147, 51, 234, 0.6)', 'rgba(59, 130, 246, 0.6)'],
  sunset: ['rgba(251, 146, 60, 0.6)', 'rgba(251, 113, 133, 0.6)', 'rgba(147, 51, 234, 0.6)'],
  ocean: ['rgba(14, 165, 233, 0.6)', 'rgba(6, 182, 212, 0.6)', 'rgba(16, 185, 129, 0.6)'],
  emerald: ['rgba(16, 185, 129, 0.6)', 'rgba(5, 150, 105, 0.6)', 'rgba(4, 120, 87, 0.6)'],
  purple: ['rgba(139, 92, 246, 0.6)', 'rgba(168, 85, 247, 0.6)', 'rgba(192, 132, 252, 0.6)'],
  rose: ['rgba(244, 63, 94, 0.6)', 'rgba(225, 29, 72, 0.6)', 'rgba(190, 18, 60, 0.6)'],
};

// Animation presets for glassmorphism effects
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
    transform: [{ scale: 0.8 }, { scale: 1 }],
    opacity: [0, 1],
    duration: 500,
    easing: 'ease-out',
  },
  shimmer: {
    backgroundColor: [
      'rgba(255, 255, 255, 0.1)',
      'rgba(255, 255, 255, 0.3)',
      'rgba(255, 255, 255, 0.1)'
    ],
    duration: 2000,
    repeat: true,
  },
};