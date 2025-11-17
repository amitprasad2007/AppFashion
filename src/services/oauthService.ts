// OAuth Service for React Native
// This service handles social authentication (Google, Facebook, Apple)
import { Linking, Alert } from 'react-native';
import { apiService } from './api';

export type OAuthProvider = 'google' | 'facebook' | 'apple';

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  provider: OAuthProvider;
}

/**
 * OAuth Service for handling social authentication
 * 
 * For React Native, we'll use a web-based OAuth flow that redirects to the backend
 * and then handles the callback via deep linking.
 */
class OAuthService {
  /**
   * Initiate OAuth login with the specified provider
   * This opens the backend OAuth endpoint which redirects to the provider
   */
  async startOAuthLogin(provider: OAuthProvider): Promise<void> {
    try {
      const redirectUrl = apiService.getOAuthRedirectUrl(provider);
      
      // For React Native, we'll use deep linking
      // The backend should redirect to: appfashion://oauth/callback?provider=google&token=xxx
      const canOpen = await Linking.canOpenURL(redirectUrl);
      
      if (canOpen) {
        await Linking.openURL(redirectUrl);
      } else {
        Alert.alert(
          'Unable to Open',
          `Cannot open ${provider} login. Please check your internet connection.`
        );
      }
    } catch (error) {
      console.error(`Error starting ${provider} OAuth:`, error);
      Alert.alert(
        'Login Error',
        `Unable to start ${provider} login. Please try again.`
      );
      throw error;
    }
  }

