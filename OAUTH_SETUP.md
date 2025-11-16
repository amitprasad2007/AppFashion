# OAuth Authentication Setup Guide

This guide explains how to set up and use OAuth (social login) authentication in the AppFashion React Native application.

## Overview

The AppFashion app now supports social authentication through:
- **Google Sign-In**
- **Facebook Login**
- **Apple Sign-In** (iOS only)

The implementation supports both:
1. **Native OAuth** (using native SDKs - recommended for better UX)
2. **Web-based OAuth** (fallback using deep linking)

## Architecture

### Files Structure

```
src/
├── services/
│   ├── api.ts              # API service with OAuth endpoints
│   └── oauthService.ts     # OAuth utility service
├── contexts/
│   └── AuthContext.tsx     # Auth context with OAuth methods
└── screens/
    └── auth/
        ├── LoginScreen.tsx    # Login with OAuth buttons
        └── RegisterScreen.tsx # Registration with OAuth buttons
```

### Key Components

1. **oauthService.ts**: Handles OAuth flows (native and web-based)
2. **AuthContext.tsx**: Manages authentication state and OAuth callbacks
3. **LoginScreen.tsx & RegisterScreen.tsx**: UI with functional OAuth buttons

## Setup Instructions

### Option 1: Native OAuth (Recommended)

For the best user experience, install native OAuth SDKs:

#### Google Sign-In

```bash
npm install @react-native-google-signin/google-signin
```

**Android Setup:**
1. Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

2. Configure in `App.tsx`:
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // From Google Cloud Console
});
```

**iOS Setup:**
1. Add to `ios/Podfile`:
```ruby
pod 'GoogleSignIn'
```

2. Run `cd ios && pod install`

#### Facebook Login

```bash
npm install react-native-fbsdk-next
```

**Android Setup:**
1. Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/>
<meta-data android:name="com.facebook.sdk.ClientToken" android:value="@string/facebook_client_token"/>
```

2. Add to `android/app/src/main/res/values/strings.xml`:
```xml
<string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
<string name="facebook_client_token">YOUR_FACEBOOK_CLIENT_TOKEN</string>
```

**iOS Setup:**
1. Add to `ios/AppFashion/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fbYOUR_FACEBOOK_APP_ID</string>
    </array>
  </dict>
</array>
<key>FacebookAppID</key>
<string>YOUR_FACEBOOK_APP_ID</string>
<key>FacebookClientToken</key>
<string>YOUR_FACEBOOK_CLIENT_TOKEN</string>
```

#### Apple Sign-In (iOS Only)

```bash
npm install @invertase/react-native-apple-authentication
```

**iOS Setup:**
1. Enable "Sign in with Apple" capability in Xcode
2. Add to `ios/Podfile`:
```ruby
pod 'RNAppleAuthentication'
```

3. Run `cd ios && pod install`

### Option 2: Web-based OAuth (Fallback)

If native SDKs are not installed, the app will automatically fall back to web-based OAuth using deep linking.

**Deep Link Configuration:**

**Android:**
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="appfashion" android:host="oauth" />
</intent-filter>
```

**iOS:**
Add to `ios/AppFashion/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>appfashion</string>
    </array>
  </dict>
</array>
```

**Backend Configuration:**
Your Laravel backend should redirect OAuth callbacks to:
```
appfashion://oauth/callback?provider=google&token=xxx
```

## Backend API Requirements

Your backend should implement the following endpoints:

### 1. OAuth Login Endpoint
```
POST /api/auth/oauth/login
Body: {
  provider: 'google' | 'facebook' | 'apple',
  token: string,
  userInfo: {
    email: string,
    name?: string,
    firstName?: string,
    lastName?: string,
    photo?: string
  }
}
Response: {
  success: boolean,
  message: string,
  user: AuthUser,
  token: string,
  refreshToken?: string
}
```

### 2. OAuth Redirect Endpoints (Web-based)
```
GET /auth/google
GET /auth/facebook
```

### 3. OAuth Callback Endpoints (Web-based)
```
GET /auth/google/callback
GET /auth/facebook/callback
```

These should redirect to: `appfashion://oauth/callback?provider=google&token=xxx`

## Usage

### In Components

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { oauthLogin, state } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const response = await oauthLogin('google');
      if (response.success) {
        // User is logged in
        // Navigation is handled automatically
      }
    } catch (error) {
      console.error('OAuth login failed:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleGoogleLogin}>
      <Text>Sign in with Google</Text>
    </TouchableOpacity>
  );
};
```

### OAuth Flow

1. **User clicks social login button**
2. **Native OAuth (if SDK installed):**
   - Opens native sign-in dialog
   - Returns user info
   - Sends to backend `/api/auth/oauth/login`
   - Backend creates/updates user and returns token
   - App stores token and navigates to main app

3. **Web-based OAuth (fallback):**
   - Opens browser with backend OAuth URL
   - User authenticates with provider
   - Backend redirects to `appfashion://oauth/callback?token=xxx`
   - App handles deep link
   - Verifies token with backend
   - Stores token and navigates to main app

## Testing

### Test Native OAuth
1. Ensure native SDKs are installed
2. Configure credentials in native projects
3. Run on device/emulator
4. Click social login button
5. Complete native sign-in flow

### Test Web-based OAuth
1. Ensure deep linking is configured
2. Ensure backend OAuth endpoints are set up
3. Run app
4. Click social login button
5. Should open browser, then redirect back to app

## Troubleshooting

### OAuth Not Working

1. **Check native SDK installation:**
   - Verify packages are installed: `npm list @react-native-google-signin/google-signin`
   - Rebuild native projects: `cd android && ./gradlew clean` or `cd ios && pod install`

2. **Check credentials:**
   - Verify Google/Facebook/Apple credentials are correct
   - Check OAuth redirect URIs match exactly

3. **Check deep linking:**
   - Test deep link: `adb shell am start -W -a android.intent.action.VIEW -d "appfashion://oauth/callback?provider=google&token=test" com.awesomeproject`
   - Verify AndroidManifest.xml / Info.plist configuration

4. **Check backend:**
   - Verify OAuth endpoints are working
   - Check CORS settings
   - Verify token format matches expected structure

### Common Issues

**"Native OAuth not available" message:**
- Native SDKs are not installed or configured
- App will fall back to web-based OAuth automatically

**Deep link not opening app:**
- Check AndroidManifest.xml / Info.plist configuration
- Verify app is installed and deep link scheme matches

**Token verification fails:**
- Check backend `/api/auth/me` endpoint
- Verify token format and expiration

## Security Considerations

1. **Token Storage:** Tokens are stored securely using AsyncStorage
2. **Token Refresh:** Implement token refresh mechanism for expired tokens
3. **Deep Link Validation:** Backend should validate OAuth state parameter
4. **HTTPS:** Always use HTTPS in production for OAuth endpoints

## Next Steps

1. Install native OAuth SDKs for better UX
2. Configure OAuth credentials in native projects
3. Set up backend OAuth endpoints
4. Test OAuth flows on both platforms
5. Implement token refresh mechanism
6. Add error handling and user feedback

## Support

For issues or questions:
- Check backend OAuth implementation in Vanarasi-vogue project
- Review React Native OAuth library documentation
- Check backend API logs for OAuth errors

