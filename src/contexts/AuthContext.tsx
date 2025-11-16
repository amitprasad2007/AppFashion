import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';
import { apiService, AuthUser, LoginCredentials, RegisterCredentials, AuthResponse } from '../services/api';
import { oauthService, OAuthUserInfo } from '../services/oauthService';

// Auth State Types
interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; token: string; refreshToken?: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: AuthUser }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_TOKEN'; payload: string };

// Auth Context Interface
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<AuthResponse>;
  clearError: () => void;
  restoreSession: () => Promise<void>;
  // OAuth methods
  oauthLogin: (provider: 'google' | 'facebook' | 'apple') => Promise<AuthResponse>;
  handleOAuthCallback: (url: string) => Promise<{ success: boolean; error?: string }>;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        isLoading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    
    default:
      return state;
  }
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER: '@user_data',
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Save auth data to storage
  const saveAuthData = async (token: string, user: AuthUser, refreshToken?: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        refreshToken ? AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  // Clear auth data from storage
  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Restore session from storage
  const restoreSession = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      const [token, userData, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Set token in API service
        apiService.setAuthToken(token);
        
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await apiService.getCurrentUser();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: currentUser, token, refreshToken: refreshToken || undefined },
          });
        } catch (error) {
          // Token might be expired, try refresh if available
          if (refreshToken) {
            try {
              const refreshResponse = await apiService.refreshToken(refreshToken);
              if (refreshResponse.success && refreshResponse.user && refreshResponse.token) {
                await saveAuthData(refreshResponse.token, refreshResponse.user, refreshResponse.refreshToken);
                dispatch({
                  type: 'LOGIN_SUCCESS',
                  payload: {
                    user: refreshResponse.user,
                    token: refreshResponse.token,
                    refreshToken: refreshResponse.refreshToken,
                  },
                });
              } else {
                throw new Error('Token refresh failed');
              }
            } catch (refreshError) {
              // Both token and refresh failed, clear session
              await clearAuthData();
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            // No refresh token, clear session
            await clearAuthData();
            dispatch({ type: 'LOGOUT' });
          }
        }
      } else {
        dispatch({ type: 'LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      await clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiService.login(credentials);
      
      if (response.success && response.user && response.token) {
        await saveAuthData(response.token, response.user, response.refreshToken);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
          },
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message || 'Login failed',
        });
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiService.register(credentials);
      
      if (response.success && response.user && response.token) {
        await saveAuthData(response.token, response.user, response.refreshToken);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
          },
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message || 'Registration failed',
        });
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call API logout
      await apiService.logout();
    } catch (error) {
      console.error('Error during API logout:', error);
      // Continue with local logout even if API call fails
    } finally {
      await clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      return await apiService.forgotPassword({ email });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset email';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<AuthUser>): Promise<AuthResponse> => {
    try {
      const response = await apiService.updateProfile(userData);
      
      if (response.success && response.user) {
        dispatch({ type: 'UPDATE_USER', payload: response.user });
        // Update stored user data
        if (state.token) {
          await saveAuthData(state.token, response.user, state.refreshToken || undefined);
        }
      }
      
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // OAuth Login function
  const oauthLogin = async (provider: 'google' | 'facebook' | 'apple'): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log(`🚀 Starting ${provider} OAuth login...`);

      // Try native OAuth first (if SDKs are installed)
      let userInfo: OAuthUserInfo | null = null;
      
      try {
        userInfo = await oauthService.nativeOAuthLogin(provider);
        console.log(`✅ Native ${provider} OAuth successful:`, userInfo);
      } catch (nativeError: any) {
        console.warn(`⚠️ Native ${provider} OAuth failed:`, nativeError.message);
        
        // Special handling for Apple Sign-In when not available
        if (provider === 'apple' && nativeError.message?.includes('not available')) {
          dispatch({
            type: 'LOGIN_FAILURE',
            payload: 'Apple Sign-In is only available on iOS devices with iOS 13+ or when properly configured.',
          });
          return {
            success: false,
            message: 'Apple Sign-In is only available on iOS devices with iOS 13+ or when properly configured.',
          };
        }
        
        // For other providers, try web-based OAuth
        console.log(`🌐 Falling back to web-based ${provider} OAuth...`);
        try {
          await oauthService.startOAuthLogin(provider);
          dispatch({ type: 'LOADING', payload: false });
          return {
            success: true,
            message: `Redirecting to ${provider} login...`,
          };
        } catch (webError) {
          console.error(`❌ Web-based ${provider} OAuth also failed:`, webError);
          throw new Error(`${provider} authentication not available. Please check your setup.`);
        }
      }

      // If user cancelled, return early
      if (!userInfo) {
        dispatch({ type: 'LOADING', payload: false });
        return {
          success: false,
          message: 'Login cancelled',
        };
      }

      // Send OAuth user info to backend
      console.log(`📤 Sending ${provider} user info to backend...`);
      const response = await apiService.oauthLogin(provider, userInfo.id, {
        email: userInfo.email,
        name: userInfo.name,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        photo: userInfo.photo,
      });
      
      console.log(`📥 Backend ${provider} OAuth response:`, response);

      if (response.success && response.user && response.token) {
        await saveAuthData(response.token, response.user, response.refreshToken);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
          },
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message || `${provider} login failed`,
        });
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || `Failed to login with ${provider}`;
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Handle OAuth callback from deep link
  const handleOAuthCallback = async (url: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await oauthService.handleOAuthCallback(url);

      if (result.success && result.token) {
        // Token received, verify and get user info
        apiService.setAuthToken(result.token);
        
        try {
          const currentUser = await apiService.getCurrentUser();
          await saveAuthData(result.token, currentUser);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: currentUser,
              token: result.token,
            },
          });
          return { success: true };
        } catch (error) {
          // Token might be invalid
          dispatch({
            type: 'LOGIN_FAILURE',
            payload: 'Failed to verify authentication token',
          });
          return { success: false, error: 'Failed to verify authentication token' };
        }
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: result.error || 'OAuth authentication failed',
        });
        return { success: false, error: result.error || 'OAuth authentication failed' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process OAuth callback';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  // Set up deep linking listener for OAuth callbacks
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.startsWith('appfashion://oauth/callback')) {
        handleOAuthCallback(event.url);
      }
    };

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('appfashion://oauth/callback')) {
        handleOAuthCallback(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // Restore session on app start
  useEffect(() => {
    restoreSession();
  }, []);

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    clearError,
    restoreSession,
    oauthLogin,
    handleOAuthCallback,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;