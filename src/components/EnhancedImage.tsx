import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';

interface EnhancedImageProps {
  source: { uri: string } | number;
  style?: any;
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  showLoader?: boolean;
  placeholder?: string;
  fallbackIcon?: string;
}

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  source,
  style,
  width = 150,
  height = 150,
  borderRadius = theme.borderRadius.lg,
  resizeMode = 'cover',
  showLoader = true,
  placeholder = '',
  fallbackIcon = '🖼️',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageStyle = [
    {
      width,
      height,
      borderRadius,
    },
    style,
  ];

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // If error, show fallback
  if (error) {
    return (
      <View style={[styles.fallbackContainer, imageStyle]}>
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.fallbackGradient}>
          <Text style={styles.fallbackIcon}>{fallbackIcon}</Text>
          {placeholder && (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, imageStyle]}>
      <Image
        source={source}
        style={[styles.image, imageStyle]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      
      {/* Loading overlay */}
      {loading && showLoader && (
        <View style={[styles.loadingOverlay, imageStyle]}>
          <LinearGradient
            colors={['rgba(248,249,250,0.9)', 'rgba(233,236,239,0.9)']}
            style={styles.loadingGradient}>
            <ActivityIndicator 
              size="small" 
              color={theme.colors.primary[500]} 
            />
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    overflow: 'hidden',
  },
  fallbackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  fallbackIcon: {
    fontSize: 32,
    marginBottom: theme.spacing[2],
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default EnhancedImage;