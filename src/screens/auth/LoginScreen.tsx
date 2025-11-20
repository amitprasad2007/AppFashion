import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/navigation';
import { theme } from '../../theme';
import AnimatedCard from '../../components/AnimatedCard';
import GradientButton from '../../components/GradientButton';
import OAuthButton from '../../components/OAuth/OAuthButton';
import EnhancedHeader from '../../components/EnhancedHeader';
import GlassCard from '../../components/GlassCard';
import GlassInput from '../../components/GlassInput';
import FloatingElements from '../../components/FloatingElements';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, login, forgotPassword, clearError, oauthLogin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Navigate to main app when successfully authenticated
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      navigation.navigate('MainTabs');
    }
  }, [state.isAuthenticated, state.isLoading]);

  // Validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    // Clear previous errors
    clearError();
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      Keyboard.dismiss();

      const response = await login({ email: email.trim(), password });
      
      if (response.success) {
        // Success is handled by the useEffect above
        console.log('Login successful');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Error',
        error.message || 'Unable to connect to server. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Enter Email', 'Please enter your email address first.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      const response = await forgotPassword(email.trim());
      
      if (response.success) {
        Alert.alert(
          'Reset Email Sent! 📧',
          'Password reset instructions have been sent to your email address.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Network Error', 'Unable to send reset email. Please check your connection.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      clearError();
      const response = await oauthLogin(provider);
      
      if (response.success) {
        // Success is handled by the useEffect above
        console.log(`${provider} login successful`);
      } else {
        Alert.alert(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
          response.message || `Unable to login with ${provider}. Please try again.`
        );
      }
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      Alert.alert(
        'Login Error',
        error.message || `Unable to connect to ${provider}. Please check your internet connection and try again.`
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.ocean}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={12} />
      
      <EnhancedHeader 
        title="🔐 Welcome Back"
        showBackButton={true}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <AnimatedCard delay={100}>
          <GlassCard style={styles.welcomeCard} gradientColors={theme.glassGradients.aurora}>
            <Text style={styles.welcomeEmoji}>👋</Text>
            <Text style={styles.welcomeTitle}>Hello Again!</Text>
            <Text style={styles.welcomeSubtitle}>
              Ready to discover amazing fashion at Samar Silk Palace?
            </Text>
          </GlassCard>
        </AnimatedCard>

        {/* Login Form */}
        <AnimatedCard delay={200}>
          <GlassCard style={styles.formCard} gradientColors={theme.glassGradients.sunset}>
            <Text style={styles.formTitle}>🔑 Sign In to Your Account</Text>
            
            {/* Show global error */}
            {state.error && (
              <GlassCard style={styles.errorContainer} variant="light">
                <Text style={styles.errorText}>⚠️ {state.error}</Text>
              </GlassCard>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📧 Email Address</Text>
              <GlassCard 
                style={[styles.inputWrapper, validationErrors.email && styles.inputError]} 
                variant="light">
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    // Clear validation error when user starts typing
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({...prev, email: ''}));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting && !state.isLoading}
                />
              </GlassCard>
              {validationErrors.email && (
                <Text style={styles.validationError}>{validationErrors.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Password</Text>
              <GlassCard 
                style={[styles.passwordContainer, validationErrors.password && styles.inputError]} 
                variant="light">
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear validation error when user starts typing
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({...prev, password: ''}));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting && !state.isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || state.isLoading}>
                  <GlassCard style={styles.eyeIcon} variant="light">
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '🙈'}</Text>
                  </GlassCard>
                </TouchableOpacity>
              </GlassCard>
              {validationErrors.password && (
                <Text style={styles.validationError}>{validationErrors.password}</Text>
              )}
            </View>

          <TouchableOpacity 
            onPress={handleForgotPassword}
            disabled={isSubmitting || state.isLoading}>
            <Text style={[styles.forgotPassword, (isSubmitting || state.isLoading) && styles.disabledText]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

            <GradientButton
              title={isSubmitting || state.isLoading ? "Signing In..." : "🚀 Sign In to Samar Silk Palace"}
              onPress={handleLogin}
              gradient={theme.colors.gradients.primary}
              size="large"
              style={styles.loginButton}
              disabled={isSubmitting || state.isLoading}
            />

            {(isSubmitting || state.isLoading) && (
              <GlassCard style={styles.loadingContainer} variant="light">
                <ActivityIndicator size="small" color={theme.colors.white} />
                <Text style={styles.loadingText}>Authenticating...</Text>
              </GlassCard>
            )}
          </GlassCard>
        </AnimatedCard>

        {/* Social Login */}
        <AnimatedCard delay={400}>
          <GlassCard style={styles.socialCard} gradientColors={theme.glassGradients.emerald}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialButtons}>
              <OAuthButton 
                provider="google" 
                onSuccess={() => navigation.navigate('Home' as never)}
                onError={(error) => console.error('Google OAuth Error:', error)}
                disabled={isSubmitting || state.isLoading}
                style={styles.socialButton}
              />

              <OAuthButton 
                provider="facebook" 
                onSuccess={() => navigation.navigate('Home' as never)}
                onError={(error) => console.error('Facebook OAuth Error:', error)}
                disabled={isSubmitting || state.isLoading}
                style={styles.socialButton}
              />

              <OAuthButton 
                provider="apple" 
                onSuccess={() => navigation.navigate('Home' as never)}
                onError={(error) => console.error('Apple OAuth Error:', error)}
                disabled={true}
                style={styles.socialButton}
              />
            </View>
          </GlassCard>
        </AnimatedCard>

        {/* Sign Up Link */}
        <AnimatedCard delay={500}>
          <GlassCard style={styles.signupSection} variant="light">
            <Text style={styles.signupText}>New to Samar Silk Palace? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>✨ Create Account</Text>
            </TouchableOpacity>
          </GlassCard>
        </AnimatedCard>

        {/* Guest Shopping */}
        <AnimatedCard delay={600}>
          <GlassCard style={styles.guestCard} gradientColors={theme.glassGradients.purple}>
            <GradientButton
              title="👤 Continue as Guest"
              onPress={() => navigation.navigate('MainTabs')}
              variant="outlined"
              size="large"
              style={styles.guestButton}
            />
          </GlassCard>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
  },
  backIcon: {
    fontSize: 20,
    color: theme.colors.white,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  placeholder: {
    width: 24,
  },
  welcomeCard: {
    margin: theme.spacing[5],
    marginTop: -theme.spacing[8],
    overflow: 'hidden',
  },
  welcomeGradient: {
    padding: theme.spacing[8],
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing[4],
  },
  welcomeTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.white,
    marginBottom: theme.spacing[2],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
  },
  formCard: {
    margin: theme.spacing[5],
    padding: theme.spacing[6],
  },
  formTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing[6],
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing[5],
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing[2],
  },
  inputWrapper: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  input: {
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[800],
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  passwordInput: {
    flex: 1,
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[800],
  },
  eyeButton: {
    padding: theme.spacing[4],
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPassword: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    textAlign: 'right',
    marginBottom: theme.spacing[6],
    fontWeight: theme.typography.fontWeight.medium,
  },
  loginButton: {
    marginTop: theme.spacing[2],
  },
  // Error and validation styles
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#c62828',
    fontWeight: theme.typography.fontWeight.medium,
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  validationError: {
    fontSize: theme.typography.fontSize.xs,
    color: '#f44336',
    marginTop: theme.spacing[1],
    fontWeight: theme.typography.fontWeight.medium,
  },
  disabledText: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: theme.borderRadius.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginLeft: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.medium,
  },
  socialCard: {
    marginHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[5],
    overflow: 'hidden',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[2],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.white,
    marginHorizontal: theme.spacing[4],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  socialButtons: {
    gap: theme.spacing[3],
  },
  socialButton: {
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  socialGradient: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  socialIcon: {
    fontSize: 20,
  },
  socialText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    marginTop: theme.spacing[4],
  },
  signupText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
  },
  signupLink: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.bold,
  },
  guestCard: {
    margin: theme.spacing[5],
    padding: theme.spacing[4],
  },
  guestButton: {
    marginTop: theme.spacing[2],
  },
});

export default LoginScreen;