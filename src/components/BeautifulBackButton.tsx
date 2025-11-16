import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

interface BeautifulBackButtonProps {
  onPress?: () => void;
  style?: any;
  variant?: 'gradient' | 'glass' | 'solid';
  size?: 'sm' | 'md' | 'lg';
}

const BeautifulBackButton: React.FC<BeautifulBackButtonProps> = ({
  onPress,
  style,
  variant = 'gradient',
  size = 'md'
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 36, height: 36, borderRadius: 18 };
      case 'lg':
        return { width: 52, height: 52, borderRadius: 26 };
      default:
        return { width: 44, height: 44, borderRadius: 22 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 18;
      case 'lg':
        return 28;
      default:
        return 22;
    }
  };

  const sizeStyles = getSizeStyles();
  const iconSize = getIconSize();

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.container, sizeStyles, style]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={[styles.gradientButton, sizeStyles]}>
          <View style={[styles.iconContainer, sizeStyles]}>
            <View style={styles.arrowIcon}>
              <Text style={[styles.backIcon, { fontSize: iconSize }]}>‹</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'glass') {
    return (
      <TouchableOpacity
        style={[styles.container, sizeStyles, style]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={[styles.glassButton, sizeStyles]}>
          <View style={[styles.iconContainer, sizeStyles]}>
            <View style={styles.arrowIcon}>
              <Text style={[styles.backIconDark, { fontSize: iconSize }]}>‹</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, sizeStyles, style]}
      onPress={handlePress}
      activeOpacity={0.8}>
      <View style={[styles.solidButton, sizeStyles]}>
        <View style={[styles.iconContainer, sizeStyles]}>
          <View style={styles.arrowIcon}>
            <Text style={[styles.backIconDark, { fontSize: iconSize }]}>‹</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  solidButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  arrowIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  backIcon: {
    color: theme.colors.white,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginTop: Platform.OS === 'ios' ? -2 : -1,
    marginLeft: Platform.OS === 'ios' ? -1 : 0,
  },
  backIconDark: {
    color: theme.colors.neutral[700],
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginTop: Platform.OS === 'ios' ? -2 : -1,
    marginLeft: Platform.OS === 'ios' ? -1 : 0,
  },
});

export default BeautifulBackButton;