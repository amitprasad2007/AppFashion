// API service for AppFashion
import { getApiBaseUrl, API_CONFIG } from '../utils/networkConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = getApiBaseUrl();

export interface ApiBannerData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string | null;
  path: string | null;
}

export interface ApiCategory {
  id: number;
  name: string;
  description: string;
  image: string;
  count: number;
  slug: string;
}

// Updated to match your actual API response from getProductDetails
export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  brand?: {
    id: number;
    name: string;
    slug: string;
  };
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating?: number;
  reviewCount?: number;
  category: {
    id: number;
    title: string;
    slug: string;
    summary: string;
    photo: string;
    is_parent: number;
    parent_id?: number;
  };
  subCategory?: {
    id: number;
    title: string;
    slug: string;
    summary: string;
    photo: string;
    is_parent: number;
    parent_id?: number;
  };
  sku: string;
  images: string[];
  colors: Array<{
    name: string;
    value: string;
    available: boolean;
    variantId: number;
  }>;
  defaultVariantId: number;
  variants: Array<{
    id: number;
    color: {
      name: string;
      value: string;
    };
    sku: string;
    images: string[];
    stock: number;
    available: boolean;
    price: number;
    originalPrice: number;
  }>;
  sizes: string;
  stock: number;
  description: string;
  specifications: Array<{
    name: string;
    value: string;
  }>;
  isBestseller: boolean;
  isNew?: boolean;
  inStock?: boolean;
}

// Collection interfaces for the new collections API
export interface ApiCollectionType {
  id: number;
  name: string;
  slug: string;
}

export interface ApiCollection {
  id: number;
  collection_type_id: number;
  name: string;
  slug: string;
  description: string;
  banner_image: string;
  thumbnail_image: string;
  seo_title?: string;
  seo_description?: string;
  collection_type: ApiCollectionType;
}

// Authentication Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  address?: string | null;
  gstin?: string | null;
  created_at: string;
  updated_at: string;
  google_id?: string | null;
  avatar?: string | null;
  facebook_id?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Updated interfaces to match your API response
export interface ApiCartItem {
  id: number;
  cart_id: number;
  name: string;
  price: string;
  quantity: number;
  image: string[];
}

export interface ApiCart {
  items: ApiCartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface ApiOrderItem {
  id: number;
  name: string;
  image: string | string[];
  price: string;
  quantity: number;
}

export interface ApiOrder {
  id: string;
  date: string;
  total: string;
  status: string;
  statusColor: string;
  items: ApiOrderItem[];
}

export interface ApiWishlistItem {
  wish_id: number;
  id: number;
  name: string;
  slug: string;
  image: string[];
  price: string;
  originalPrice: number | null;
  category: string;
}

export interface ApiAddress {
  id: number;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  postal: string;
  phone: string;
  isDefault: boolean;
}

export interface UserData {
  user: AuthUser;
  orders: ApiOrder[];
  wishlists: ApiWishlistItem[];
  addresses: ApiAddress[];
  cart_items: ApiCart;
}

// Legacy interfaces for backward compatibility
export interface CartItem {
  id: string;
  productId: number;
  product: ApiProduct;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  addedAt: string;
  subtotal: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  discount?: number;
  deliveryCharge?: number;
  finalAmount: number;
  updatedAt: string;
}

export interface ShippingAddress {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'COD' | 'ONLINE';
  name: string;
  details?: string;
  razorpay_enabled?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  items: CartItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  totalItems: number;
  totalAmount: number;
  discount?: number;
  deliveryCharge: number;
  finalAmount: number;
  estimatedDelivery?: string;
  placedAt: string;
  updatedAt: string;
  trackingId?: string;
  notes?: string;
}

export interface OrderStatusUpdate {
  status: Order['status'];
  timestamp: string;
  message: string;
  location?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  status?: number;
}

class ApiService {
  private authToken: string | null = null;
  private guestSessionToken: string | null = null;

  // Set authentication token for API requests
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Generate guest session token (matching website implementation)
  private generateGuestSessionToken(): string {
    // Create session token exactly like the website: random string + timestamp
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Get or generate session token for guest API calls
  public getSessionToken(): string {
    // Check if we already have a guest session token stored
    if (!this.guestSessionToken) {
      // Generate a new one and store it (matching website localStorage logic)
      this.guestSessionToken = this.generateGuestSessionToken();
    }

    return this.guestSessionToken;
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      // Convert headers to plain object if it's a Headers instance
      const optionsHeaders = options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : (options.headers as Record<string, string> | undefined) || {};

      const headers: Record<string, string> = {
        ...API_CONFIG.HEADERS,
        ...optionsHeaders,
      };

      // Add auth token if available
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }





      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = '';
        try {
          const errorText = await response.text();
          console.error('🚨 API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            url: `${BASE_URL}${endpoint}`,
            method: options.method || 'GET',
            responseBody: errorText,
            requestBody: options.body
          });

          // Try to parse error response as JSON
          try {
            const errorJson = JSON.parse(errorText);
            errorDetails = errorJson.message || errorJson.error || errorText;
          } catch {
            errorDetails = errorText;
          }
        } catch (textError) {
          console.error('Could not read error response:', textError);
          errorDetails = `HTTP ${response.status}`;
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }

