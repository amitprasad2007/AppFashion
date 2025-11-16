// API service for AppFashion
import { getApiBaseUrl, API_CONFIG } from '../utils/networkConfig';

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
    color: string;
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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  preferences?: {
    newsletter: boolean;
    sms: boolean;
    pushNotifications: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Cart and Order Interfaces
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
  type: 'COD' | 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  name: string;
  details?: string;
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

  // Set authentication token for API requests
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      // 🔍 Log network requests for debugging
      console.log('🌐 API Request:', {
        url: `${BASE_URL}${endpoint}`,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? JSON.parse(options.body as string) : undefined
      });

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
        throw new Error(`HTTP error! status: ${response.status}`);
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
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          parseError: parseError
        });
        throw new Error(`Invalid JSON response from ${endpoint}: ${parseError}`);
      }
      
      // 🔍 Log network responses for debugging
      console.log('📡 API Response:', {
        url: `${BASE_URL}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
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
      console.log('🔄 Using mock data for banners');
      
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
      console.log('🔄 Using mock data for categories');
      
      // Return mock data as fallback
      return [
        {
          id: '1',
          name: 'Traditional Sarees',
          image: 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Traditional',
          description: 'Classic traditional sarees',
          itemCount: 120,
        },
        {
          id: '2',
          name: 'Silk Sarees',
          image: 'https://via.placeholder.com/200x200/4ecdc4/ffffff?text=Silk',
          description: 'Premium silk collections',
          itemCount: 85,
        },
        {
          id: '3',
          name: 'Cotton Sarees',
          image: 'https://via.placeholder.com/200x200/45b7d1/ffffff?text=Cotton',
          description: 'Comfortable cotton wear',
          itemCount: 95,
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
          id: '1',
          name: 'Elegant Saree Collection',
          price: '₹2,499',
          image: 'https://via.placeholder.com/300x400/ff6b6b/ffffff?text=Saree+1',
          rating: 4.8,
          description: 'Beautiful traditional saree with modern touch',
          category: 'Traditional Wear',
          discount: 20,
          inStock: true,
        },
        {
          id: '2',
          name: 'Designer Silk Saree',
          price: '₹3,999',
          image: 'https://via.placeholder.com/300x400/4ecdc4/ffffff?text=Saree+2',
          rating: 4.9,
          description: 'Premium silk saree for special occasions',
          category: 'Silk Sarees',
          discount: 15,
          inStock: true,
        },
        {
          id: '3',
          name: 'Cotton Comfort Saree',
          price: '₹1,299',
          image: 'https://via.placeholder.com/300x400/45b7d1/ffffff?text=Saree+3',
          rating: 4.6,
          description: 'Comfortable cotton saree for daily wear',
          category: 'Cotton Sarees',
          discount: 10,
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
    type?: 'featured' | 'bestseller' | 'recommended' | 'all';
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
      if (params.type === 'recommended') {
        return await this.getRecommendedProducts();
      }
      
      // For category-based or general product requests, use featured as fallback
      // since /products endpoint doesn't exist in your backend
      console.log('Using featured products as fallback for general product request');
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

  // Add method for recommended products
  async getRecommendedProducts(): Promise<ApiProduct[]> {
    try {
      const response = await this.fetchApi<ApiProduct[]>('/recommeded-products'); // Note: typo in your API
      return Array.isArray(response) ? response : (response as any)?.data || [];
    } catch (error) {
      console.error('Error fetching recommended products:', error);
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
      const response = await this.fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // Set auth token if login successful
      if (response.success && response.token) {
        this.setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
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
      const response = await this.fetchApi<{ user: AuthUser }>('/auth/me');
      return response.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
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
      console.log('🔄 Using mock OAuth response for development');
      const mockResponse: AuthResponse = {
        success: true,
        message: `Mock ${provider} login successful`,
        user: {
          id: 'mock_' + Date.now(),
          firstName: 'Test',
          lastName: 'User',
          email: userInfo?.email || 'test@example.com',
          phone: '',
          avatar: userInfo?.photo,
          isVerified: true,
          createdAt: new Date().toISOString(),
          preferences: {
            newsletter: true,
            sms: false,
            pushNotifications: true,
          },
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
  getOAuthRedirectUrl(provider: 'google' | 'facebook'): string {
    const baseUrl = BASE_URL.replace('/api', ''); // Remove /api to get base URL
    return `${baseUrl}/auth/${provider}`;
  }

  // ==================== CART MANAGEMENT ====================
  
  // Get current user's cart
  async getCart(): Promise<Cart> {
    try {
      const response = await this.fetchApi<Cart>('/cart');
      return response;
    } catch (error) {
      console.error('Error fetching cart:', error);
      
      // Return empty cart as fallback
      return {
        id: 'local_cart_' + Date.now(),
        items: [],
        totalItems: 0,
        totalAmount: 0,
        finalAmount: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Add item to cart
  async addToCart(productId: number, quantity: number = 1, options: {
    size?: string;
    color?: string;
  } = {}): Promise<Cart> {
    try {
      const response = await this.fetchApi<Cart>('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity,
          selectedSize: options.size,
          selectedColor: options.color,
        }),
      });
      return response;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item
  async updateCartItem(cartItemId: string, updates: {
    quantity?: number;
    size?: string;
    color?: string;
  }): Promise<Cart> {
    try {
      const response = await this.fetchApi<Cart>(`/cart/items/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<Cart> {
    try {
      const response = await this.fetchApi<Cart>(`/cart/items/${cartItemId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>('/cart/clear', {
        method: 'DELETE',
      });
      return response;
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

  // ==================== ORDER MANAGEMENT ====================

  // Get user's order history
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: Order['status'];
  } = {}): Promise<{ orders: Order[]; total: number; hasMore: boolean }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const endpoint = queryParams.toString() ? `/orders?${queryParams.toString()}` : '/orders';
      const response = await this.fetchApi<{ orders: Order[]; total: number; hasMore: boolean }>(endpoint);
      
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Return empty orders as fallback
      return {
        orders: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  // Get specific order details
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await this.fetchApi<Order>(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
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

  // ==================== SHIPPING & PAYMENT ====================

  // Get user's saved addresses
  async getAddresses(): Promise<ShippingAddress[]> {
    try {
      const response = await this.fetchApi<ShippingAddress[]>('/addresses');
      return response;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  // Save new address
  async saveAddress(address: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> {
    try {
      const response = await this.fetchApi<ShippingAddress>('/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });
      return response;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }

  // Update existing address
  async updateAddress(addressId: string, updates: Partial<ShippingAddress>): Promise<ShippingAddress> {
    try {
      const response = await this.fetchApi<ShippingAddress>(`/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.fetchApi<{ success: boolean; message: string }>(`/addresses/${addressId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await this.fetchApi<PaymentMethod[]>('/payment/methods');
      return response;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      
      // Return default payment methods as fallback
      return [
        { id: 'cod', type: 'COD', name: 'Cash on Delivery' },
        { id: 'upi', type: 'UPI', name: 'UPI Payment' },
        { id: 'card', type: 'CARD', name: 'Credit/Debit Card' },
        { id: 'netbanking', type: 'NETBANKING', name: 'Net Banking' },
      ];
    }
  }

  // Handle OAuth callback (for web-based OAuth flow)
  async handleOAuthCallback(provider: 'google' | 'facebook', params: { [key: string]: string }): Promise<AuthResponse> {
    try {
      const baseUrl = BASE_URL.replace('/api', '');
      const callbackUrl = `${baseUrl}/auth/${provider}/callback`;
      
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
}

export const apiService = new ApiService();
export default apiService;