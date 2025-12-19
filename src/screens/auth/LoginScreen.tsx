import React, { useState, useEffect } from 'react';
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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { theme } from '../../theme';
import GradientButton from '../../components/GradientButton';
import OAuthButton from '../../components/OAuth/OAuthButton';
import EnhancedHeader from '../../components/EnhancedHeader';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, login, forgotPassword, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Navigate to main app when successfully authenticated
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      navigation.navigate('MainTabs');
    }
  }, [navigation, state.isAuthenticated, state.isLoading]);

  // Validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title="🔐 Welcome Back"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeEmoji}>👋</Text>
          <Text style={styles.welcomeTitle}>Hello Again!</Text>
          <Text style={styles.welcomeSubtitle}>
            Ready to discover amazing fashion at Samar Silk Palace?
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In to Your Account</Text>

          {/* Show global error */}
          {state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {state.error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputWrapper, !!validationErrors.email && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.neutral[400]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  // Clear validation error when user starts typing
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: '' }));
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
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.passwordContainer, !!validationErrors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.neutral[400]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  // Clear validation error when user starts typing
                  if (validationErrors.password) {
                    setValidationErrors(prev => ({ ...prev, password: '' }));
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
                <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '🙈'}</Text>
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
            title={isSubmitting || state.isLoading ? "Signing In..." : "Sign In"}
            onPress={handleLogin}
            gradient={theme.colors.gradients.primary}
            size="large"
            style={styles.loginButton}
            disabled={isSubmitting || state.isLoading}
          />

          {(isSubmitting || state.isLoading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Authenticating...</Text>
            </View>
          )}
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <OAuthButton
              provider="google"
              onSuccess={() => navigation.navigate('MainTabs' as never)}
              onError={(error) => console.error('Google OAuth Error:', error)}
              disabled={isSubmitting || state.isLoading}
              style={styles.socialButton}
            />

            <OAuthButton
              provider="facebook"
              onSuccess={() => navigation.navigate('MainTabs' as never)}
              onError={(error) => console.error('Facebook OAuth Error:', error)}
              disabled={isSubmitting || state.isLoading}
              style={styles.socialButton}
            />

          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>New to Samar Silk Palace? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Shopping */}
        <View style={styles.guestSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.guestButton}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16, // Reduced from 32
  },
  welcomeSection: {
    padding: 16, // Reduced from 24
    alignItems: 'center',
    marginBottom: 0, // Reduced from 8
  },
  welcomeEmoji: {
    fontSize: 32, // Reduced from 48
    marginBottom: 8, // Reduced from 16
  },
  welcomeTitle: {
    fontSize: 20, // Reduced from 24
    fontWeight: '800',
    color: theme.colors.neutral[900],
    marginBottom: 4, // Reduced from 8
  },
  welcomeSubtitle: {
    fontSize: 16, // Increased from 13
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
  formCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    padding: 16, // Reduced from 24
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16, // Reduced from 24
  },
  formTitle: {
    fontSize: 20, // Increased from 16
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 12, // Reduced from 16
  },
  inputLabel: {
    fontSize: 16, // Increased from 13
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  input: {
    padding: 12,
    fontSize: 16, // Increased from 14
    color: theme.colors.neutral[900],
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16, // Increased from 14
    color: theme.colors.neutral[900],
  },
  eyeButton: {
    padding: 10, // Reduced from 12
  },
  eyeIconText: {
    fontSize: 16, // Reduced from 18
  },
  forgotPassword: {
    fontSize: 15, // Increased from 13
    color: theme.colors.primary[600],
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 48, // Explicit height control
  },
  // Error and validation styles
  errorContainer: {
    backgroundColor: theme.colors.error[50],
    padding: 10, // Reduced from 12
    borderRadius: 8,
    marginBottom: 12, // Reduced from 16
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error[500],
  },
  errorText: {
    fontSize: 13, // Reduced from 14
    color: theme.colors.error[700],
    fontWeight: '500',
  },
  inputError: {
    borderColor: theme.colors.error[500],
  },
  validationError: {
    fontSize: 13, // Increased from 11
    color: theme.colors.error[600],
    marginTop: 4,
    fontWeight: '500',
  },
  disabledText: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12, // Reduced from 16
  },
  loadingText: {
    fontSize: 13, // Reduced from 14
    color: theme.colors.neutral[600],
    marginLeft: 8,
  },
  socialSection: {
    marginBottom: 16, // Reduced from 24
    paddingHorizontal: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Reduced from 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.neutral[200],
  },
  orText: {
    textAlign: 'center',
    fontSize: 14, // Increased from 12
    color: theme.colors.neutral[500],
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row', // Horizontal layout for social buttons
    justifyContent: 'center',
    gap: 16, // Spacing between horizontal buttons
  },
  socialButton: {
    flex: 1, // Share width
    marginBottom: 0,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.neutral[200],
    height: 44, // Reduced height
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16, // Reduced from 24
    marginTop: 16,
  },
  signupText: {
    fontSize: 16, // Increased from 13
    color: theme.colors.neutral[600],
  },
  signupLink: {
    fontSize: 16, // Increased from 13
    color: theme.colors.primary[600],
    fontWeight: '700',
  },
  guestSection: {
    alignItems: 'center',
    marginBottom: 16, // Reduced from 24
  },
  guestButton: {
    paddingVertical: 8, // Reduced from 12
    paddingHorizontal: 24,
  },
  guestButtonText: {
    fontSize: 16, // Increased from 13
    fontWeight: '600',
    color: theme.colors.neutral[500],
  },
});

export default LoginScreen;