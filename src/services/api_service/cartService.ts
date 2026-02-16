// Cart, Wishlist and Recently Viewed API methods
import { AuthService } from './authService';
import { ApiCart, ApiProduct, ApiWishlistItem, ApiCartItem } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class CartService extends AuthService {
    async getCart(): Promise<ApiCart> {
        try {
            const userData = await this.getUserData();
            return userData.cart_items;
        } catch (error) {
            console.error('Error fetching cart:', error);
            return { items: [], subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 };
        }
    }

    async clearCart(): Promise<{ success: boolean; message: string }> {
        try {
            try {
                await this.fetchApi('/cart/clear', { method: 'POST' });
            } catch (e) {
                console.warn('Failed server cart clear');
            }
            await AsyncStorage.removeItem('cart');
            return { success: true, message: 'Cart cleared' };
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    async addToCart(productId: number, quantity: number = 1, options?: any): Promise<any> {
        try {
            const payload = {
                product_id: productId,
                quantity,
                variant_id: options?.variant_id,
                size: options?.size,
                color: options?.color,
            };
            return await this.fetchApi('/cart/add', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async updateCartItem(cartItemId: number, quantity: number): Promise<any> {
        try {
            return await this.fetchApi('/cart/update', {
                method: 'PUT',
                body: JSON.stringify({ cart_id: cartItemId, quantity }),
            });
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    }

    async removeFromCart(cartId: number, productId: number, variantId?: number): Promise<any> {
        try {
            return await this.fetchApi('/cart/remove', {
                method: 'DELETE',
                body: JSON.stringify({
                    cart_id: cartId,
                    product_id: productId,
                    product_variant_id: variantId || null
                }),
            });
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }

    async getWishlist(): Promise<ApiWishlistItem[]> {
        try {
            const userData = await this.getUserData();
            return userData.wishlists;
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            return [];
        }
    }

    async getWishlistItems(): Promise<ApiProduct[]> {
        try {
            let endpoint = this.authToken ? '/wishlist' : '/guest/wishlist';
            if (!this.authToken) {
                const sessionToken = await this.getSessionToken();
                if (sessionToken) endpoint += `?session_token=${encodeURIComponent(sessionToken)}`;
            }
            const response = await this.fetchApi<any>(endpoint);
            let products: ApiProduct[] = [];
            if (Array.isArray(response)) products = response;
            else if (response && response.data) products = response.data;
            else if (response && response.wishlist_items) products = response.wishlist_items;
            return products;
        } catch (error) {
            console.error('Error fetching wishlist items:', error);
            return [];
        }
    }

    async addToWishlist(productId: number, variantId?: number): Promise<any> {
        try {
            const payload: any = { product_id: productId, product_variant_id: variantId || null };
            const response = await this.fetchApi<any>('/wishlist', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            if (response && response.status === 'ok') return { success: true, message: 'Added to wishlist' };
            return response;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw error;
        }
    }

    async removeFromWishlist(productId: number, variantId?: number): Promise<any> {
        try {
            let endpoint = `/wishlist/${productId}`;
            if (variantId) endpoint += `?product_variant_id=${variantId}`;
            const response = await this.fetchApi<any>(endpoint, { method: 'DELETE' });
            if (response && response.status === 'ok') return { success: true, message: 'Removed from wishlist' };
            return response;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw error;
        }
    }

    async removeFromWishlistById(wishlistId: number): Promise<any> {
        try {
            return await this.fetchApi(`/wishlistremovebyid/${wishlistId}`, { method: 'POST' });
        } catch (error) {
            console.error('Error removing from wishlist by ID:', error);
            throw error;
        }
    }

    async guestAddToWishlist(sessionToken: string, productId: number, variantId?: number): Promise<any> {
        try {
            return await this.fetchApi('/guest/wishlist', {
                method: 'POST',
                body: JSON.stringify({ session_token: sessionToken, product_id: productId, product_variant_id: variantId }),
            });
        } catch (error) {
            console.error('Error adding to guest wishlist:', error);
            throw error;
        }
    }

    async guestRemoveFromWishlist(sessionToken: string, productId: number, variantId?: number): Promise<any> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('session_token', sessionToken);
            if (variantId) queryParams.append('product_variant_id', variantId.toString());
            return await this.fetchApi(`/guest/wishlist/${productId}?${queryParams.toString()}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error removing from guest wishlist:', error);
            throw error;
        }
    }

    async guestGetWishlist(sessionToken: string): Promise<any> {
        try {
            return await this.fetchApi(`/guest/wishlist?session_token=${encodeURIComponent(sessionToken)}`);
        } catch (error) {
            console.error('Error fetching guest wishlist:', error);
            throw error;
        }
    }

    async checkWishlist(productId: number, variantId?: number): Promise<{ in_wishlist: boolean; wishlist_id?: number }> {
        try {
            const endpoint = this.authToken ? '/checkwishlist' : '/guest/checkwishlist';
            const body: any = { product_id: productId, product_variant_id: variantId || null };
            if (!this.authToken) body.session_token = await this.getSessionToken();
            const response = await this.fetchApi<any>(endpoint, { method: 'POST', body: JSON.stringify(body) });
            if (typeof response === 'number') return { in_wishlist: response > 0 };
            return { in_wishlist: !!(response?.in_wishlist || response?.success), wishlist_id: response?.wish_id };
        } catch (error) {
            console.error('Error checking wishlist:', error);
            return { in_wishlist: false };
        }
    }

    async guestCheckWishlist(sessionToken: string, productId: number, variantId?: number): Promise<any> {
        try {
            return await this.fetchApi('/guest/checkwishlist', {
                method: 'POST',
                body: JSON.stringify({ session_token: sessionToken, product_id: productId, product_variant_id: variantId }),
            });
        } catch (error) {
            console.error('Error checking guest wishlist:', error);
            throw error;
        }
    }

    async addToRecentlyViewed(productId: number, variantId?: number): Promise<any> {
        try {
            const endpoint = this.authToken ? '/recently-viewed' : '/guest/recently-viewed';
            const body: any = { product_id: productId, product_variant_id: variantId || null };
            if (!this.authToken) body.session_token = await this.getSessionToken();
            const response = await this.fetchApi<any>(endpoint, { method: 'POST', body: JSON.stringify(body) });
            if (response && response.status === 'ok') return { success: true, message: 'Added to recently viewed' };
            return response;
        } catch (error) {
            console.error('Error adding recently viewed:', error);
            return { success: true };
        }
    }

    async getRecentlyViewed(): Promise<ApiProduct[]> {
        return this.getRecentlyViewedItems();
    }

    async getRecentlyViewedItems(): Promise<ApiProduct[]> {
        try {
            const endpoint = this.authToken ? '/recently-viewed' : '/guest/recently-viewed';
            const query = !this.authToken ? `?session_token=${encodeURIComponent(await this.getSessionToken())}` : '';
            const response = await this.fetchApi<any>(`${endpoint}${query}`);
            if (Array.isArray(response)) return response;
            return response?.data || [];
        } catch (error) {
            console.error('Error fetching recently viewed items:', error);
            return [];
        }
    }

    async buyNow(productId: number, quantity: number, options?: any): Promise<any> {
        try {
            const payload = { product_id: productId, quantity, variant_id: options?.variant_id, size: options?.size, color: options?.color };
            return await this.fetchApi('/order/buy-now', { method: 'POST', body: JSON.stringify(payload) });
        } catch (error) {
            console.error('Error in buy now:', error);
            throw error;
        }
    }

    async syncWishlist(wishlistItems: { product_id: number }[]): Promise<any> {
        return this.fetchApi('/sync-wishlist', { method: 'POST', body: JSON.stringify({ wishlist_items: wishlistItems }) });
    }

    async syncRecentlyViewed(items: { product_id: number; product_variant_id?: number }[]): Promise<any> {
        return this.fetchApi('/sync-recently-viewed', { method: 'POST', body: JSON.stringify({ recently_viewed: items }) });
    }
}
