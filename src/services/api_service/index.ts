// API service for AppFashion - Entry point
import { PolicyService } from './policyService';
import { ApiProduct, Cart, ShippingAddress, ApiCart, CartItem } from './types';

// Export all types for convenience
export * from './types';

class AppApiService extends PolicyService {
    // ==================== LEGACY & BACKWARD COMPATIBILITY ====================

    // Get cart items in legacy format
    async getLegacyCart(): Promise<Cart> {
        try {
            const apiCart = await this.getCart();
            const legacyItems: CartItem[] = apiCart.items.map(item => ({
                id: `cart_item_${item.id}`,
                productId: item.id,
                product: {
                    id: item.id,
                    name: item.name,
                    price: parseFloat(item.price),
                    images: item.image,
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
                subtotal: parseFloat(item.price || '0') * (item.quantity || 0),
            })) || [];

            return {
                id: 'user_cart',
                items: legacyItems,
                totalItems: (apiCart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
                totalAmount: apiCart.subtotal || 0,
                discount: apiCart.discount || 0,
                deliveryCharge: apiCart.shipping || 0,
                finalAmount: apiCart.total || 0,
                updatedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error fetching legacy cart:', error);
            return { id: 'empty_cart', items: [], totalItems: 0, totalAmount: 0, finalAmount: 0, updatedAt: new Date().toISOString() };
        }
    }

    // Get product details by ID (deprecated)
    async getProductDetails(productId: number): Promise<ApiProduct | null> {
        console.warn('getProductDetails by ID is deprecated. Use getProductBySlug instead.');
        return await this.fetchApi<ApiProduct>(`/getProductDetails/${productId}`);
    }

    // Backward compatibility - get product by ID or slug
    async getProductById(productIdOrSlug: string | number): Promise<ApiProduct | null> {
        if (typeof productIdOrSlug === 'number') {
            console.warn('Using numeric product ID - consider using product slugs instead');
            return null;
        }
        return await this.getProductBySlug(productIdOrSlug as string);
    }

    // Get addresses in legacy format
    async getLegacyAddresses(): Promise<ShippingAddress[]> {
        try {
            const apiAddresses = await this.getAddresses();
            return apiAddresses.map(apiAddress => ({
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
        } catch (error) {
            console.error('Error fetching legacy addresses:', error);
            return [];
        }
    }

    // Get user statistics and counts
    async getUserStatistics(): Promise<any> {
        try {
            const userData = await this.getUserData();
            const orders = userData.orders || [];
            const wishlists = userData.wishlists || [];
            const addresses = userData.addresses || [];
            const cart_items = userData.cart_items || { items: [], total: 0 };

            const pendingOrders = orders.filter((order: any) => order.status && order.status.toLowerCase() === 'pending').length;
            const completedOrders = orders.filter((order: any) => order.status && ['delivered', 'completed'].includes(order.status.toLowerCase())).length;
            const totalSpent = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total || '0'), 0);

            return {
                totalOrders: orders.length,
                pendingOrders,
                completedOrders,
                totalSpent,
                wishlistCount: wishlists.length,
                addressCount: addresses.length,
                cartItemsCount: (cart_items.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
                cartTotal: cart_items.total || 0,
            };
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            return { totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalSpent: 0, wishlistCount: 0, addressCount: 0, cartItemsCount: 0, cartTotal: 0 };
        }
    }

    // Get recent activity (latest orders and wishlist additions)
    async getRecentActivity(): Promise<any> {
        try {
            const userData = await this.getUserData();
            return {
                recentOrders: (userData.orders || []).slice(0, 3),
                recentWishlistItems: (userData.wishlists || []).slice(0, 5),
            };
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            return { recentOrders: [], recentWishlistItems: [] };
        }
    }

    // Search user's order history
    async searchOrders(query: string): Promise<any[]> {
        try {
            const userData = await this.getUserData();
            const searchTerm = (query || '').toLowerCase();
            const orders = userData.orders || [];

            return orders.filter(order =>
                (order.id && order.id.toLowerCase().includes(searchTerm)) ||
                (order.items && order.items.some(item => item.name && item.name.toLowerCase().includes(searchTerm)))
            );
        } catch (error) {
            console.error('Error searching orders:', error);
            return [];
        }
    }
}

// Create and export singleton instance
export const apiService = new AppApiService();
export default apiService;
