import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import PulseAnimation from './PulseAnimation';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  gradient?: string[];
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  badge?: number;
  pulse?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  gradient = theme.colors.gradients.primary,
  style,
  size = 'medium',
  badge,
  pulse = false,
}) => {
  const fabStyle = [
    styles.fab,
    styles[size],
    style,
  ];

  const renderFAB = () => (
    <TouchableOpacity
      style={fabStyle}
      onPress={onPress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={gradient}
        style={[styles.gradient, styles[size]]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Text style={[styles.icon, styles[`${size}Icon`]]}>{icon}</Text>
      </LinearGradient>
      {badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (pulse) {
    return (
      <PulseAnimation duration={2000} scale={1.1}>
        {renderFAB()}
      </PulseAnimation>
    );
  }

  return renderFAB();
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.lg,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
  },
  icon: {
    color: theme.colors.white,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error[500],
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[1],
  },
  badgeText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },

  // Size variants
  small: {
    width: 40,
    height: 40,
  },
  medium: {
    width: 56,
    height: 56,
  },
  large: {
    width: 72,
    height: 72,
  },

  // Icon sizes
  smallIcon: {
    fontSize: 16,
  },
  mediumIcon: {
    fontSize: 24,
  },
  largeIcon: {
    fontSize: 32,
  },
});

export default FloatingActionButton;