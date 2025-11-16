import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, UserData, ApiOrder, ApiWishlistItem, ApiAddress, ApiCart } from '../services/api';
import { useAuth } from './AuthContext';

interface UserProfileContextType {
  userData: UserData | null;
  userStatistics: UserStatistics | null;
  recentActivity: RecentActivity | null;
  isLoading: boolean;
  error: string | null;
  
  // Core data methods
  refreshUserData: () => Promise<void>;
  getOrders: (params?: { status?: string; page?: number; limit?: number }) => Promise<ApiOrder[]>;
  getWishlist: () => Promise<ApiWishlistItem[]>;
  getAddresses: () => Promise<ApiAddress[]>;
  getCart: () => Promise<ApiCart>;
  getUserStatistics: () => Promise<UserStatistics>;
  searchOrders: (query: string) => Promise<ApiOrder[]>;
  
  // Cart operations
  addToCart: (productId: number, quantity?: number, options?: { size?: string; color?: string; variant_id?: number }) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  getCartSummary: () => Promise<{ total_items: number; subtotal: number; total: number; discount: number; shipping: number; tax: number; }>;
  
  // Wishlist operations
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  removeFromWishlistById: (wishlistId: number) => Promise<void>;
  checkWishlist: (productId: number) => Promise<{ in_wishlist: boolean; wishlist_id?: number }>;
  
  // Address operations
  createAddress: (address: { name: string; type: string; address: string; city: string; state: string; postal: string; phone: string; isDefault?: boolean; }) => Promise<void>;
  updateAddress: (addressId: number, address: Partial<{ name: string; type: string; address: string; city: string; state: string; postal: string; phone: string; isDefault: boolean; }>) => Promise<void>;
  deleteAddress: (addressId: number) => Promise<void>;
  
  // Order operations
  buyNow: (productId: number, quantity: number, options?: { size?: string; color?: string; variant_id?: number }) => Promise<{ success: boolean; message: string; order_id?: string; payment_url?: string }>;
  checkout: (addressId: number, paymentMethod: string, notes?: string) => Promise<{ success: boolean; message: string; order_id?: string; payment_url?: string; order_total?: number; }>;
  
  // Recently viewed
  getRecentlyViewed: () => Promise<ApiProduct[]>;
  addToRecentlyViewed: (productId: number) => Promise<void>;
}

interface UserStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  wishlistCount: number;
  addressCount: number;
  cartItemsCount: number;
  cartTotal: number;
}