  /**
   * Handle OAuth callback from deep link
   * This is called when the app receives a deep link after OAuth completion
   */
  async handleOAuthCallback(url: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Parse the callback URL
      // Expected format: appfashion://oauth/callback?provider=google&token=xxx&error=xxx
      const parsedUrl = new URL(url);
      const params = new URLSearchParams(parsedUrl.search);
      
      const provider = params.get('provider') as OAuthProvider | null;
      const token = params.get('token');
      const error = params.get('error');
      const code = params.get('code');
      
      if (error) {
        return {
          success: false,
          error: error || 'OAuth authentication failed',
        };
      }
      
      if (!provider) {
        return {
          success: false,
          error: 'Missing provider information',
        };
      }
      
      // If token is directly provided (backend already processed OAuth)
      if (token) {
        return {
          success: true,
          token,
        };
      }
      
      // If code is provided, exchange it with backend
      if (code) {
        const paramsObj: { [key: string]: string } = {};
        params.forEach((value, key) => {
          paramsObj[key] = value;
        });
        
        const response = await apiService.handleOAuthCallback(provider, paramsObj);
        
        if (response.success && response.token) {
          return {
            success: true,
            token: response.token,
          };
        }
        
        return {
          success: false,
          error: response.message || 'OAuth authentication failed',
        };
      }
      
      return {
        success: false,
        error: 'Invalid OAuth callback',
      };
    } catch (error: any) {
      console.error('Error handling OAuth callback:', error);
      return {
        success: false,
        error: error.message || 'Failed to process OAuth callback',
      };
    }
  }

  /**
   * Alternative method: Direct OAuth login using native SDKs
   * This requires installing native OAuth packages
   * 
   * For Google: @react-native-google-signin/google-signin
   * For Facebook: react-native-fbsdk-next
   * For Apple: @invertase/react-native-apple-authentication
   */
  async nativeOAuthLogin(provider: OAuthProvider): Promise<OAuthUserInfo | null> {
    try {
      switch (provider) {
        case 'google':
          return await this.googleSignIn();
        case 'facebook':
          return await this.facebookSignIn();
        case 'apple':
          throw new Error('Apple Sign-In is currently not available on this platform.');
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error in native ${provider} login:`, error);
      throw error;
    }
  }

  /**
   * Google Sign-In using native SDK
   * Requires: @react-native-google-signin/google-signin
   */
  private async googleSignIn(): Promise<OAuthUserInfo | null> {
    try {
      // Dynamic import to avoid errors if package is not installed
      const GoogleSigninModule = require('@react-native-google-signin/google-signin');
      const GoogleSignin = GoogleSigninModule.GoogleSignin || GoogleSigninModule.default;
      const statusCodes = GoogleSigninModule.statusCodes;
      
      console.log('🔐 Starting Google Sign-In process...');
      console.log('📦 GoogleSignin object:', GoogleSignin);
      console.log('📦 Available methods:', Object.keys(GoogleSignin || {}));
      
      // Check if GoogleSignin is properly loaded
      if (!GoogleSignin || typeof GoogleSignin.hasPlayServices !== 'function') {
        throw new Error('Google Sign-In SDK not properly initialized. Please check your installation and linking.');
      }
      
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      console.log('✅ Google Play Services available');
      
      // Check if already signed in (only if method exists)
      if (typeof GoogleSignin.isSignedIn === 'function') {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn && typeof GoogleSignin.signOut === 'function') {
          console.log('🔄 Signing out existing user for fresh login');
          await GoogleSignin.signOut();
        }
      } else {
        console.warn('⚠️ isSignedIn method not available, proceeding without logout check');
      }
      
      // Perform sign-in
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful:', userInfo);
      
      // Handle different response structures
      const user = userInfo.user || userInfo.data?.user;
      
      if (user) {
        return {
          id: user.id || '',
          email: user.email || '',
          name: user.name || '',
          firstName: user.givenName || '',
          lastName: user.familyName || '',
          photo: user.photo || undefined,
          provider: 'google',
        };
      }
      
      console.warn('⚠️ No user data in Google Sign-In response');
      return null;
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      
      // Handle specific error codes
      try {
        const { statusCodes } = require('@react-native-google-signin/google-signin');
        
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled Google Sign-In');
            return null;
          case statusCodes.IN_PROGRESS:
            console.log('Google Sign-In already in progress');
            return null;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            throw new Error('Google Play Services not available. Please update Google Play Services.');
          default:
            break;
        }
      } catch (importError) {
        // statusCodes not available, continue with generic handling
      }
      
      // Handle configuration and method errors
      if (error.message && error.message.includes('apiClient is null')) {
        throw new Error('Google Sign-In not configured properly. Please check your setup and ensure GoogleSignin.configure() was called.');
      }
      
      if (error.message && error.message.includes('configure')) {
        throw new Error('Google Sign-In configuration error. Please check your webClientId.');
      }
      
      if (error.message && error.message.includes('not a function')) {
        throw new Error('Google Sign-In SDK not properly linked. This usually requires a clean rebuild of the project.');
      }
      
      if (error.message && error.message.includes('not properly initialized')) {
        throw new Error('Google Sign-In package installation issue. Try running: cd android && ./gradlew clean && cd .. && npx react-native run-android');
      }
      
      throw error;
    }
  }

  /**
   * Facebook Sign-In using native SDK
   * Requires: react-native-fbsdk-next
   */
  private async facebookSignIn(): Promise<OAuthUserInfo | null> {
    try {
      // Dynamic import to avoid errors if package is not installed
      const { LoginManager, GraphRequest, GraphRequestManager } = require('react-native-fbsdk-next');
      
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        console.log('User cancelled Facebook login');
        return null;
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Get user info
      return new Promise((resolve, reject) => {
        const infoRequest = new GraphRequest(
          '/me',
          {
            parameters: {
              fields: {
                string: 'id,name,email,first_name,last_name,picture.type(large)',
              },
            },
          },
          (error: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                id: result?.id || '',
                email: result?.email || '',
                name: result?.name || '',
                firstName: result?.first_name || '',
                lastName: result?.last_name || '',
                photo: result?.picture?.data?.url || undefined,
                provider: 'facebook',
              });
            }
          }
        );
        new GraphRequestManager().addRequest(infoRequest).start();
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Apple Sign-In - Currently disabled
   * Apple Sign-In requires iOS 13+ and proper configuration
   */
  private async appleSignIn(): Promise<OAuthUserInfo | null> {
    throw new Error('Apple Sign-In is currently not available. This feature requires iOS 13+ and proper setup.');
  }
}

export const oauthService = new OAuthService();
export default oauthService;

