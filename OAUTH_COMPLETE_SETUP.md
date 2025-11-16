# Complete OAuth Setup Guide

## Step 2: Configure OAuth Credentials in Native Projects

### 🔧 Android Configuration

#### Google OAuth Setup:
1. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 Client ID for Android
   - Note down your `Web Client ID` and `Android Client ID`

2. **Get SHA-1 Fingerprint:**
   ```bash
   cd android
   ./gradlew signingReport
   ```
   Look for SHA1 under `Variant: debug` section

3. **Configure in Google Console:**
   - Add SHA-1 fingerprint to your Android OAuth client
   - Add package name: `com.awesomeproject`

#### Facebook OAuth Setup:
1. **Get Facebook App Credentials:**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create new app or select existing
   - Note down `App ID` and `Client Token`

2. **Configure Android Manifest:**
   ```xml
   <!-- Add to android/app/src/main/AndroidManifest.xml -->
   <application>
       <meta-data 
           android:name="com.facebook.sdk.ApplicationId" 
           android:value="@string/facebook_app_id"/>
       <meta-data 
           android:name="com.facebook.sdk.ClientToken" 
           android:value="@string/facebook_client_token"/>
   </application>
   ```

3. **Add Facebook credentials to strings.xml:**
   ```xml
   <!-- Add to android/app/src/main/res/values/strings.xml -->
   <string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
   <string name="facebook_client_token">YOUR_FACEBOOK_CLIENT_TOKEN</string>
   ```

### 🍎 iOS Configuration (for future iOS builds)

#### Google OAuth Setup:
1. **Download GoogleService-Info.plist** from Google Console
2. **Add to iOS project** in Xcode
3. **Configure URL Scheme** in Info.plist

#### Facebook OAuth Setup:
1. **Add Facebook SDK** to iOS
2. **Configure Info.plist** with Facebook App ID
3. **Set URL Schemes** for Facebook callback

## Current Implementation Status:
✅ SDKs Installed
⏳ Native Configuration (needs real credentials)
⏳ Backend Setup
⏳ Error Handling Enhancement
⏳ Token Refresh Implementation