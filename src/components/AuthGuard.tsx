import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import ScreenWrapper from './ScreenWrapper';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

const { width } = Dimensions.get('window');

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  redirectTo?: string;
  showLoginPrompt?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallbackMessage = 'Please log in to access this feature',
  redirectTo = 'Login',
  showLoginPrompt = true,
}) => {
  const { state } = useAuth();
  const navigation = useNavigation<any>();

  // Show loading state while checking authentication
  if (state.isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // If user is authenticated, render the protected content
  if (state.isAuthenticated && state.user) {
    return <>{children}</>;
  }

  // If user is not authenticated, show login prompt
  return (
    <ScreenWrapper scrollable={true}>
      <View style={styles.container}>
        <GlassCard style={styles.promptCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.lockIcon}>🔐</Text>
          </View>

          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.message}>{fallbackMessage}</Text>

          {showLoginPrompt && (
            <View style={styles.buttonContainer}>
              <GradientButton
                title="Sign In"
                onPress={() => navigation.navigate(redirectTo)}
                style={styles.loginButton}
              />

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.registerHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backText}>← Go Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you'll get with an account:</Text>
          <View style={styles.featuresList}>
            <FeatureItem icon="🛒" text="Save items to your cart" />
            <FeatureItem icon="❤️" text="Create your wishlist" />
            <FeatureItem icon="📦" text="Track your orders" />
            <FeatureItem icon="🎯" text="Personalized recommendations" />
            <FeatureItem icon="💳" text="Secure checkout" />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
    marginBottom: 20,
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  promptCard: {
    width: width - 40,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    marginBottom: 20,
  },
  registerLink: {
    marginBottom: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  registerHighlight: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
  },
  backText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  featuresContainer: {
    width: width - 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 25,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
});

export default AuthGuard;