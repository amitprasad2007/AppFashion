import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | TextStyle | (ViewStyle | TextStyle | undefined | null | false)[];
  variant?: 'light' | 'dark' | 'primary' | 'secondary' | 'base';
  gradientColors?: string[];
  borderRadius?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'base',
  gradientColors,
  borderRadius = theme.borderRadius.lg,
}) => {
  const glassStyle = theme.glassmorphism[variant];

  if (gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.container,
          glassStyle,
          { borderRadius },
          style,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.container,
        glassStyle,
        { borderRadius },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
  },
});

export default GlassCard;