interface RecentActivity {
  recentOrders: ApiOrder[];
  recentWishlistItems: ApiWishlistItem[];
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh user data from API
  const refreshUserData = async () => {
    if (!authState.isAuthenticated || !authState.token) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Refreshing user data...');
      
      // Fetch comprehensive user data
      const freshUserData = await apiService.getUserData();
      setUserData(freshUserData);

      // Fetch user statistics
      const stats = await apiService.getUserStatistics();
      setUserStatistics(stats);

      // Fetch recent activity
      const activity = await apiService.getRecentActivity();
      setRecentActivity(activity);

      console.log('✅ User data refreshed successfully');
      
    } catch (error: any) {
      console.error('❌ Error refreshing user data:', error);
      setError(error.message || 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get orders with optional filtering
  const getOrders = async (params: { 
    status?: string; 
    page?: number; 
    limit?: number 
  } = {}): Promise<ApiOrder[]> => {
    try {
      const response = await apiService.getOrders(params);
      return response.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  // Get wishlist items
  const getWishlist = async (): Promise<ApiWishlistItem[]> => {
    try {
      return await apiService.getWishlist();
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  };

  // Get addresses
  const getAddresses = async (): Promise<ApiAddress[]> => {
    try {
      return await apiService.getAddresses();
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  };

  // Get cart
  const getCart = async (): Promise<ApiCart> => {
    try {
      return await apiService.getCart();
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      };
    }
  };

  // Get user statistics
  const getUserStatistics = async (): Promise<UserStatistics> => {
    try {
      return await apiService.getUserStatistics();
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
  };

  // Search orders
  const searchOrders = async (query: string): Promise<ApiOrder[]> => {
    try {
      return await apiService.searchOrders(query);
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId: number): Promise<void> => {
    try {
      await apiService.addToWishlist(productId);
      // Refresh user data to update wishlist
      await refreshUserData();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  // Remove from wishlist (by product ID)
  const removeFromWishlist = async (productId: number): Promise<void> => {
    try {
      await apiService.removeFromWishlist(productId);
      // Refresh user data to update wishlist
      await refreshUserData();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  // Remove from wishlist (by wishlist ID)
  const removeFromWishlistById = async (wishlistId: number): Promise<void> => {
    try {
      await apiService.removeFromWishlistById(wishlistId);
      // Refresh user data to update wishlist
      await refreshUserData();
    } catch (error) {
      console.error('Error removing from wishlist by ID:', error);
      throw error;
    }
  };

  // Check if product is in wishlist
  const checkWishlist = async (productId: number): Promise<{ in_wishlist: boolean; wishlist_id?: number }> => {
    try {
      return await apiService.checkWishlist(productId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return { in_wishlist: false };
    }
  };

  // Cart operations
  const addToCart = async (
    productId: number, 
    quantity: number = 1,
    options?: { size?: string; color?: string; variant_id?: number }
  ): Promise<void> => {
    try {
      await apiService.addToCart(productId, quantity, options);
      // Refresh user data to update cart
      await refreshUserData();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number): Promise<void> => {
    try {
      await apiService.updateCartItem(cartItemId, quantity);
      // Refresh user data to update cart
      await refreshUserData();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<void> => {
    try {
      await apiService.removeFromCart(cartItemId);
      // Refresh user data to update cart
      await refreshUserData();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const getCartSummary = async (): Promise<{
    total_items: number;
    subtotal: number;
    total: number;
    discount: number;
    shipping: number;
    tax: number;
  }> => {
    try {
      return await apiService.getCartSummary();
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      return {
        total_items: 0,
        subtotal: 0,
        total: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
      };
    }
  };

  // Address operations
  const createAddress = async (address: {
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    postal: string;
    phone: string;
    isDefault?: boolean;
  }): Promise<void> => {
    try {
      await apiService.createAddress(address);
      // Refresh user data to update addresses
      await refreshUserData();
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  };

  const updateAddress = async (
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
  ): Promise<void> => {
    try {
      await apiService.updateAddress(addressId, address);
      // Refresh user data to update addresses
      await refreshUserData();
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  const deleteAddress = async (addressId: number): Promise<void> => {
    try {
      await apiService.deleteAddress(addressId);
      // Refresh user data to update addresses
      await refreshUserData();
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  };

  // Order operations
  const buyNow = async (
    productId: number,
    quantity: number,
    options?: { size?: string; color?: string; variant_id?: number }
  ): Promise<{ success: boolean; message: string; order_id?: string; payment_url?: string }> => {
    try {
      const result = await apiService.buyNow(productId, quantity, options);
      // Refresh user data to update orders
      if (result.success) {
        await refreshUserData();
      }
      return result;
    } catch (error) {
      console.error('Error in buy now:', error);
      throw error;
    }
  };

  const checkout = async (
    addressId: number,
    paymentMethod: string,
    notes?: string
  ): Promise<{ 
    success: boolean; 
    message: string; 
    order_id?: string; 
    payment_url?: string;
    order_total?: number;
  }> => {
    try {
      const result = await apiService.checkout(addressId, paymentMethod, notes);
      // Refresh user data to update orders and cart
      if (result.success) {
        await refreshUserData();
      }
      return result;
    } catch (error) {
      console.error('Error in checkout:', error);
      throw error;
    }
  };

  // Recently viewed operations
  const getRecentlyViewed = async (): Promise<ApiProduct[]> => {
    try {
      return await apiService.getRecentlyViewed();
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      return [];
    }
  };

  const addToRecentlyViewed = async (productId: number): Promise<void> => {
    try {
      await apiService.addToRecentlyViewed(productId);
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
      // Don't throw error for recently viewed as it's not critical
    }
  };

  // Load user data when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      refreshUserData();
    } else {
      // Clear data when not authenticated
      setUserData(null);
      setUserStatistics(null);
      setRecentActivity(null);
      setError(null);
    }
  }, [authState.isAuthenticated, authState.token]);

  const contextValue: UserProfileContextType = {
    userData,
    userStatistics,
    recentActivity,
    isLoading,
    error,
    refreshUserData,
    getOrders,
    getWishlist,
    getAddresses,
    getCart,
    getUserStatistics,
    searchOrders,
    
    // Cart operations
    addToCart,
    updateCartItem,
    removeFromCart,
    getCartSummary,
    
    // Wishlist operations
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistById,
    checkWishlist,
    
    // Address operations
    createAddress,
    updateAddress,
    deleteAddress,
    
    // Order operations
    buyNow,
    checkout,
    
    // Recently viewed
    getRecentlyViewed,
    addToRecentlyViewed,
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Custom hook to use user profile context
export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export default UserProfileContext;