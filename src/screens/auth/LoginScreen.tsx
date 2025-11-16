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
      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <AnimatedCard style={styles.welcomeCard} elevation="xl">
          <LinearGradient
            colors={theme.colors.gradients.ocean}
            style={styles.welcomeGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Text style={styles.welcomeEmoji}>👋</Text>
            <Text style={styles.welcomeTitle}>Hello Again!</Text>
            <Text style={styles.welcomeSubtitle}>
              Ready to discover amazing fashion deals?
            </Text>
          </LinearGradient>
        </AnimatedCard>

        {/* Login Form */}
        <AnimatedCard style={styles.formCard} elevation="lg" animationType="slide" delay={300}>
          <Text style={styles.formTitle}>Sign In to Your Account</Text>
          
          {/* Show global error */}
          {state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {state.error}</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📧 Email Address</Text>
            <View style={[styles.inputWrapper, validationErrors.email && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.neutral[400]}
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
            </View>
            {validationErrors.email && (
              <Text style={styles.validationError}>{validationErrors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Password</Text>
            <View style={[styles.passwordContainer, validationErrors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.neutral[400]}
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
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
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
            title={isSubmitting || state.isLoading ? "Signing In..." : "Sign In to AppFashion"}
            onPress={handleLogin}
            gradient={theme.colors.gradients.primary}
            size="large"
            style={styles.loginButton}
            disabled={isSubmitting || state.isLoading}
          />

          {(isSubmitting || state.isLoading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              <Text style={styles.loadingText}>Authenticating...</Text>
            </View>
          )}
        </AnimatedCard>

        {/* Social Login */}
        <AnimatedCard style={styles.socialCard} elevation="md" animationType="fade" delay={600}>
          <Text style={styles.orText}>✨ or continue with ✨</Text>
          
          <View style={styles.socialButtons}>
            <OAuthButton 
              provider="google" 
              onSuccess={() => navigation.navigate('Home' as never)}
              onError={(error) => console.error('Google OAuth Error:', error)}
              disabled={isSubmitting || state.isLoading}
            />

            <OAuthButton 
              provider="facebook" 
              onSuccess={() => navigation.navigate('Home' as never)}
              onError={(error) => console.error('Facebook OAuth Error:', error)}
              disabled={isSubmitting || state.isLoading}
            />

            <OAuthButton 
              provider="apple" 
              onSuccess={() => navigation.navigate('Home' as never)}
              onError={(error) => console.error('Apple OAuth Error:', error)}
              disabled={true}
            />
          </View>
        </AnimatedCard>

        {/* Sign Up Link */}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>New to AppFashion? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Shopping */}
        <AnimatedCard style={styles.guestCard} elevation="sm" animationType="fade" delay={900}>
          <GradientButton
            title="Continue as Guest 👤"
            onPress={() => navigation.navigate('MainTabs')}
            variant="outlined"
            size="large"
            style={styles.guestButton}
          />
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
    margin: theme.spacing[5],
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  orText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing[5],
    fontWeight: theme.typography.fontWeight.medium,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: theme.spacing[3],
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    ...theme.shadows.sm,
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