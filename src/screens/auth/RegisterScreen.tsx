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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import AnimatedCard from '../../components/AnimatedCard';
import GradientButton from '../../components/GradientButton';
import OAuthButton from '../../components/OAuth/OAuthButton';
import EnhancedHeader from '../../components/EnhancedHeader';
import GlassCard from '../../components/GlassCard';
import GlassInput from '../../components/GlassInput';
import FloatingElements from '../../components/FloatingElements';
import LinearGradient from 'react-native-linear-gradient';

const RegisterScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, register, oauthLogin, clearError } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

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

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      errors.agreeToTerms = 'Please agree to the Terms and Conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    // Clear previous errors
    clearError();
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        phone: phone.trim() || undefined,
        acceptTerms: agreeToTerms,
      });

      if (response.success) {
        // Success is handled by the useEffect above
        Alert.alert(
          'Account Created! 🎉',
          'Your account has been created successfully. Welcome to AppFashion!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Registration Failed', response.message || 'Unable to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Error',
        error.message || 'Unable to connect to server. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      clearError();
      const response = await oauthLogin(provider);

      if (response.success) {
        // Success is handled by the useEffect above
        console.log(`${provider} registration/login successful`);
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
        colors={theme.glassGradients.rose}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={12} />

      <EnhancedHeader
        title="✨ Create Account"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Welcome Section */}
        <AnimatedCard delay={100}>
          <GlassCard style={styles.welcomeSection} gradientColors={theme.glassGradients.aurora}>
            <Text style={styles.welcomeTitle}>🎉 Join Samar Silk Palace</Text>
            <Text style={styles.welcomeSubtitle}>
              Start your beautiful fashion journey with us
            </Text>
          </GlassCard>
        </AnimatedCard>

        {/* Registration Form */}
        <AnimatedCard delay={200}>
          <GlassCard style={styles.formSection} gradientColors={theme.glassGradients.sunset}>
            <View style={styles.nameContainer}>
              <View style={styles.nameInput}>
                <Text style={styles.inputLabel}>👤 First Name</Text>
                <GlassCard
                  style={[styles.inputWrapper, !!validationErrors.firstName && styles.inputError]}
                  variant="light">
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (validationErrors.firstName) {
                        setValidationErrors(prev => ({ ...prev, firstName: '' }));
                      }
                    }}
                    autoCapitalize="words"
                    editable={!isSubmitting && !state.isLoading}
                  />
                </GlassCard>
                {validationErrors.firstName && (
                  <Text style={styles.validationError}>{validationErrors.firstName}</Text>
                )}
              </View>
              <View style={styles.nameInput}>
                <Text style={styles.inputLabel}>👤 Last Name</Text>
                <GlassCard
                  style={[styles.inputWrapper, !!validationErrors.lastName && styles.inputError]}
                  variant="light">
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (validationErrors.lastName) {
                        setValidationErrors(prev => ({ ...prev, lastName: '' }));
                      }
                    }}
                    autoCapitalize="words"
                    editable={!isSubmitting && !state.isLoading}
                  />
                </GlassCard>
                {validationErrors.lastName && (
                  <Text style={styles.validationError}>{validationErrors.lastName}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📧 Email Address</Text>
              <GlassCard
                style={[styles.inputWrapper, !!validationErrors.email && styles.inputError]}
                variant="light">
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
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
              <Text style={styles.inputLabel}>📱 Phone (Optional)</Text>
              <GlassCard style={styles.inputWrapper} variant="light">
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isSubmitting && !state.isLoading}
                />
              </GlassCard>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Password</Text>
              <GlassCard
                style={[styles.passwordContainer, !!validationErrors.password && styles.inputError]}
                variant="light">
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
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
                  <GlassCard style={styles.eyeIcon} variant="light">
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '🙈'}</Text>
                  </GlassCard>
                </TouchableOpacity>
              </GlassCard>
              {validationErrors.password && (
                <Text style={styles.validationError}>{validationErrors.password}</Text>
              )}
              <Text style={styles.passwordHint}>
                Password must be at least 6 characters long
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Confirm Password</Text>
              <GlassCard
                style={[styles.passwordContainer, !!validationErrors.confirmPassword && styles.inputError]}
                variant="light">
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (validationErrors.confirmPassword) {
                      setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting && !state.isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting || state.isLoading}>
                  <GlassCard style={styles.eyeIcon} variant="light">
                    <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
                  </GlassCard>
                </TouchableOpacity>
              </GlassCard>
              {validationErrors.confirmPassword && (
                <Text style={styles.validationError}>{validationErrors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  setAgreeToTerms(!agreeToTerms);
                  if (validationErrors.agreeToTerms) {
                    setValidationErrors(prev => ({ ...prev, agreeToTerms: '' }));
                  }
                }}
                disabled={isSubmitting || state.isLoading}>
                <Text style={styles.checkboxIcon}>
                  {agreeToTerms ? '☑️' : '☐'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms and Conditions</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
            {validationErrors.agreeToTerms && (
              <Text style={styles.validationError}>{validationErrors.agreeToTerms}</Text>
            )}

            {/* Show global error */}
            {state.error && (
              <GlassCard style={styles.errorContainer} variant="light">
                <Text style={styles.errorText}>⚠️ {state.error}</Text>
              </GlassCard>
            )}

            <GradientButton
              title={isSubmitting || state.isLoading ? 'Creating Account...' : '🚀 Create Account'}
              onPress={handleRegister}
              gradient={theme.colors.gradients.primary}
              size="large"
              style={styles.registerButton}
              disabled={isSubmitting || state.isLoading}
            />

            {(isSubmitting || state.isLoading) && (
              <GlassCard style={styles.loadingContainer} variant="light">
                <ActivityIndicator size="small" color={theme.colors.white} />
                <Text style={styles.loadingText}>Registering...</Text>
              </GlassCard>
            )}
          </GlassCard>
        </AnimatedCard>

        {/* Social Registration */}
        <AnimatedCard delay={400}>
          <GlassCard style={styles.socialSection} gradientColors={theme.glassGradients.emerald}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <OAuthButton
                provider="google"
                onSuccess={() => navigation.navigate('MainTabs')}
                onError={(error) => console.error('Google OAuth Error:', error)}
                disabled={isSubmitting || state.isLoading}
                style={styles.socialButton}
              />

              <OAuthButton
                provider="facebook"
                onSuccess={() => navigation.navigate('MainTabs')}
                onError={(error) => console.error('Facebook OAuth Error:', error)}
                disabled={isSubmitting || state.isLoading}
                style={styles.socialButton}
              />

              <OAuthButton
                provider="apple"
                onSuccess={() => navigation.navigate('MainTabs')}
                onError={(error) => console.error('Apple OAuth Error:', error)}
                disabled={true}
                style={styles.socialButton}
              />
            </View>
          </GlassCard>
        </AnimatedCard>

        {/* Sign In Link */}
        <AnimatedCard delay={500}>
          <GlassCard style={styles.signinSection} variant="light">
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signinLink}>🔐 Sign In</Text>
            </TouchableOpacity>
          </GlassCard>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  welcomeSection: {
    padding: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    padding: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  nameInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  validationError: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  eyeIcon: {
    fontSize: 20,
  },
  eyeIconText: {
    fontSize: 20,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  checkboxIcon: {
    fontSize: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#ff6b6b',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  socialSection: {
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
    textShadowOffset: { width: 0, height: 1 },
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
  socialIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#333',
  },
  signinSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
  signinText: {
    fontSize: 16,
    color: '#666',
  },
  signinLink: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;