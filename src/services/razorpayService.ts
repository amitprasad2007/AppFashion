import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';
import { PaymentMethod, ShippingAddress, apiService } from './api';

export interface RazorpayConfig {
  key_id: string;
  key_secret: string;
  webhook_secret?: string;
}

export interface RazorpayPaymentData {
  amount: number; // Amount in paise (multiply by 100)
  currency: string;
  key?: string;
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  description: any;
  notes?: Record<string, string>;
  prefill?: {
    email: string;
    contact: string;
    name: string;
  };
  theme?: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, any>;
}

class RazorpayService {
  private config: RazorpayConfig | null = null;

  // Initialize Razorpay with configuration
  initialize(config: RazorpayConfig) {
    this.config = config;
  }

  // Check if Razorpay is properly configured
  isConfigured(): boolean {
    return !!(this.config && this.config.key_id);
  }

  // Create a payment order on the server
  async createOrder(orderData: any): Promise<{
    order_id: string;
    amount: number;
    currency: string;
    key?: string;
    rzdetails: {
      receipt: string;
      [key: string]: any;
    };
  }> {
    try {
      const response = await apiService.createRazorpayOrder(orderData);
      // Expect backend to return the Razorpay order id and the publishable key
      if (!response.razorpayOrderId) {
        throw new Error('Failed to create Razorpay order: Missing Order ID');
      }

      return {
        order_id: response.razorpayOrderId,
        amount: response.amount,
        currency: 'INR',
        key: response.key || this.config?.key_id,
        rzdetails: response.rzdetails || { receipt: `order_${Date.now()}` }
      };
    } catch (error) {
      throw error;
    }
  }

  // Open Razorpay payment gateway
  async openPaymentGateway(paymentData: RazorpayPaymentData): Promise<RazorpayResponse> {
    const options = {
      description: paymentData.description,
      image: 'https://samarsilkpalace.com/favicon.PNG?text=SP',
      currency: paymentData.currency,
      key: paymentData.key || this.config?.key_id,
      amount: paymentData.amount,
      order_id: paymentData.orderId,
      name: 'Samar Silk Palace',
      prefill: paymentData.prefill || {
        email: paymentData.customerEmail,
        contact: paymentData.customerPhone,
        name: paymentData.customerName,
      },
      theme: paymentData.theme || { color: '#f43f5e' },
      notes: paymentData.notes || {},
    } as any;

    if (!options.key) {
      throw new Error('Missing Razorpay key for payment initialization');
    }

    return new Promise((resolve, reject) => {
      RazorpayCheckout.open(options)
        .then((data: RazorpayResponse) => resolve(data))
        .catch((error: RazorpayError) => reject(error));
    });
  }

  // Handle successful payment
  async handleSuccessfulPayment(
    paymentResponse: RazorpayResponse,
    orderData: any
  ): Promise<{ success: boolean; message: string; order?: any }> {
    try {
      // Save payment to backend (matching web app flow)
      const saveResponse = await apiService.saveRazorpayPayment({
        response: paymentResponse,
        orderData: orderData
      });

      if (saveResponse.success === false) {
      }

      return {
        success: true,
        message: 'Payment completed successfully',
        order: saveResponse
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify payment signature (should ideally be done on server)
  private async verifyPaymentSignature(paymentResponse: RazorpayResponse): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  // Handle payment failure
  handlePaymentFailure(error: RazorpayError): string {
    let errorMessage = 'Payment failed. Please try again.';
    switch (error.code) {
      case 'BAD_REQUEST_ERROR':
        errorMessage = 'Invalid payment request. Please check your details.';
        break;
      case 'GATEWAY_ERROR':
        errorMessage = 'Payment gateway error. Please try again later.';
        break;
      case 'NETWORK_ERROR':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'SERVER_ERROR':
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = error.description || 'Payment failed. Please try again.';
    }

    return errorMessage;
  }

  // Get payment methods that support Razorpay
  getPaymentMethods(): PaymentMethod[] {
    return [
      { id: 'cod', type: 'COD', name: 'Cash on Delivery', details: 'Pay when you receive your order' },
      { id: 'online', type: 'ONLINE', name: 'Online Payment', details: 'Pay using PhonePe, GPay, Paytm, etc.' },
    ];
  }

  // Check if payment method requires Razorpay
  isRazorpayMethod(paymentMethod: PaymentMethod): boolean {
    return ['online'].includes(paymentMethod.type);
  }

  // Process payment based on method
  async processPayment(
    paymentMethod: PaymentMethod,
    orderData: any,
    userInfo: { name: string; email: string; phone: string }
  ): Promise<{ success: boolean; message: string; paymentData?: any }> {
    try {
      if (paymentMethod.type === 'COD') {
        // Handle Cash on Delivery directly
        return {
          success: true,
          message: 'Order placed successfully with Cash on Delivery',
          paymentData: {
            payment_method: 'cod',
            payment_status: 'pending'
          }
        };
      }

      if (this.isRazorpayMethod(paymentMethod)) {
        // Handle online payments through Razorpay
        const razorpayOrder = await this.createOrder(orderData);
        console.log('🚀 Razorpay Order:', razorpayOrder);
        const paymentData: RazorpayPaymentData = {
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          orderId: razorpayOrder.order_id,
          key: razorpayOrder.key,
          customerEmail: userInfo.email,
          customerPhone: userInfo.phone,
          customerName: userInfo.name,
          description: razorpayOrder.rzdetails.receipt,
          prefill: {
            email: userInfo.email,
            contact: userInfo.phone,
            name: userInfo.name,
          },
          theme: {
            color: '#f43f5e'
          },
          notes: {
            payment_method: paymentMethod.type
          }
        };

        const razorpayResponse = await this.openPaymentGateway(paymentData);
        // Pass original orderData to handleSuccessfulPayment for saving
        await this.handleSuccessfulPayment(razorpayResponse, orderData);

        return {
          success: true,
          message: 'Payment completed successfully',
          paymentData: {
            payment_method: paymentMethod.type.toLowerCase(),
            payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            payment_status: 'paid',
            razorpay_signature: razorpayResponse.razorpay_signature
          }
        };
      }

      throw new Error(`Unsupported payment method: ${paymentMethod.type}`);

    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        const errorMessage = this.handlePaymentFailure(error as RazorpayError);
        return {
          success: false,
          message: errorMessage
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();
export default razorpayService;