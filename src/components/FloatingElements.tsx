import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface FloatingElementsProps {
  count?: number;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ count = 6 }) => {
  const animations = useRef(
    Array.from({ length: count }, () => ({
      translateY: new Animated.Value(height),
      translateX: new Animated.Value(Math.random() * width),
      opacity: new Animated.Value(0.3),
      scale: new Animated.Value(0.5),
    }))
  ).current;

  useEffect(() => {
    const createFloatingAnimation = (index: number) => {
      const { translateY, translateX, opacity, scale } = animations[index];
      
      const animateFloat = () => {
        // Reset position
        translateY.setValue(height + 100);
        translateX.setValue(Math.random() * width);
        opacity.setValue(0.3);
        scale.setValue(0.5 + Math.random() * 0.5);

        // Create floating animation
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(translateX, {
                toValue: translateX._value + (Math.random() - 0.5) * 100,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: translateX._value + (Math.random() - 0.5) * 100,
                duration: 3000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start(() => {
          // Restart animation with delay
          setTimeout(() => animateFloat(), Math.random() * 2000);
        });
      };

      // Start with random delay
      setTimeout(animateFloat, index * 1000 + Math.random() * 2000);
    };

    animations.forEach((_, index) => {
      createFloatingAnimation(index);
    });
  }, [animations]);

  const elements = ['✨', '💎', '🌟', '💫', '⭐', '🔮'];

  return (
    <View style={styles.container} pointerEvents="none">
      {animations.map((animation, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingElement,
            {
              transform: [
                { translateX: animation.translateX },
                { translateY: animation.translateY },
                { scale: animation.scale },
              ],
              opacity: animation.opacity,
            },
          ]}
        >
          <View style={styles.elementContainer}>
            <View style={styles.glowEffect} />
            <View style={styles.element}>
              <Text style={styles.elementText}>
                {elements[index % elements.length]}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  floatingElement: {
    position: 'absolute',
  },
  elementContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  element: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default FloatingElements;