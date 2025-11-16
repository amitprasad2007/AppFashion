import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import BeautifulBackButton from './BeautifulBackButton';

interface ScreenWrapperProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  scrollable?: boolean;
  padding?: boolean;
  backgroundColor?: string;
  headerComponent?: React.ReactNode;
  backButtonVariant?: 'gradient' | 'glass' | 'solid';
  style?: any;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  showBackButton = true,
  onBackPress,
  scrollable = false,
  padding = true,
  backgroundColor = theme.colors.neutral[50],
  headerComponent,
  backButtonVariant = 'glass',
  style,
}) => {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  const contentStyle = [
    styles.content,
    padding && styles.withPadding,
    { paddingTop: statusBarHeight + (showBackButton || headerComponent ? 70 : 20) },
  ];

  const Content = () => (
    <View style={contentStyle}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      
      {/* Header Area */}
      {(showBackButton || headerComponent) && (
        <View style={[styles.header, { paddingTop: statusBarHeight }]}>
          {showBackButton && (
            <BeautifulBackButton
              onPress={onBackPress}
              variant={backButtonVariant}
              style={styles.backButton}
            />
          )}
          {headerComponent}
        </View>
      )}

      {/* Content Area */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          <Content />
        </ScrollView>
      ) : (
        <Content />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    minHeight: 60,
  },
  backButton: {
    marginRight: theme.spacing[3],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: '100%',
  },
  withPadding: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[6],
  },
});

export default ScreenWrapper;