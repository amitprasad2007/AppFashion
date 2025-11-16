# 🔧 Network Connectivity Troubleshooting Guide

## 🎯 **Quick Fixes for "Network request failed" Error**

### 1. **✅ Android Emulator Network Issues**

Your Android emulator cannot reach `http://varanasisaree.test/` directly. Here are the solutions:

#### **Option A: Use Special Emulator IP (RECOMMENDED)**
```typescript
// In src/utils/networkConfig.ts
BASE_URL: 'http://10.0.2.2/varanasisaree.test/api'
```
- `10.0.2.2` is the special IP that Android emulator uses to reach localhost

#### **Option B: Use Your Computer's Local IP**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig | findstr "IPv4"
   
   # Mac/Linux
   ifconfig | grep "inet "
   ```

2. Update the config:
   ```typescript
   BASE_URL: 'http://[YOUR_IP_ADDRESS]/varanasisaree.test/api'
   // Example: 'http://192.168.1.100/varanasisaree.test/api'
   ```

#### **Option C: Laravel Development Server**
If you're using Laravel, start the development server:
```bash
# In your Laravel project directory
php artisan serve --host=0.0.0.0 --port=8000
```
Then use:
```typescript
BASE_URL: 'http://10.0.2.2:8000/api'
```

### 2. **🔒 Android Security Permissions** ✅ FIXED
- Added `android:usesCleartextTraffic="true"` to AndroidManifest.xml
- Added `ACCESS_NETWORK_STATE` permission

### 3. **🌐 XAMPP/Local Server Setup**

Make sure your local server is accessible:

#### **XAMPP Configuration:**
1. **Edit httpd.conf:**
   ```apache
   # Find this line and change it:
   Listen 80
   # To:
   Listen 0.0.0.0:80
   ```

2. **Edit httpd-vhosts.conf:**
   ```apache
   <VirtualHost *:80>
       ServerName varanasisaree.test
       DocumentRoot "C:/path/to/your/project/public"
       <Directory "C:/path/to/your/project/public">
           Allow from all
           Require all granted
       </Directory>
   </VirtualHost>
   ```

3. **Windows Hosts File:** (Usually fine, but check)
   ```
   # C:\Windows\System32\drivers\etc\hosts
   127.0.0.1 varanasisaree.test
   ```

### 4. **🧪 Test Your Connection**

The app now includes debugging tools. Check the console for:
```
🔍 Testing API connectivity...
Testing: http://10.0.2.2/varanasisaree.test/api/getBanners
✅ SUCCESS: [working URL]
```

### 5. **🚀 Step-by-Step Solution**

1. **First, try the emulator IP fix** (already applied):
   ```typescript
   BASE_URL: 'http://10.0.2.2/varanasisaree.test/api'
   ```

2. **If that doesn't work, find your IP and update**:
   ```bash
   # Run this in terminal/cmd
   ipconfig
   # Look for "Wireless LAN adapter Wi-Fi" or "Ethernet adapter"
   # Find the IPv4 Address like: 192.168.1.100
   ```

3. **Update config with your IP**:
   ```typescript
   BASE_URL: 'http://192.168.1.xxx/varanasisaree.test/api'
   ```

4. **Restart the React Native app**:
   ```bash
   npx react-native start --reset-cache
   npx react-native run-android
   ```

### 6. **🆘 Alternative Testing URLs**

Try these URLs in order of preference:
1. `http://10.0.2.2/varanasisaree.test/api/getBanners`
2. `http://10.0.2.2:8000/api/getBanners` (Laravel serve)
3. `http://[YOUR_IP]/varanasisaree.test/api/getBanners`
4. `http://127.0.0.1:8000/api/getBanners`

### 7. **📱 Test from Browser First**

Before testing in the app, verify the API works:
- Open browser on your computer
- Go to: `http://varanasisaree.test/api/getBanners`
- You should see your banner JSON data

### 8. **🔧 Final Check**

Make sure:
- ✅ XAMPP is running
- ✅ Apache is started
- ✅ Your Laravel/PHP project is accessible
- ✅ API endpoint returns data in browser
- ✅ Android emulator is running
- ✅ Network permissions are added

## 🎉 **Expected Result**

After applying these fixes, you should see:
- Beautiful banner slider loading your real data
- Console logs showing successful API connection
- Your Varanasi saree banners displaying with gradients

If you still have issues, check the React Native console for the debugging logs that will help identify the exact problem!