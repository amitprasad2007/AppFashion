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
import GlassCard from './GlassCard';

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
        backgroundColor="transparent"
        translucent={true}
      />
      <LinearGradient
        colors={theme.glassGradients.aurora}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <GlassCard style={styles.headerContent} variant="secondary">
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
          </GlassCard>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight || theme.spacing[12],
  },
  safeArea: {
    paddingBottom: theme.spacing[2],
  },
  headerContent: {
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[2],
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
    paddingBottom: 6,
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
    fontSize: theme.typography.heading.h4.fontSize,
    fontWeight: '800',
    color: theme.colors.primary[900],
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 100,
    height: 3,
    backgroundColor: '#D4AF37', // Gold accent
    marginTop: theme.spacing[1],
    borderRadius: 2,
    opacity: 1,
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