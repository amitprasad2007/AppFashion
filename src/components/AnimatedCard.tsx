import React, {useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevation?: 'sm' | 'base' | 'md' | 'lg' | 'xl';
  animationType?: 'scale' | 'fade' | 'slide';
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  elevation = 'base',
  animationType = 'scale',
  delay = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.timing(animatedValue, {
      toValue: 1,
      duration: theme.animation.normal,
      delay,
      useNativeDriver: true,
    });
    
    animation.start();
  }, [animatedValue, delay]);

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: theme.animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: theme.animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'fade':
        return {
          opacity: animatedValue,
        };
      case 'slide':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'scale':
      default:
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
    }
  };

  const cardStyle = [
    styles.card,
    theme.shadows[elevation],
    style,
  ];

  const animatedStyle = [
    cardStyle,
    getAnimationStyle(),
    onPress && {
      transform: [
        ...((getAnimationStyle().transform as any) || []),
        { scale: scaleValue },
      ],
    },
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },
});

export default AnimatedCard;