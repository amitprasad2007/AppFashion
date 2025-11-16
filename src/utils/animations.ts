import { Animated } from 'react-native';
import { theme } from '../theme';

export const createFadeInAnimation = (
  animatedValue: Animated.Value,
  duration: number = theme.animation.normal,
  delay: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1.05,
  duration: number = theme.animation.fast
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

export const createSlideInAnimation = (
  animatedValue: Animated.Value,
  fromValue: number = 50,
  duration: number = theme.animation.normal,
  delay: number = 0
) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const createBounceAnimation = (
  animatedValue: Animated.Value,
  duration: number = theme.animation.slow
) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.1,
      duration: duration / 3,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: duration / 3,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration / 3,
      useNativeDriver: true,
    }),
  ]);
};

export const createPulseAnimation = (
  animatedValue: Animated.Value,
  minValue: number = 1,
  maxValue: number = 1.05,
  duration: number = 1000
) => {
  const pulse = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]).start(() => pulse());
  };
  return pulse;
};