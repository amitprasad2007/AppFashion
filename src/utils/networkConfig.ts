// Network configuration for different environments
export const API_CONFIG = {
  // Development/Local API - Use IP address for emulator connectivity
  BASE_URL: 'https://superadmin.samarsilkpalace.com/api', // Live production API
  // BASE_URL: 'http://127.0.0.1:8000/api', // If using Laravel serve
  // BASE_URL: 'http://192.168.1.100/varanasisaree.test/api', // Your actual local IP
  
  // Alternative configurations for different environments
  STAGING_URL: 'https://staging-api.varanasisaree.com/api',
  PRODUCTION_URL: 'https://api.varanasisaree.com/api',
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Default headers
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  
  // API Endpoints
  ENDPOINTS: {
    BANNERS: '/getBanners',
    PRODUCTS: '/getProducts', 
    CATEGORIES: '/getCategories',
    SEARCH: '/search',
    USER_AUTH: '/auth',
  },
};

// Helper function to get current API base URL
export const getApiBaseUrl = () => {
  // You can add environment detection logic here
  if (__DEV__) {
    return API_CONFIG.BASE_URL; // Development
  }
  return API_CONFIG.PRODUCTION_URL; // Production
};

export default API_CONFIG;