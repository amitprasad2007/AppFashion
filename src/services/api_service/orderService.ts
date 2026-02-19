import { CartService } from './cartService';
import { ApiOrder, ApiAddress, ApiProduct, Order, ShippingAddress, PaymentMethod, OrderStatusUpdate } from './types';
import { getApiBaseUrl } from '../../utils/networkConfig';

export class OrderService extends CartService {
    async getCheckoutCart(): Promise<any> {
        try {
            return await this.fetchApi('/cart/checkout');
        } catch (error) {
            console.error('Error fetching checkout cart:', error);
            throw error;
        }
    }

    async getCartSummary(addressId?: number | string): Promise<any> {
        try {
            const qs = addressId ? `?address_id=${addressId}` : '';
            return await this.fetchApi(`/cart/summary${qs}`);
        } catch (error) {
            console.error('Error fetching cart summary:', error);
            throw error;
        }
    }

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        return [
            { id: 'cod', type: 'COD', name: 'Cash on Delivery', details: 'Pay when you receive your order' },
            { id: 'online', type: 'ONLINE', name: 'Online Payment', details: 'Pay using PhonePe, GPay, Paytm, etc.' },
        ];
    }

    async checkout(addressId: number, paymentMethod: string, notes?: string): Promise<any> {
        try {
            const payload = { address_id: addressId, payment_method: paymentMethod, notes };
            return await this.fetchApi('/order/checkout', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Error in checkout:', error);
            throw error;
        }
    }

    async checkoutCOD(orderData: any): Promise<any> {
        try {
            const response = await this.fetchApi<any>('/order/checkout', {
                method: 'POST',
                body: JSON.stringify(orderData),
            });
            return {
                success: true,
                message: response.message,
                order_id: response.order.order_id,
                order: response.order,
            };
        } catch (error) {
            console.error('Error in COD checkout:', error);
            return { success: false, message: error instanceof Error ? error.message : 'COD failed' };
        }
    }

    async getOrdersList(params?: any): Promise<any> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
            const endpoint = queryParams.toString() ? `/orders?${queryParams.toString()}` : '/orders';
            return await this.fetchApi(endpoint);
        } catch (error) {
            console.error('Error fetching orders list:', error);
            return { orders: [], current_page: 1, last_page: 1, total: 0 };
        }
    }

    async getOrderDetails(orderId: string): Promise<any> {
        try {
            return await this.fetchApi(`/orders/${orderId}`);
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }

    async cancelOrder(orderId: string, reason?: string): Promise<any> {
        try {
            return await this.fetchApi(`/orders/${orderId}/cancel`, {
                method: 'POST',
                body: JSON.stringify({ reason }),
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    async getOrderTracking(orderId: string): Promise<any> {
        try {
            return await this.fetchApi<OrderStatusUpdate[]>(`/orders/${orderId}/tracking`);
        } catch (error) {
            console.error('Error order tracking:', error);
            return [];
        }
    }

    async getOrders(params: { page?: number; limit?: number; status?: string } = {}): Promise<any> {
        try {
            const userData = await this.getUserData();
            let orders = userData.orders;
            if (params.status) {
                orders = orders.filter(order => order.status.toLowerCase() === params.status?.toLowerCase());
            }
            const startIndex = ((params.page || 1) - 1) * (params.limit || 10);
            const endIndex = startIndex + (params.limit || 10);
            return { orders: orders.slice(startIndex, endIndex), total: orders.length, hasMore: endIndex < orders.length };
        } catch (error) {
            console.error('Error fetching orders:', error);
            return { orders: [], total: 0, hasMore: false };
        }
    }

    async getOrderById(orderId: string): Promise<any> {
        try {
            return await this.fetchApi<any>(`/orders/${orderId}`);
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            return null;
        }
    }

    async checkoutWithRazorpay(orderData: any): Promise<any> {
        try {
            return await this.fetchApi('/order/checkout-razorpay', { method: 'POST', body: JSON.stringify(orderData) });
        } catch (error) {
            console.error('Error in Razorpay checkout:', error);
            throw error;
        }
    }

    async createRazorpayOrder(orderData: any): Promise<any> {
        try {
            return await this.fetchApi('/createrazorpayorder', { method: 'POST', body: JSON.stringify(orderData) });
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            throw error;
        }
    }

    async saveRazorpayPayment(userData: { response: any; orderData: any }): Promise<any> {
        try {
            return await this.fetchApi('/paychecksave', { method: 'POST', body: JSON.stringify(userData) });
        } catch (error) {
            console.error('Error saving Razorpay payment:', error);
            throw error;
        }
    }

    async verifyAndSavePayment(paymentData: any): Promise<any> {
        try {
            return await this.fetchApi('/paychecksave', { method: 'POST', body: JSON.stringify(paymentData) });
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    async generateOrderPDF(orderId: string): Promise<string> {
        return `${getApiBaseUrl().replace('/api', '')}/order/pdf/${orderId}`;
    }
}
