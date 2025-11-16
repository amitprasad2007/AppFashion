import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import AnimatedCard from './AnimatedCard';

interface StatusCardProps {
  title: string;
  subtitle?: string;
  value: string;
  icon: string;
  gradient?: string[];
  style?: ViewStyle;
  onPress?: () => void;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  gradient = theme.colors.gradients.primary,
  style,
  onPress,
  trend,
}) => {
  return (
    <AnimatedCard
      style={[styles.card, style]}
      onPress={onPress}
      elevation="lg"
      animationType="scale">
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>{icon}</Text>
            {trend && (
              <View style={[
                styles.trendBadge,
                trend.direction === 'up' ? styles.trendUp : styles.trendDown
              ]}>
                <Text style={styles.trendIcon}>
                  {trend.direction === 'up' ? '📈' : '📉'}
                </Text>
                <Text style={styles.trendText}>{trend.value}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.title}>{title}</Text>
          
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  gradient: {
    padding: theme.spacing[5],
    borderRadius: theme.borderRadius.lg,
  },
  content: {
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing[3],
  },
  icon: {
    fontSize: 32,
    opacity: 0.9,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  trendUp: {
    backgroundColor: 'rgba(34,197,94,0.3)',
  },
  trendDown: {
    backgroundColor: 'rgba(239,68,68,0.3)',
  },
  trendIcon: {
    fontSize: 12,
    marginRight: theme.spacing[1],
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  value: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.white,
    marginBottom: theme.spacing[1],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
    opacity: 0.95,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.8,
    marginTop: theme.spacing[1],
  },
});

export default StatusCard;