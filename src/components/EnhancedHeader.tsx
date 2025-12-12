import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';

interface EnhancedHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  title = "Samar Silk Palace",
  showBackButton = false,
  onBackPress,
  rightComponent,
}) => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A0404"
        translucent={false}
      />
      <LinearGradient
        colors={['#4A0404', '#6B1515', '#8B4513', '#B8860B']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            {/* Decorative pattern overlay */}
            <View style={styles.decorativePattern} />

            <View style={styles.headerRow}>
              {showBackButton ? (
                <TouchableOpacity
                  onPress={onBackPress}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Text style={styles.backIcon}>←</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.placeholder} />
              )}

              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <View style={styles.titleUnderline} />
              </View>

              <View style={styles.rightContainer}>
                {rightComponent || <View style={styles.placeholder} />}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  safeArea: {
    paddingBottom: theme.spacing[2],
  },
  headerContent: {
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[2],
    position: 'relative',
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
  },
  backButton: {
    width: 40,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  backIcon: {
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing[4],
  },
  title: {
    fontSize: theme.typography.heading.h3.fontSize,
    fontWeight: theme.typography.heading.h3.fontWeight as any,
    color: theme.colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleUnderline: {
    width: 60,
    height: 2,
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing[1],
    borderRadius: 1,
    opacity: 0.7,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
});

export default EnhancedHeader;