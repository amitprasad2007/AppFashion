# 📱 Samar Silk Palace APK Build Instructions

## 🚀 Quick Build Commands

### For Debug APK (Development/Testing):
```bash
# Clean previous builds
cd android && ./gradlew clean && cd ..

# Build debug APK
cd android && ./gradlew assembleDebug && cd ..
```

### For Release APK (Production):
```bash
# Clean previous builds
cd android && ./gradlew clean && cd ..

# Build release APK
cd android && ./gradlew assembleRelease && cd ..
```

## 📋 Pre-Build Checklist

### 1. **Install Dependencies**
```bash
npm install
# or
yarn install
```

### 2. **Generate Android Bundle**
```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

### 3. **Clean Metro Cache (if needed)**
```bash
npx react-native start --reset-cache
```

## 🔧 Build Process

### Step-by-Step Build:

1. **Navigate to project directory:**
   ```bash
   cd /path/to/your/AppFashion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Clean previous builds:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Build the APK:**
   
   **For Debug APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   cd ..
   ```
   
   **For Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   cd ..
   ```

## 📍 APK Output Locations

After successful build, find your APK files at:

### Debug APK:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📱 App Information

- **App Name:** Samar Silk Palace
- **Package ID:** com.samarsilkpalace.app
- **Version:** 1.0.0 (Version Code: 1)

## 🔐 Signing Information

### Debug Build:
- Uses default debug keystore
- Password: android
- Alias: androiddebugkey

### Release Build:
- Currently using debug keystore (FOR TESTING ONLY)
- **⚠️ For production, you need to generate a proper release keystore**

## 🏗️ Production Release Setup (Future)

For production releases, you'll need to:

1. **Generate Release Keystore:**
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update gradle.properties:**
   ```properties
   MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
   MYAPP_RELEASE_KEY_ALIAS=my-key-alias
   MYAPP_RELEASE_STORE_PASSWORD=*****
   MYAPP_RELEASE_KEY_PASSWORD=*****
   ```

3. **Update build.gradle signing config**

## 🐛 Troubleshooting

### Common Issues:

1. **Gradle Build Fails:**
   ```bash
   cd android && ./gradlew clean && cd ..
   npm install
   ```

2. **Metro Bundle Error:**
   ```bash
   npx react-native start --reset-cache
   ```

3. **Permission Errors:**
   ```bash
   chmod +x android/gradlew
   ```

4. **Out of Memory:**
   Add to `android/gradle.properties`:
   ```
   org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
   ```

## ✅ Build Success Verification

After successful build, you should see:
```
BUILD SUCCESSFUL in Xs
```

And the APK file will be available at the specified output location.

## 📦 APK Installation

To install the APK on a device:

1. **Enable Developer Options** on Android device
2. **Enable USB Debugging** 
3. **Install via ADB:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

Or simply copy the APK file to the device and install manually.

## 🎯 Next Steps

1. Build the debug APK for testing
2. Test all features thoroughly
3. Generate release keystore for production
4. Build release APK for distribution

---

**Ready to build your Samar Silk Palace app! 🚀**