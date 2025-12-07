import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useUserProfile } from '../contexts/UserProfileContext';

interface CartIconProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
  showBadge?: boolean;
}

const CartIcon: React.FC<CartIconProps> = ({
  size = 'medium',
  color = theme.colors.neutral[700],
  style,
  showBadge = true,
}) => {
  const navigation = useNavigation();
  const { userStatistics } = useUserProfile();

  const cartItemsCount = userStatistics?.cartItemsCount || 0;

  const handlePress = () => {
    navigation.navigate('Cart' as never);
  };

  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28,
  };

  const badgeSizes = {
    small: 16,
    medium: 18,
    large: 20,
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={[
          styles.cartIcon,
          { fontSize: iconSizes[size], color }
        ]}>
          🛒
        </Text>
        {showBadge && cartItemsCount > 0 && (
          <View style={[
            styles.badge,
            {
              width: badgeSizes[size],
              height: badgeSizes[size],
              borderRadius: badgeSizes[size] / 2
            }
          ]}>
            <Text style={[
              styles.badgeText,
              { fontSize: size === 'small' ? 10 : size === 'medium' ? 11 : 12 }
            ]}>
              {cartItemsCount > 99 ? '99+' : cartItemsCount.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[2],
  },
  iconContainer: {
    position: 'relative',
  },
  cartIcon: {
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
});

export default CartIcon;