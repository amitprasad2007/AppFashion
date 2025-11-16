import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

interface OAuthButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  style?: any;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  onSuccess,
  onError,
  disabled = false,
  style,
}) => {
  const { oauthLogin, state } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const providerConfig = {
    google: {
      name: 'Google',
      emoji: '📧',
      colors: ['#db4437', '#cc3928'],
      testId: 'google-signin-button',
    },
    facebook: {
      name: 'Facebook',
      emoji: '📘',
      colors: ['#3b5998', '#2d4373'],
      testId: 'facebook-signin-button',
    },
    apple: {
      name: 'Apple',
      emoji: '🍎',
      colors: ['#000000', '#333333'],
      testId: 'apple-signin-button',
    },
  };

  const config = providerConfig[provider];
  const isDisabled = disabled || isLoading || state.isLoading;

  const handleOAuth = async () => {
    if (isDisabled) return;

    try {
      setIsLoading(true);
      console.log(`🔄 Starting ${config.name} OAuth...`);

      const result = await oauthLogin(provider);
      
      if (result.success) {
        console.log(`✅ ${config.name} OAuth completed successfully`);
        Alert.alert(
          'Success!',
          `${config.name} login successful!`,
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        console.warn(`⚠️ ${config.name} OAuth failed:`, result.message);
        const errorMessage = result.message || `${config.name} login failed`;
        Alert.alert('Login Failed', errorMessage);
        onError?.(errorMessage);
      }
    } catch (error: any) {
      console.error(`❌ ${config.name} OAuth error:`, error);
      const errorMessage = error.message || `${config.name} login failed`;
      
      // Show user-friendly error messages
      let userMessage = errorMessage;
      if (errorMessage.includes('not properly linked')) {
        userMessage = `${config.name} Sign-In is not properly configured. Please contact support.`;
      } else if (errorMessage.includes('not configured')) {
        userMessage = `${config.name} Sign-In setup incomplete. Please try again later.`;
      } else if (errorMessage.includes('not available')) {
        userMessage = provider === 'apple' 
          ? 'Apple Sign-In is only available on iOS 13+' 
          : `${config.name} Sign-In is not available on this device.`;
      }
      
      Alert.alert('Login Error', userMessage);
      onError?.(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      testID={config.testId}
      style={[
        {
          marginBottom: 12,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={handleOAuth}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isDisabled ? ['#999999', '#666666'] : config.colors}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 25,
          minHeight: 50,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={{ fontSize: 20, marginRight: 8 }}>{config.emoji}</Text>
        )}
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: isLoading ? 8 : 0,
          }}
        >
          {isLoading
            ? `Signing in with ${config.name}...`
            : `Continue with ${config.name}`}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default OAuthButton;