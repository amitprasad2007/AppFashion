import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: string[];
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  gradient = theme.colors.gradients.primary,
  size = 'medium',
  variant = 'filled',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyle = [
    styles.button,
    styles[size],
    variant === 'outlined' && styles.outlined,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'outlined' && styles.outlinedText,
    disabled && styles.disabledText,
    textStyle,
  ];

  if (variant === 'outlined') {
    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}>
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[buttonStyle, {borderRadius: theme.borderRadius.base}]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <LinearGradient
        colors={gradient}
        style={[styles.gradient, {borderRadius: theme.borderRadius.base}]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.base,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  
  // Size variants
  small: {
    height: 36,
    paddingHorizontal: theme.spacing[4],
  },
  medium: {
    height: 48,
    paddingHorizontal: theme.spacing[6],
  },
  large: {
    height: 56,
    paddingHorizontal: theme.spacing[8],
  },
  
  // Text size variants
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.base,
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  // Outlined variant
  outlined: {
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    backgroundColor: 'transparent',
  },
  outlinedText: {
    color: theme.colors.primary[500],
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.neutral[400],
  },
});

export default GradientButton;