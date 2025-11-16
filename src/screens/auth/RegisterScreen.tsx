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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';

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

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Create Account</Text>
        <Text style={styles.welcomeSubtitle}>
          Join AppFashion and start your shopping journey
        </Text>
      </View>

      {/* Registration Form */}
      <View style={styles.formSection}>
        <View style={styles.nameContainer}>
          <View style={styles.nameInput}>
            <Text style={styles.inputLabel}>First Name</Text>
            <View style={[styles.inputWrapper, validationErrors.firstName && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (validationErrors.firstName) {
                    setValidationErrors(prev => ({...prev, firstName: ''}));
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
            <View style={[styles.inputWrapper, validationErrors.lastName && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (validationErrors.lastName) {
                    setValidationErrors(prev => ({...prev, lastName: ''}));
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
          <View style={[styles.inputWrapper, validationErrors.email && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
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
          <Text style={styles.inputLabel}>Phone (Optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isSubmitting && !state.isLoading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.passwordContainer, validationErrors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
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
          <Text style={styles.passwordHint}>
            Password must be at least 6 characters long
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={[styles.passwordContainer, validationErrors.confirmPassword && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (validationErrors.confirmPassword) {
                  setValidationErrors(prev => ({...prev, confirmPassword: ''}));
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
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
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
                setValidationErrors(prev => ({...prev, agreeToTerms: ''}));
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
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {state.error}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.registerButton, (isSubmitting || state.isLoading) && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={isSubmitting || state.isLoading}>
          <Text style={styles.registerButtonText}>
            {isSubmitting || state.isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {(isSubmitting || state.isLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Registering...</Text>
          </View>
        )}
      </View>

      {/* Social Registration */}
      <View style={styles.socialSection}>
        <Text style={styles.orText}>or sign up with</Text>
        
        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={[styles.socialButton, (isSubmitting || state.isLoading) && styles.disabledButton]}
            onPress={() => handleSocialLogin('google')}
            disabled={isSubmitting || state.isLoading}>
            <Text style={styles.socialIcon}>📧</Text>
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, (isSubmitting || state.isLoading) && styles.disabledButton]}
            onPress={() => handleSocialLogin('facebook')}
            disabled={isSubmitting || state.isLoading}>
            <Text style={styles.socialIcon}>📘</Text>
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, (isSubmitting || state.isLoading) && styles.disabledButton]}
            onPress={() => handleSocialLogin('apple')}
            disabled={isSubmitting || state.isLoading}>
            <Text style={styles.socialIcon}>🍎</Text>
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    padding: 20,
    alignItems: 'center',
  },
  orText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
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