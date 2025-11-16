// Network debugging utilities
export const testApiConnection = async () => {
  const testUrls = [
    'http://10.0.2.2:8000/api/getBanners', // Android Emulator - Laravel serve
    'http://127.0.0.1:8000/api/getBanners', // Laravel serve
    'http://localhost:8000/api/getBanners', // Localhost
    // 'http://varanasisaree.test/api/getBanners', // Original
  ];

  console.log('🔍 Testing API connectivity...');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${url}`);
        console.log('Response data:', data);
        return { url, data };
      } else {
        console.log(`❌ FAILED: ${url} - Status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ ERROR: ${url} - ${errorMessage}`);
    }
  }
  
  console.log('❌ All connection attempts failed');
  return null;
};

export const getDeviceNetworkInfo = () => {
  console.log('📱 Device Network Info:');
  console.log('Platform:', require('react-native').Platform.OS);
  console.log('Is Android Emulator:', require('react-native').Platform.OS === 'android');
  console.log('Suggested URLs for testing:');
  console.log('  - Android Emulator: http://10.0.2.2/varanasisaree.test/api');
  console.log('  - iOS Simulator: http://localhost:8000/api');
  console.log('  - Physical Device: http://[YOUR_COMPUTER_IP]/varanasisaree.test/api');
};