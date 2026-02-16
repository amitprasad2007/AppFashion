// Network configuration for different environments
export const API_CONFIG = {

  BASE_URL: 'https://superadmin.samarsilkpalace.com/api',

  // Local development URL (Android Emulator bridge to Laravel)
  // Use http://10.0.2.2:8000/api if running 'php artisan serve'
  // Use http://10.0.2.2/api if running via Laragon/Apache
  LOCAL_DEV_URL: 'https://superadmin.samarsilkpalace.com/api', // Default to production but easily toggleable

  // Alternative configurations for different environments
  STAGING_URL: 'https://superadmin.samarsilkpalace.com/api',
  PRODUCTION_URL: 'https://superadmin.samarsilkpalace.com/api',

  // Timeout settings
  TIMEOUT: 60000, // Increased to 60 seconds

  // Default headers
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // No Host header needed for port-based access (php artisan serve)
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
  if (__DEV__) {
    // You can toggle between API_CONFIG.BASE_URL and API_CONFIG.LOCAL_DEV_URL here
    // return API_CONFIG.LOCAL_DEV_URL; 
    return API_CONFIG.BASE_URL;
  }
  return API_CONFIG.PRODUCTION_URL;
};

/**
 * Image Bridge Helper
 * ensures images returned by the API (which likely point to localhost:8000)
 * are reachable by the emulator via the 10.0.2.2:8000 bridge.
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  if (__DEV__) {
    // Rewrite localhost:8000 or 127.0.0.1:8000 to 10.0.2.2:8000
    // This ensures images served by 'php artisan serve' are accessible
    return url.replace(/:\/\/(localhost|127\.0\.0\.1)/, '://10.0.2.2');
  }

  return url;
};

/*
export const getImageSource = (url: string | null | undefined) => { ... }
(Removed as we are not touching UI anymore)
*/

export default API_CONFIG;