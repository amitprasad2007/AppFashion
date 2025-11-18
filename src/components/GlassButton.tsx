import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import GlassCard from './GlassCard';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  gradientColors?: string[];
}

const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  gradientColors,
}) => {
  const getButtonStyle = () => {
    const baseStyle = styles.button;
    
    switch (size) {
      case 'small':
        return [baseStyle, styles.smallButton];
      case 'large':
        return [baseStyle, styles.largeButton];
      default:
        return [baseStyle, styles.mediumButton];
    }
  };

  const getTextStyle = () => {
    const baseStyle = styles.buttonText;
    
    switch (size) {
      case 'small':
        return [baseStyle, styles.smallText];
      case 'large':
        return [baseStyle, styles.largeText];
      default:
        return [baseStyle, styles.mediumText];
    }
  };

  const isDisabled = disabled || loading;

  if (gradientColors) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[getButtonStyle(), style, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <GlassCard style={styles.glassOverlay} variant="light">
            {loading ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
              </>
            )}
          </GlassCard>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[getButtonStyle(), style, isDisabled && styles.disabled]}
    >
      <GlassCard style={styles.buttonContent} variant={variant}>
        {loading ? (
          <ActivityIndicator color={theme.colors.white} size="small" />
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  smallButton: {
    minHeight: 36,
  },
  mediumButton: {
    minHeight: 48,
  },
  largeButton: {
    minHeight: 56,
  },
  gradientContainer: {
    flex: 1,
  },
  glassOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.typography.body.small.fontSize,
  },
  mediumText: {
    fontSize: theme.typography.body.medium.fontSize,
  },
  largeText: {
    fontSize: theme.typography.body.large.fontSize,
  },
  icon: {
    fontSize: 18,
    marginRight: theme.spacing[2],
  },
  disabled: {
    opacity: 0.6,
  },
});

export default GlassButton;