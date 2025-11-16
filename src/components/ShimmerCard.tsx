import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { theme } from '../theme';

interface ShimmerCardProps {
  style?: ViewStyle;
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
}

const ShimmerCard: React.FC<ShimmerCardProps> = ({
  style,
  height = 120,
  width = '100%',
  borderRadius = theme.borderRadius.base,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmerAnimation = () => {
      shimmerAnimation.setValue(0);
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => startShimmerAnimation());
    };

    startShimmerAnimation();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          width,
          borderRadius,
        },
        style,
      ]}>
      <View style={styles.shimmerWrapper}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[200],
    overflow: 'hidden',
  },
  shimmerWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
  },
});

export default ShimmerCard;