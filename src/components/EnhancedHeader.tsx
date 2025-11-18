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
          <GlassCard style={styles.headerContent} variant="light">
            <View style={styles.headerRow}>
              {showBackButton ? (
                <TouchableOpacity 
                  onPress={onBackPress}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <GlassCard style={styles.iconContainer} variant="light">
                    <Text style={styles.backIcon}>←</Text>
                  </GlassCard>
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
    paddingTop: StatusBar.currentHeight || 0,
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
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing[4],
  },
  title: {
    fontSize: theme.typography.heading.h2.fontSize,
    fontWeight: theme.typography.heading.h2.fontWeight as any,
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