      // Get response text first to handle potential JSON parse errors
      const responseText = await response.text();

      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🚨 JSON Parse Error:', {
          url: `${BASE_URL}${endpoint}`,
          status: response.status,
          responseLength: responseText.length,
          responseStart: responseText.substring(0, 200),
          responseEnd: responseText.substring(responseText.length - 200),
          parseError: parseError
        });



        throw new Error(`Invalid JSON response from ${endpoint}: ${parseError}`);
      }



      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async getBanners(): Promise<ApiBannerData[]> {
    try {
      const response = await this.fetchApi<ApiBannerData[]>('/getBanners');

      // The API returns data directly as an array
      if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Unexpected API response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching banners:', error);


      // Return mock data as fallback
      return [
        {
          id: 1,
          title: "New Collection",
          subtitle: "Discover Latest Fashion",
          description: "Explore our stunning new arrivals",
          image: "https://via.placeholder.com/400x200/f43f5e/ffffff?text=New+Collection",
          cta: "Shop Now",
          path: "/categories"
        },
        {
          id: 2,
          title: "Special Offer",
          subtitle: "Up to 50% Off",
          description: "Limited time discount on selected items",
          image: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Special+Offer",
          cta: "Get Discount",
          path: "/products"
        }
      ];
    }
  }

  async getCategories(): Promise<ApiCategory[]> {
    try {
      const response = await this.fetchApi<ApiCategory[]>('/categories');

      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        console.warn('Unexpected categories API response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching categories:', error);


      // Return mock data as fallback
      return [
        {
          id: 1,
          name: 'Traditional Sarees',
          description: 'Classic traditional sarees',
          image: 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Traditional',
          count: 120,
          slug: 'traditional-sarees',
        },
        {
          id: 2,
          name: 'Silk Sarees',
          description: 'Premium silk collections',
          image: 'https://via.placeholder.com/200x200/4ecdc4/ffffff?text=Silk',
          count: 85,
          slug: 'silk-sarees',
        },
        {
          id: 3,
          name: 'Cotton Sarees',
          description: 'Comfortable cotton wear',
          image: 'https://via.placeholder.com/200x200/45b7d1/ffffff?text=Cotton',
          count: 95,
          slug: 'cotton-sarees',
        },
      ];
    }
  }

  async getCategoryProducts(categoryId: number): Promise<ApiProduct[]> {
    try {
      const response = await this.fetchApi<ApiProduct[]>(`/products/${categoryId}`);

      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        console.warn('Unexpected bestseller products API response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching bestseller products:', error);


      // Return mock data as fallback
      return [
        {
          id: 1,
          name: 'Elegant Saree Collection',
          slug: 'elegant-saree-collection',
          price: 2499,
          originalPrice: 3124,
          discountPercentage: 20,
          rating: 4.8,
          description: 'Beautiful traditional saree with modern touch',
          category: {
            id: 1,
            title: 'Traditional Wear',
            slug: 'traditional-wear',
            summary: 'Traditional sarees',
            photo: 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Traditional',
            is_parent: 1,
          },
          sku: 'SKU-001',
          images: ['https://via.placeholder.com/300x400/ff6b6b/ffffff?text=Saree+1'],
          colors: [],
          defaultVariantId: 1,
          variants: [],
          sizes: 'One Size',
          stock: 10,
          specifications: [],
          isBestseller: true,
          inStock: true,
        },
        {
          id: 2,
          name: 'Designer Silk Saree',
          slug: 'designer-silk-saree',
          price: 3999,
          originalPrice: 4705,
          discountPercentage: 15,
          rating: 4.9,
          description: 'Premium silk saree for special occasions',
          category: {
            id: 2,
            title: 'Silk Sarees',
            slug: 'silk-sarees',
            summary: 'Premium silk collections',
            photo: 'https://via.placeholder.com/200x200/4ecdc4/ffffff?text=Silk',
            is_parent: 1,
          },
          sku: 'SKU-002',
          images: ['https://via.placeholder.com/300x400/4ecdc4/ffffff?text=Saree+2'],
          colors: [],
          defaultVariantId: 1,
          variants: [],
          sizes: 'One Size',
          stock: 8,
          specifications: [],
          isBestseller: true,
          inStock: true,
        },
        {
          id: 3,
          name: 'Cotton Comfort Saree',
          slug: 'cotton-comfort-saree',
          price: 1299,
          originalPrice: 1443,
          discountPercentage: 10,
          rating: 4.6,
          description: 'Comfortable cotton saree for daily wear',
          category: {
            id: 3,
            title: 'Cotton Sarees',
            slug: 'cotton-sarees',
            summary: 'Comfortable cotton wear',
            photo: 'https://via.placeholder.com/200x200/45b7d1/ffffff?text=Cotton',
            is_parent: 1,
          },
          sku: 'SKU-003',
          images: ['https://via.placeholder.com/300x400/45b7d1/ffffff?text=Saree+3'],
          colors: [],
          defaultVariantId: 1,
          variants: [],
          sizes: 'One Size',
          stock: 15,
          specifications: [],
          isBestseller: true,
          inStock: true,
        },
      ];
    }
  }

  async getBestsellerProducts(): Promise<ApiProduct[]> {
    try {
      const response = await this.fetchApi<ApiProduct[]>('/bestseller-products');

      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        console.warn('Unexpected bestseller products API response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching bestseller products:', error);
      console.log('🔄 Using mock data for bestseller products');

      // Return mock data as fallback
      return [
        {
          id: 1,
          name: 'Elegant Saree Collection',
          slug: 'elegant-saree-collection',
          price: 2499,
          originalPrice: 3124,
          discountPercentage: 20,
          rating: 4.8,
          description: 'Beautiful traditional saree with modern touch',
          category: {
            id: 1,
            title: 'Traditional Wear',
            slug: 'traditional-wear',
            summary: 'Traditional sarees',
            photo: 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Traditional',
            is_parent: 1,
          },
          sku: 'SKU-001',
          images: ['https://via.placeholder.com/300x400/ff6b6b/ffffff?text=Saree+1'],
          colors: [],
          defaultVariantId: 1,
          variants: [],
          sizes: 'One Size',
          stock: 10,
          specifications: [],
          isBestseller: true,
          inStock: true,
        },
        {
          id: 2,
          name: 'Designer Silk Saree',
          slug: 'designer-silk-saree',
          price: 3999,
          originalPrice: 4705,
          discountPercentage: 15,
          rating: 4.9,
          description: 'Premium silk saree for special occasions',
          category: {
            id: 2,
            title: 'Silk Sarees',
            slug: 'silk-sarees',
            summary: 'Premium silk collections',
            photo: 'https://via.placeholder.com/200x200/4ecdc4/ffffff?text=Silk',
            is_parent: 1,
          },
          sku: 'SKU-002',
          images: ['https://via.placeholder.com/300x400/4ecdc4/ffffff?text=Saree+2'],
          colors: [],
          defaultVariantId: 1,
          variants: [],
          sizes: 'One Size',
          stock: 8,
          specifications: [],
          isBestseller: true,
          inStock: true,
        },
        {
          id: 3,
          name: 'Cotton Comfort Saree',
          slug: 'cotton-comfort-saree',
          price: 1299,
          originalPrice: 1443,
          discountPercentage: 10,
          rating: 4.6,
          description: 'Comfortable cotton saree for daily wear',
          category: {
            id: 3,
            title: 'Cotton Sarees',
            slug: 'cotton-sarees',
            summary: 'Comfortable cotton wear',
            photo: 'https://via.placeholder.com/200x200/45b7d1/ffffff?text=Cotton',
            is_parent: 1,
          },
          sku: 'SKU-003',
          images: ['https://via.placeholder.com/300x400/45b7d1/ffffff?text=Saree+3'],
          colors: [],
          defaultVariantId: 1,
          variants: [],
          sizes: 'One Size',
          stock: 15,
          specifications: [],
          isBestseller: true,
          inStock: true,
        },
      ];
    }
  }

  async getFeaturedProducts(): Promise<ApiProduct[]> {
    try {
      const response = await this.fetchApi<ApiProduct[]>('/featured-products');

      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        console.warn('Unexpected featured products API response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  // Enhanced product methods using your actual endpoints
  async getProducts(params: {
    categoryId?: string | number;
    type?: 'featured' | 'bestseller' | 'recommended' | 'all' | 'category';
    limit?: number;
    page?: number;
    search?: string;
  } = {}): Promise<ApiProduct[]> {
    try {
      // Use specific endpoints based on your backend API structure
      if (params.type === 'featured') {
        return await this.getFeaturedProducts();
      }
      if (params.type === 'bestseller') {
        return await this.getBestsellerProducts();
      }
      if (params.type === 'category') {
        return await this.getCategoryProducts(params.categoryId as number);
      }
      if (params.type === 'recommended') {
        return await this.getRecommendedProducts();
      }

      // For category-based or general product requests, use featured as fallback
      // since /products endpoint doesn't exist in your backend

      const featuredProducts = await this.getFeaturedProducts();

      // If categoryId is specified, try to filter (this may not work without proper endpoint)
      if (params.categoryId) {
        console.warn('Category filtering may not work without dedicated category products endpoint');
        // Return all featured products for now
      }

      return featuredProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Get related products by product slug (matching your API structure)
  async getRelatedProducts(productSlug: string): Promise<ApiProduct[]> {
    try {
      const response = await this.fetchApi<ApiProduct[]>(`/getRelatedProducts/${productSlug}`);
      return Array.isArray(response) ? response : (response as any)?.data || [];
    } catch (error) {
      console.error(`Error fetching related products for ${productSlug}:`, error);
      return [];
    }
  }

  // Get specific product by slug (matching your frontend API)
  async getProductBySlug(productSlug: string): Promise<ApiProduct | null> {
    try {
      const response = await this.fetchApi<ApiProduct>(`/getProductDetails/${productSlug}`);
      return response;
    } catch (error) {
      console.error(`Error fetching product ${productSlug}:`, error);
      return null;
    }
  }

  // Get product details by ID (deprecated - use slug instead)
  async getProductDetails(productId: number): Promise<ApiProduct | null> {
    try {
      console.warn('getProductDetails by ID is deprecated. Use getProductBySlug instead.');
      const response = await this.fetchApi<ApiProduct>(`/getProductDetails/${productId}`);
      return response;
    } catch (error) {
      console.error('Error fetching product details by ID:', error);
      throw error;
    }
  }

  // Backward compatibility - get product by ID or slug
  async getProductById(productIdOrSlug: string | number): Promise<ApiProduct | null> {
    try {
      // If it's a number or looks like an ID, try the slug approach with a fallback
      if (typeof productIdOrSlug === 'number') {
        // For numeric IDs, we need to find the product slug first
        // This is a limitation - ideally we should store slugs instead of IDs
        console.warn('Using numeric product ID - consider using product slugs instead');
        return null;
      }

      // Treat as slug
      return await this.getProductBySlug(productIdOrSlug as string);
    } catch (error) {
      console.error(`Error fetching product ${productIdOrSlug}:`, error);
      return null;
    }
  }

  async searchProducts(query: string, filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  } = {}): Promise<ApiProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);

      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('min_price', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice.toString());
      if (filters.rating) queryParams.append('rating', filters.rating.toString());

      const response = await this.fetchApi<ApiProduct[]>(`/search?${queryParams.toString()}`);
      return Array.isArray(response) ? response : (response as any)?.data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<{
        message: string;
        customer: AuthUser;
        token: string;
      }>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Transform the response to match our AuthResponse interface
      const authResponse: AuthResponse = {
        success: true,
        message: response.message,
        user: response.customer,
        token: response.token,
      };

      // Set auth token if login successful
      if (authResponse.token) {
        this.setAuthToken(authResponse.token);
      }

      return authResponse;
    } catch (error) {
      console.error('Error during login:', error);

      // Return failed response
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Set auth token if registration includes auto-login
      if (response.success && response.token) {
        this.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<AuthResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response;
    } catch (error) {
      console.error('Error during forgot password:', error);
      throw error;
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<AuthResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response;
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<AuthResponse>('/auth/logout', {
        method: 'POST',
      });

      // Clear auth token
      this.setAuthToken(null);

      return response;
    } catch (error) {
      console.error('Error during logout:', error);
      // Clear token even if API call fails
      this.setAuthToken(null);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      // Update auth token if refresh successful
      if (response.success && response.token) {
        this.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Error during token refresh:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await this.fetchApi<{ user: AuthUser }>('/user');
      return response.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  // Get comprehensive user data including orders, cart, wishlist, addresses
  async getUserData(): Promise<UserData> {
    try {
      const response = await this.fetchApi<UserData>('/user');
      return response;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async updateProfile(userData: Partial<AuthUser>): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<AuthResponse>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // OAuth Methods
  async oauthLogin(provider: 'google' | 'facebook' | 'apple', token: string, userInfo?: any): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<AuthResponse>('/auth/oauth/login', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          token,
          userInfo,
        }),
      });

      // Set auth token if login successful
      if (response.success && response.token) {
        this.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error(`Error during ${provider} OAuth login:`, error);

      // Return mock success for development/testing

      const mockResponse: AuthResponse = {
        success: true,
        message: `Mock ${provider} login successful`,
        user: {
          id: Date.now(),
          name: 'Test User',
          phone: '',
          email: userInfo?.email || 'test@example.com',
          address: null,
          gstin: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          google_id: provider === 'google' ? 'mock_google_id' : null,
          avatar: userInfo?.photo || null,
          facebook_id: provider === 'facebook' ? 'mock_facebook_id' : null,
        },
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
      };

      // Set mock auth token
      if (mockResponse.token) {
        this.setAuthToken(mockResponse.token);
      }

      return mockResponse;
    }
  }

  // Get OAuth redirect URL (for web-based OAuth flow)
  getOAuthRedirectUrl(provider: 'google' | 'facebook' | 'apple'): string {
    const baseUrl = BASE_URL.replace('/api', ''); // Remove /api to get base URL
    return `${baseUrl}/auth/${provider}`;
  }

  // ==================== CART MANAGEMENT ====================

  // Get current user's cart (using comprehensive user data)
  async getCart(): Promise<ApiCart> {
    try {
      const userData = await this.getUserData();
      console.log(userData);
      return userData.cart_items;
    } catch (error) {
      console.error('Error fetching cart:', error);

      // Return empty cart as fallback
      return {
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      };
    }
  }

  // Get cart items in legacy format for backward compatibility
  async getLegacyCart(): Promise<Cart> {
    try {
      const apiCart = await this.getCart();

      // Transform API cart to legacy format
      const legacyItems: CartItem[] = apiCart.items.map((item, index) => ({
        id: `cart_item_${item.id}`,
        productId: item.id,
        product: {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          images: item.image,
          // Add other required product fields with defaults
          slug: `product-${item.id}`,
          originalPrice: parseFloat(item.price),
          discountPercentage: 0,
          sku: `SKU-${item.id}`,
          colors: [],
          defaultVariantId: 1,
          variants: [],
          sizes: '',
          stock: 10,
          description: '',
          specifications: [],
          isBestseller: false,
          category: { id: 1, title: 'General', slug: 'general', summary: '', photo: '', is_parent: 0 }
        } as ApiProduct,
        quantity: item.quantity,
        addedAt: new Date().toISOString(),
        subtotal: parseFloat(item.price) * item.quantity,
      }));

      return {
        id: 'user_cart',
        items: legacyItems,
        totalItems: apiCart.items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: apiCart.subtotal,
        discount: apiCart.discount,
        deliveryCharge: apiCart.shipping,
        finalAmount: apiCart.total,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching legacy cart:', error);

      return {
        id: 'empty_cart',
        items: [],
        totalItems: 0,
        totalAmount: 0,
        finalAmount: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Clear entire cart
  async clearCart(): Promise<{ success: boolean; message: string }> {
    try {
      await AsyncStorage.removeItem('cart');
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Apply coupon to cart
  async applyCoupon(couponCode: string): Promise<Cart> {
    try {
      const response = await this.fetchApi<Cart>('/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ couponCode }),
      });
      return response;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  // ==================== ADDRESS MANAGEMENT ====================

  // Get user addresses
  async getAddresses(): Promise<ApiAddress[]> {
    try {
      const userData = await this.getUserData();
      return userData.addresses;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  // Place new order
  async placeOrder(orderData: {
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Promise<Order> {
    try {
      const response = await this.fetchApi<Order>('/orders/place', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return response;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await this.fetchApi<Order>(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Get order tracking information
  async getOrderTracking(orderId: string): Promise<OrderStatusUpdate[]> {
    try {
      const response = await this.fetchApi<OrderStatusUpdate[]>(`/orders/${orderId}/tracking`);
      return response;
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      return [];
    }
  }

  // ==================== WISHLIST MANAGEMENT ====================

  // Get user's wishlist items
  async getWishlist(): Promise<ApiWishlistItem[]> {
    try {
      const userData = await this.getUserData();
      return userData.wishlists;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  // ==================== CART OPERATIONS ====================

  // Add item to cart
  async addToCart(
    productId: number,
    quantity: number = 1,
    options?: { size?: string; color?: string; variant_id?: number }
  ): Promise<{ success: boolean; message: string; cart?: ApiCart }> {
    try {
      const payload = {
        product_id: productId,
        quantity,
        variant_id: options?.variant_id,
        size: options?.size,
        color: options?.color,
      };

      const response = await this.fetchApi<{ success: boolean; message: string; cart?: ApiCart }>('/cart/add', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Add wishlist item to cart
  async addWishlistToCart(wishlistId: number, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>('/wishcart/add', {
        method: 'POST',
        body: JSON.stringify({ wishlist_id: wishlistId, quantity }),
      });
      return response;
    } catch (error) {
      console.error('Error adding wishlist item to cart:', error);
      throw error;
    }
  }

  // Update cart item
  async updateCartItem(
    cartItemId: number,
    quantity: number
  ): Promise<{ success: boolean; message: string; cart?: ApiCart }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string; cart?: ApiCart }>('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({ cart_id: cartItemId, quantity }),
      });
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(cartId: number, productId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>('/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({
          cart_id: cartId,
          product_id: productId
        }),
      });
      return response;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }


  // Get checkout cart details
  async getCheckoutCart(): Promise<{
    cart: ApiCart;
    shipping_address?: ApiAddress;
    recommended_products?: ApiProduct[];
  }> {
    try {
      const response = await this.fetchApi<{
        cart: ApiCart;
        shipping_address?: ApiAddress;
        recommended_products?: ApiProduct[];
      }>('/cart/checkout');
      return response;
    } catch (error) {
      console.error('Error fetching checkout cart:', error);
      throw error;
    }
  }

  // Get cart summary
  async getCartSummary(): Promise<{
    total_items: number;
    subtotal: number;
    total: number;
    discount: number;
    shipping: number;
    tax: number;
  }> {
    try {
      const response = await this.fetchApi<{
        total_items: number;
        subtotal: number;
        total: number;
        discount: number;
        shipping: number;
        tax: number;
      }>('/cart/summary');
      return response;
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      throw error;
    }
  }

  // Get recommended products
  async getRecommendedProducts(): Promise<ApiProduct[]> {
    try {
      const response = await this.fetchApi<ApiProduct[]>('/recommended-products');
      return response;
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      return [];
    }
  }

  // ==================== WISHLIST OPERATIONS ====================

  // Get wishlist items (independent endpoint)
  async getWishlistItems(): Promise<ApiWishlistItem[]> {
    try {
      const response = await this.fetchApi<ApiWishlistItem[]>('/wishlist');
      return response;
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      return [];
    }
  }

  // Add item to wishlist
  async addToWishlist(productId: number, variantId?: number): Promise<{ success: boolean; message: string }> {
    try {
      const payload: any = { product_id: productId };
      if (variantId) {
        payload.product_variant_id = variantId;
      }
      const response = await this.fetchApi<{ success: boolean; message: string }>('/wishlist', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  // Remove item from wishlist by product ID
  async removeFromWishlist(productId: number, variantId?: number): Promise<{ success: boolean; message: string }> {
    try {
      let endpoint = `/wishlist/${productId}`;
      if (variantId) {
        endpoint += `?product_variant_id=${variantId}`;
      }
      const response = await this.fetchApi<{ success: boolean; message: string }>(endpoint, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  // Remove from wishlist by wishlist ID
  async removeFromWishlistById(wishlistId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>(`/wishlistremovebyid/${wishlistId}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error removing from wishlist by ID:', error);
      throw error;
    }
  }

  // Check if product is in wishlist
  // Check wishlist status for a product (with session token and variant support)
  async checkWishlist(
    productId: number,
    productVariantId?: number
  ): Promise<{ in_wishlist: boolean; wishlist_id?: number }> {
    try {
      // Use different endpoints based on authentication status
      const endpoint = this.authToken ? '/checkwishlist' : '/guest/checkwishlist';

      const requestBody: any = {
        product_id: productId,
        product_variant_id: productVariantId || null // Always include product_variant_id (required parameter)
      };

      // For guest users, add session token
      if (!this.authToken) {
        const sessionToken = this.getSessionToken();
        requestBody.session_token = sessionToken;

      }

      const response = await this.fetchApi<{ in_wishlist: boolean; wish_id?: number }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Normalize the response to match our interface
      return {
        in_wishlist: response.in_wishlist,
        wishlist_id: response.wish_id
      };
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return { in_wishlist: false };
    }
  }

  // Sync wishlist (for offline/online sync)
  async syncWishlist(wishlistItems: { product_id: number }[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>('/sync-wishlist', {
        method: 'POST',
        body: JSON.stringify({ wishlist_items: wishlistItems }),
      });
      return response;
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      throw error;
    }
  }

  // ==================== ORDER OPERATIONS ====================

  // Buy now (single product checkout)
  async buyNow(
    productId: number,
    quantity: number,
    options?: { size?: string; color?: string; variant_id?: number }
  ): Promise<{ success: boolean; message: string; order_id?: string; payment_url?: string }> {
    try {
      const payload = {
        product_id: productId,
        quantity,
        variant_id: options?.variant_id,
        size: options?.size,
        color: options?.color,
      };

      const response = await this.fetchApi<{
        success: boolean;
        message: string;
        order_id?: string;
        payment_url?: string
      }>('/order/buy-now', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Error in buy now:', error);
      throw error;
    }
  }

  // Checkout cart
  async checkout(
    addressId: number,
    paymentMethod: string,
    notes?: string
  ): Promise<{
    success: boolean;
    message: string;
    order_id?: string;
    payment_url?: string;
    order_total?: number;
  }> {
    try {
      const payload = {
        address_id: addressId,
        payment_method: paymentMethod,
        notes,
      };

      const response = await this.fetchApi<{
        success: boolean;
        message: string;
        order_id?: string;
        payment_url?: string;
        order_total?: number;
      }>('/order/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Error in checkout:', error);
      throw error;
    }
  }

  // COD Checkout with specific API endpoint and payload structure
  async checkoutCOD(orderData: {
    items: Array<{
      cart_id: number;
      id: number;
      name: string;
      price: string;
      quantity: number;
      image: string;
      color: string;
      slug: string;
    }>;
    address_id: number;
    shipping: number;
    payment_method: string;
    subtotal: number;
    shippingcost: number;
    tax: number;
    total: number;
    totalquantity: number;
    coupon_code?: string | null;
  }): Promise<{
    success: boolean;
    message: string;
    order_id?: string;
    order_number?: string;
    order?: any;
  }> {
    try {


      // Send the checkout request with original payload structure
      const checkoutPayload = orderData;

      const response = await this.fetchApi<{
        message: string;
        order: {
          order_id: string;
          customer_id: number;
          address_id: number;
          sub_total: number;
          quantity: number;
          total_amount: number;
          coupon: number;
          payment_method: string;
          payment_status: string;
          status: string;
          payment_details: string;
          updated_at: string;
          created_at: string;
          id: number;
          cart_items: Array<any>;
        };
      }>('/order/checkout', {
        method: 'POST',
        body: JSON.stringify(checkoutPayload),
      });



      // Transform response to match expected format
      return {
        success: true,
        message: response.message,
        order_id: response.order.order_id,
        order_number: response.order.order_id,
        order: response.order,
      };
    } catch (error) {
      console.error('Error in COD checkout:', error);

      // Return error response in expected format
      return {
        success: false,
        message: error instanceof Error ? error.message : 'COD checkout failed',
      };
    }
  }

  // Get orders list (independent endpoint)
  async getOrdersList(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    orders: ApiOrder[];
    current_page: number;
    last_page: number;
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

      const endpoint = queryParams.toString() ? `/orders?${queryParams.toString()}` : '/orders';
      const response = await this.fetchApi<{
        orders: ApiOrder[];
        current_page: number;
        last_page: number;
        total: number;
      }>(endpoint);

      return response;
    } catch (error) {
      console.error('Error fetching orders list:', error);
      return { orders: [], current_page: 1, last_page: 1, total: 0 };
    }
  }

  // Get order history
  async getOrderHistory(params?: {
    year?: number;
    month?: number;
    status?: string;
  }): Promise<{
    orders: ApiOrder[];
    total_spent: number;
    order_count: number;
    period: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month) queryParams.append('month', params.month.toString());
      if (params?.status) queryParams.append('status', params.status);

      const endpoint = queryParams.toString() ? '/orders/history?' + queryParams.toString() : '/orders/history';
      const response = await this.fetchApi<{
        orders: ApiOrder[];
        total_spent: number;
        order_count: number;
        period: string;
      }>(endpoint);

      return response;
    } catch (error) {
      console.error('Error fetching order history:', error);
      return { orders: [], total_spent: 0, order_count: 0, period: 'Unknown' };
    }
  }

  // ==================== ADDRESS OPERATIONS ====================

  // Get addresses (independent endpoint)
  async getAddressesIndependent(): Promise<ApiAddress[]> {
    try {
      const response = await this.fetchApi<ApiAddress[]>('/addresses');
      return response;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  // Get addresses index
  async getAddressesIndex(): Promise<{ addresses: ApiAddress[] }> {
    try {
      const response = await this.fetchApi<{ addresses: ApiAddress[] }>('/addressesind');
      return response;
    } catch (error) {
      console.error('Error fetching addresses index:', error);
      return { addresses: [] };
    }
  }

  // Update address
  async updateAddress(
    addressId: number,
    address: Partial<{
      name: string;
      type: string;
      address: string;
      city: string;
      state: string;
      postal: string;
      phone: string;
      isDefault: boolean;
    }>
  ): Promise<{ success: boolean; message: string; address?: ApiAddress }> {
    try {
      const response = await this.fetchApi<{
        success: boolean;
        message: string;
        address?: ApiAddress
      }>(`/ addresses / ${addressId} `, {
        method: 'PUT',
        body: JSON.stringify(address),
      });
      return response;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  async deleteAddress(addressId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>(`/ addresses / ${addressId} `, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // Get addresses in legacy format for backward compatibility
  async getLegacyAddresses(): Promise<ShippingAddress[]> {
    try {
      const apiAddresses = await this.getAddresses();

      // Transform API addresses to legacy format
      const legacyAddresses: ShippingAddress[] = apiAddresses.map(apiAddress => ({
        id: apiAddress.id.toString(),
        name: apiAddress.name,
        phone: apiAddress.phone,
        addressLine1: apiAddress.address,
        addressLine2: undefined,
        city: apiAddress.city,
        state: apiAddress.state,
        pincode: apiAddress.postal,
        isDefault: apiAddress.isDefault,
      }));

      return legacyAddresses;
    } catch (error) {
      console.error('Error fetching legacy addresses:', error);
      return [];
    }
  }


  // ==================== RECENTLY VIEWED OPERATIONS ====================

  // Get recently viewed products
  async getRecentlyViewed(): Promise<ApiProduct[]> {
    try {
      const response = await this.fetchApi<ApiProduct[]>('/recently-viewed');
      return response;
    } catch (error) {
      console.error('Error fetching recently viewed products:', error);
      return [];
    }
  }

  // Add product to recently viewed (with session token support)
  async addToRecentlyViewed(productId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Use different endpoints based on authentication status
      const endpoint = this.authToken ? '/recently-viewed' : '/guest/recently-viewed';

      const requestBody: any = { product_id: productId };

      // For guest users, add session token
      if (!this.authToken) {
        const sessionToken = this.getSessionToken();
        requestBody.session_token = sessionToken;

      }

      const response = await this.fetchApi<{ success: boolean; message: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      return response;
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
      // Return success for fallback to prevent blocking the user flow
      return { success: true, message: 'Added to recently viewed (offline mode)' };
    }
  }

  // Sync recently viewed products (for offline/online sync)
  async syncRecentlyViewed(productIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>('/sync-recently-viewed', {
        method: 'POST',
        body: JSON.stringify({ product_ids: productIds }),
      });
      return response;
    } catch (error) {
      console.error('Error syncing recently viewed:', error);
      throw error;
    }
  }

  // ==================== PAYMENT OPERATIONS ====================



  // Verify and save payment
  async verifyAndSavePayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id?: string;
    amount?: number;
  }): Promise<{
    success: boolean;
    message: string;
    order_id?: string;
    payment_status?: string;
  }> {
    try {
      const response = await this.fetchApi<{
        success: boolean;
        message: string;
        order_id?: string;
        payment_status?: string;
      }>('/paychecksave', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Get order details
  async getOrderDetails(orderId: string): Promise<{
    order: {
      id: string;
      order_number: string;
      status: string;
      total: number;
      items: ApiOrderItem[];
      shipping_address: ApiAddress;
      payment_method: string;
      payment_status: string;
      created_at: string;
      updated_at: string;
    };
  }> {
    try {
      const response = await this.fetchApi<{
        order: {
          id: string;
          order_number: string;
          status: string;
          total: number;
          items: ApiOrderItem[];
          shipping_address: ApiAddress;
          payment_method: string;
          payment_status: string;
          created_at: string;
          updated_at: string;
        };
      }>(`/ orderdetails / ${orderId} `);
      return response;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Generate order PDF invoice
  async generateOrderPDF(orderId: string): Promise<string> {
    try {
      // This returns a PDF download URL
      const pdfUrl = `${BASE_URL} /order/pdf / ${orderId} `;
      return pdfUrl;
    } catch (error) {
      console.error('Error generating order PDF:', error);
      throw error;
    }
  }

  // ==================== COMPREHENSIVE USER DATA UTILITIES ====================

  // Get user statistics and counts
  async getUserStatistics(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
    wishlistCount: number;
    addressCount: number;
    cartItemsCount: number;
    cartTotal: number;
  }> {
    try {
      const userData = await this.getUserData();

      const pendingOrders = userData.orders.filter(order =>
        order.status.toLowerCase() === 'pending'
      ).length;

      const completedOrders = userData.orders.filter(order =>
        order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'completed'
      ).length;

      const totalSpent = userData.orders.reduce((sum, order) =>
        sum + parseFloat(order.total), 0
      );

      return {
        totalOrders: userData.orders.length,
        pendingOrders,
        completedOrders,
        totalSpent,
        wishlistCount: userData.wishlists.length,
        addressCount: userData.addresses.length,
        cartItemsCount: userData.cart_items.items.reduce((sum, item) => sum + item.quantity, 0),
        cartTotal: userData.cart_items.total,
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);

      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        addressCount: 0,
        cartItemsCount: 0,
        cartTotal: 0,
      };
    }
  }

  // Get recent activity (latest orders and wishlist additions)
  async getRecentActivity(): Promise<{
    recentOrders: ApiOrder[];
    recentWishlistItems: ApiWishlistItem[];
  }> {
    try {
      const userData = await this.getUserData();

      // Get 3 most recent orders
      const recentOrders = userData.orders.slice(0, 3);

      // Get 5 most recent wishlist items
      const recentWishlistItems = userData.wishlists.slice(0, 5);

      return {
        recentOrders,
        recentWishlistItems,
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);

      return {
        recentOrders: [],
        recentWishlistItems: [],
      };
    }
  }

  // Search user's order history
  async searchOrders(query: string): Promise<ApiOrder[]> {
    try {
      const userData = await this.getUserData();

      const searchTerm = query.toLowerCase();
      const filteredOrders = userData.orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm))
      );

      return filteredOrders;
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  }

  // Handle OAuth callback (for web-based OAuth flow)
  async handleOAuthCallback(provider: 'google' | 'facebook' | 'apple', params: { [key: string]: string }): Promise<AuthResponse> {
    try {
      const baseUrl = BASE_URL.replace('/api', '');
      const callbackUrl = `${baseUrl} /auth/${provider}/callback`;

      const response = await this.fetchApi<AuthResponse>(callbackUrl.replace(baseUrl, ''), {
        method: 'POST',
        body: JSON.stringify({
          ...params,
          redirect_uri: 'appfashion://oauth/callback',
        }),
      });

      // Set auth token if login successful
      if (response.success && response.token) {
        this.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error(`Error handling ${provider} OAuth callback:`, error);
      throw error;
    }
  }

  // ==================== COLLECTIONS API ====================

  async getCollectionTypes(): Promise<ApiCollectionType[]> {
    try {


      const externalUrl = 'https://superadmin.samarsilkpalace.com/api/collection-types';
      const response = await fetch(externalUrl);
      const data = await response.json();


      return data;
    } catch (error) {
      console.error('❌ Error fetching collection types:', error);
      return [];
    }
  }

  // ==================== COLLECTIONS MANAGEMENT ====================

  async getFeaturedCollections(): Promise<ApiCollection[]> {
    try {

      const response = await this.fetchApi<ApiCollection[]>('/featured-collections');

      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        console.warn('Unexpected featured collections API response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching featured collections:', error);


      // Return mock data as fallback
      return [
        {
          id: 1,
          collection_type_id: 1,
          name: 'Bridal Collection',
          slug: 'bridal-collection',
          description: 'Exquisite bridal wear for your special day',
          banner_image: 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Bridal+Collection',
          thumbnail_image: 'https://via.placeholder.com/200x150/ff6b6b/ffffff?text=Bridal',
          collection_type: {
            id: 1,
            name: 'Bridal',
            slug: 'bridal',
          },
        },
        {
          id: 2,
          collection_type_id: 2,
          name: 'Festive Elegance',
          slug: 'festive-elegance',
          description: 'Traditional wear for festive occasions',
          banner_image: 'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Festive+Collection',
          thumbnail_image: 'https://via.placeholder.com/200x150/4ecdc4/ffffff?text=Festive',
          collection_type: {
            id: 2,
            name: 'Festive',
            slug: 'festive',
          },
        },
      ];
    }
  }

  async getAllCollections(): Promise<ApiCollection[]> {
    try {

      const response = await this.fetchApi<ApiCollection[]>('/collections');

      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).data) {
        return (response as any).data;
      } else {
        console.warn('Unexpected all collections API response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all collections:', error);


      // Return mock data as fallback
      return [
        {
          id: 3,
          collection_type_id: 3,
          name: 'Summer Collection',
          slug: 'summer-collection',
          description: 'Light and breezy summer wear',
          banner_image: 'https://via.placeholder.com/400x300/45b7d1/ffffff?text=Summer+Collection',
          thumbnail_image: 'https://via.placeholder.com/200x150/45b7d1/ffffff?text=Summer',
          collection_type: {
            id: 3,
            name: 'Seasonal',
            slug: 'seasonal',
          },
        },
        {
          id: 4,
          collection_type_id: 4,
          name: 'Designer Collection',
          slug: 'designer-collection',
          description: 'Exclusive designer pieces',
          banner_image: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Designer+Collection',
          thumbnail_image: 'https://via.placeholder.com/200x150/8b5cf6/ffffff?text=Designer',
          collection_type: {
            id: 4,
            name: 'Designer',
            slug: 'designer',
          },
        },
      ];
    }
  }

  async getCollectionBySlug(slug: string): Promise<ApiCollection | null> {
    try {


      const externalUrl = `https://superadmin.samarsilkpalace.com/api/collections/${slug}`;
      const response = await fetch(externalUrl);
      const data = await response.json();


      return data;
    } catch (error) {
      console.error('❌ Error fetching collection by slug:', error);
      return null;
    }
  }

  // ==================== MISSING METHODS IMPLEMENTATION ====================

  // Create new address
  async createAddress(addressData: {
    name: string;
    type: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal: string;
    isDefault: boolean;
  }): Promise<{ success: boolean; message: string; address?: ApiAddress }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string; address?: ApiAddress }>('/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
      return response;
    } catch (error) {
      console.error('Error creating address:', error);
      return { success: false, message: 'Failed to create address' };
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await this.fetchApi<any>('/payment-methods');

      // Handle nested response structure: {data: {payment_methods: []}}
      if (response && response.data && response.data.payment_methods && Array.isArray(response.data.payment_methods)) {
        return response.data.payment_methods;
      }

      // Fallback: check if payment_methods is at root level
      if (response && response.payment_methods && Array.isArray(response.payment_methods)) {
        return response.payment_methods;
      }

      // Fallback: check if response is already an array
      if (Array.isArray(response)) {
        return response;
      }

      console.warn('⚠️ Unexpected payment methods response structure:', response);
      console.warn('⚠️ Using fallback payment methods');
      return [
        { id: 'cod', type: 'COD', name: 'Cash on Delivery', details: 'Pay when you receive' },
        { id: 'razorpay', type: 'ONLINE', name: 'Online Payment', details: 'Credit/Debit Card, UPI, Netbanking', razorpay_enabled: true }
      ];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [
        { id: 'cod', type: 'COD', name: 'Cash on Delivery', details: 'Pay when you receive' },
        { id: 'razorpay', type: 'ONLINE', name: 'Online Payment', details: 'Credit/Debit Card, UPI, Netbanking', razorpay_enabled: true }
      ];
    }
  }

  // Get orders
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{ orders: ApiOrder[]; total: number; hasMore: boolean }> {
    try {
      const userData = await this.getUserData();
      let orders = userData.orders;

      if (params.status) {
        orders = orders.filter(order =>
          order.status.toLowerCase() === params.status?.toLowerCase()
        );
      }

      const startIndex = ((params.page || 1) - 1) * (params.limit || 10);
      const endIndex = startIndex + (params.limit || 10);
      const paginatedOrders = orders.slice(startIndex, endIndex);

      return {
        orders: paginatedOrders,
        total: orders.length,
        hasMore: endIndex < orders.length,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        orders: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  // Get orders in legacy format
  async getLegacyOrders(params: {
    page?: number;
    limit?: number;
    status?: Order['status'];
  } = {}): Promise<{ orders: Order[]; total: number; hasMore: boolean }> {
    try {
      const apiOrdersResponse = await this.getOrders(params);

      const legacyOrders: Order[] = apiOrdersResponse.orders.map(apiOrder => ({
        id: apiOrder.id,
        orderNumber: apiOrder.id,
        items: apiOrder.items.map(item => ({
          id: `order_item_${item.id}`,
          productId: item.id,
          product: {
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            images: Array.isArray(item.image) ? item.image : [item.image],
            slug: `product-${item.id}`,
            originalPrice: parseFloat(item.price),
            discountPercentage: 0,
            sku: `SKU-${item.id}`,
            colors: [],
            defaultVariantId: 1,
            variants: [],
            sizes: '',
            stock: 10,
            description: '',
            specifications: [],
            isBestseller: false,
            category: { id: 1, title: 'General', slug: 'general', summary: '', photo: '', is_parent: 0 }
          } as ApiProduct,
          quantity: item.quantity,
          addedAt: apiOrder.date,
          subtotal: parseFloat(item.price) * item.quantity,
        })) as CartItem[],
        status: apiOrder.status.toUpperCase() as Order['status'],
        paymentStatus: 'PENDING' as const,
        paymentMethod: { id: 'cod', type: 'COD', name: 'Cash on Delivery' },
        shippingAddress: {
          name: 'Customer',
          phone: '',
          addressLine1: '',
          city: '',
          state: '',
          pincode: ''
        },
        totalItems: apiOrder.items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: parseFloat(apiOrder.total),
        deliveryCharge: 0,
        finalAmount: parseFloat(apiOrder.total),
        placedAt: apiOrder.date,
        updatedAt: apiOrder.date,
      }));

      return {
        orders: legacyOrders,
        total: apiOrdersResponse.total,
        hasMore: apiOrdersResponse.hasMore,
      };
    } catch (error) {
      console.error('Error fetching legacy orders:', error);
      return {
        orders: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  // Get specific order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await this.fetchApi<Order>(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  }

  // Checkout with Razorpay
  async checkoutWithRazorpay(orderData: {
    items: Array<{
      cart_id: number;
      id: number;
      name: string;
      price: string;
      quantity: number;
      image: string;
      color: string;
      slug: string;
    }>;
    address_id: number;
    shipping: number;
    payment_method: string;
    subtotal: number;
    shippingcost: number;
    tax: number;
    total: number;
    totalquantity: number;
    coupon_code?: string | null;
  }): Promise<{
    success: boolean;
    message: string;
    order_id?: string;
    order_number?: string;
    order?: any;
    razorpay_order_id?: string;
    razorpay_key?: string;
    amount?: number;
    currency?: string;
  }> {
    try {


      const response = await this.fetchApi<{
        success: boolean;
        message: string;
        order_id?: string;
        order_number?: string;
        order?: any;
        razorpay_order_id?: string;
        razorpay_key?: string;
        amount?: number;
        currency?: string;
      }>('/order/checkout-razorpay', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });


      return response;
    } catch (error) {
      console.error('Error in Razorpay checkout:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Razorpay checkout failed',
      };
    }
  }
  // Create Razorpay order (matching web app)
  async createRazorpayOrder(orderData: any): Promise<any> {
    try {

      const response = await this.fetchApi<any>('/createrazorpayorder', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return response;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Save Razorpay payment (matching web app)
  async saveRazorpayPayment(userData: { response: any; orderData: any }): Promise<any> {
    try {

      const response = await this.fetchApi<any>('/paychecksave', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      console.error('Error saving Razorpay payment:', error);
      throw error;
    }
  }
  // Guest Wishlist APIs
  async guestAddToWishlist(sessionToken: string, productId: number, variantId?: number): Promise<any> {
    try {
      const response = await this.fetchApi<any>('/guest/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionToken,
          product_id: productId,
          product_variant_id: variantId
        }),
      });
      return response;
    } catch (error) {
      console.error('Error adding to guest wishlist:', error);
      throw error;
    }
  }

  async guestRemoveFromWishlist(sessionToken: string, productId: number, variantId?: number): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('session_token', sessionToken);
      if (variantId) {
        queryParams.append('product_variant_id', variantId.toString());
      }

      const response = await this.fetchApi<any>(`/guest/wishlist/${productId}?${queryParams.toString()}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error removing from guest wishlist:', error);
      throw error;
    }
  }

  async guestGetWishlist(sessionToken: string): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('session_token', sessionToken);

      const response = await this.fetchApi<any>(`/guest/wishlist?${queryParams.toString()}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching guest wishlist:', error);
      throw error;
    }
  }

  async guestCheckWishlist(sessionToken: string, productId: number, variantId?: number): Promise<any> {
    try {
      const response = await this.fetchApi<any>('/guest/checkwishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionToken,
          product_id: productId,
          product_variant_id: variantId
        }),
      });
      return response;
    } catch (error) {
      console.error('Error checking guest wishlist:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
