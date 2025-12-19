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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import GradientButton from '../../components/GradientButton';
import OAuthButton from '../../components/OAuth/OAuthButton';
import EnhancedHeader from '../../components/EnhancedHeader';

const RegisterScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, register, clearError } = useAuth();

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
  }, [clearError]);

  // Navigate to main app when successfully authenticated
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      navigation.navigate('MainTabs');
    }
  }, [navigation, state.isAuthenticated, state.isLoading]);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
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
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Join Samar Silk Palace</Text>
          <Text style={styles.welcomeSubtitle}>
            Start your beautiful fashion journey with us
          </Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formSection}>
          <View style={styles.nameContainer}>
            <View style={styles.nameInput}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={[styles.inputWrapper, !!validationErrors.firstName && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor={theme.colors.neutral[400]}
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
              </View>
              {validationErrors.firstName && (
                <Text style={styles.validationError}>{validationErrors.firstName}</Text>
              )}
            </View>
            <View style={styles.nameInput}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={[styles.inputWrapper, !!validationErrors.lastName && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor={theme.colors.neutral[400]}
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
              </View>
              {validationErrors.lastName && (
                <Text style={styles.validationError}>{validationErrors.lastName}</Text>
              )}
            </View>
          </View>

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
            <Text style={styles.inputLabel}>Phone (Optional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.neutral[400]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isSubmitting && !state.isLoading}
              />
            </View>
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
            <Text style={styles.passwordHint}>
              Password must be at least 6 characters long
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[styles.passwordContainer, !!validationErrors.confirmPassword && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor={theme.colors.neutral[400]}
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
                <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={[styles.checkboxIcon, agreeToTerms && styles.checkboxIconActive]}>
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
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {state.error}</Text>
            </View>
          )}

          <GradientButton
            title={isSubmitting || state.isLoading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            gradient={theme.colors.gradients.primary}
            size="large"
            style={styles.registerButton}
            disabled={isSubmitting || state.isLoading}
          />

          {(isSubmitting || state.isLoading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Registering...</Text>
            </View>
          )}
        </View>

        {/* Social Registration */}
        <View style={styles.socialSection}>
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


          </View>
        </View>

        {/* Sign In Link */}
        <View style={styles.signinSection}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signinLink}>Sign In</Text>
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
    paddingBottom: 32,
  },
  welcomeSection: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.neutral[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
  formSection: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
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
    fontSize: 16,
    color: theme.colors.neutral[900],
  },
  inputError: {
    borderColor: theme.colors.error[500],
  },
  validationError: {
    fontSize: 13,
    color: theme.colors.error[600],
    marginTop: 4,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: theme.colors.error[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error[500],
  },
  errorText: {
    fontSize: 15,
    color: theme.colors.error[700],
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 15,
    color: theme.colors.neutral[600],
    marginLeft: 8,
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
    fontSize: 16,
    color: theme.colors.neutral[900],
  },
  eyeButton: {
    padding: 12,
  },
  eyeIconText: {
    fontSize: 18,
  },
  passwordHint: {
    fontSize: 13,
    color: theme.colors.neutral[500],
    marginTop: 6,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  checkboxIcon: {
    fontSize: 20,
    color: theme.colors.neutral[400],
  },
  checkboxIconActive: {
    color: theme.colors.primary[600],
  },
  termsText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.neutral[600],
    lineHeight: 22,
  },
  termsLink: {
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  registerButton: {
    width: '100%',
  },
  socialSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.neutral[200],
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
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
  signinSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signinText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
  },
  signinLink: {
    fontSize: 16,
    color: theme.colors.primary[600],
    fontWeight: '700',
  },
});

export default RegisterScreen;