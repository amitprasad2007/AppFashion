/**
 * AppFashion - Complete Ecommerce Mobile Application
 * React Native App with Navigation and Multiple Screens
 * 
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProfileProvider } from './src/contexts/UserProfileContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import razorpayService from './src/services/razorpayService';
import { PAYMENT_CONFIG } from './src/config/payment';

// Ignore specific warnings for development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Require cycle:',
]);

function App(): React.JSX.Element {
  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '1095073031134-jdhgh4uf3lnpgr6p3gm3u0ld9f4rnl1b.apps.googleusercontent.com', // Your Google Web Client ID
      offlineAccess: true, // If you want to access Google API on behalf of the user FROM YOUR SERVER
      hostedDomain: '', // Restrict to a particular domain
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`
      accountName: '', // [Android] specifies an account name on the device
      iosClientId: '', // [iOS] optional, if you want to specify the client ID of type iOS
      googleServicePlistPath: '', // [iOS] optional, if you renamed your GoogleService-Info.plist

      profileImageSize: 120, // [iOS] The desired height (and width) of the profile image
    });

    console.log('🔧 Google Sign-In configured successfully');

    // Configure Razorpay (publishable key only). Backend may still return key per order.
    if (PAYMENT_CONFIG.RAZORPAY_KEY_ID) {
      razorpayService.initialize({
        key_id: PAYMENT_CONFIG.RAZORPAY_KEY_ID,
      });
      console.log('🔧 Razorpay configured successfully');
    } else {
      console.warn(
        '⚠️ Razorpay key is not set in PAYMENT_CONFIG. Online payments will rely on backend-provided key.'
      );
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserProfileProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#f43f5e"
            translucent={false}
          />
          <AppNavigator />
        </UserProfileProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
