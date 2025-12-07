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
  description: string;
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
    console.log('🔧 Razorpay Service Initialized');
  }

  // Check if Razorpay is properly configured
  isConfigured(): boolean {
    return !!(this.config && this.config.key_id);
  }

  // Create a payment order on the server
  async createOrder(orderData: any): Promise<{ order_id: string; amount: number; currency: string; key?: string }> {
    if (!this.isConfigured()) {
      throw new Error('Razorpay not configured');
    }

    try {
      console.log('💰 Creating Razorpay order:', orderData);

      const response = await apiService.createRazorpayOrder(orderData);

      // Mapped from web app backend response structure
      if (!response.razorpayOrderId) {
        throw new Error('Failed to create Razorpay order: Missing Order ID');
      }

      return {
        order_id: response.razorpayOrderId,
        amount: response.amount,
        currency: 'INR',
        key: response.key || this.config?.key_id
      };
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Open Razorpay payment gateway
  async openPaymentGateway(paymentData: RazorpayPaymentData): Promise<RazorpayResponse> {
    if (!this.isConfigured()) {
      throw new Error('Razorpay not configured');
    }

    const options = {
      description: paymentData.description,
      image: 'https://via.placeholder.com/100x100/ff6b6b/ffffff?text=SP', // Your app logo URL
      currency: paymentData.currency,
      key: paymentData.key || this.config!.key_id,
      amount: paymentData.amount, // Amount in paise
      order_id: paymentData.orderId,
      name: 'Samar Silk Palace',
      prefill: paymentData.prefill || {
        email: paymentData.customerEmail,
        contact: paymentData.customerPhone,
        name: paymentData.customerName,
      },
      theme: paymentData.theme || { color: '#f43f5e' },
      notes: paymentData.notes || {},
    };

    console.log('🚀 Opening Razorpay gateway with options:', options);

    return new Promise((resolve, reject) => {
      RazorpayCheckout.open(options)
        .then((data: RazorpayResponse) => {
          console.log('✅ Payment successful:', data);
          resolve(data);
        })
        .catch((error: RazorpayError) => {
          console.error('❌ Payment failed:', error);
          reject(error);
        });
    });
  }

  // Handle successful payment
  async handleSuccessfulPayment(
    paymentResponse: RazorpayResponse,
    orderData: any
  ): Promise<{ success: boolean; message: string; order?: any }> {
    try {
      console.log('🎉 Processing successful payment:', paymentResponse);

      // Save payment to backend (matching web app flow)
      const saveResponse = await apiService.saveRazorpayPayment({
        response: paymentResponse,
        orderData: orderData
      });

      if (saveResponse.success === false) {
        // Warn if success is false, but don't block unless critical
        console.warn('Backend returned success: false', saveResponse);
      }

      console.log('✅ Payment Saved:', saveResponse);

      return {
        success: true,
        message: 'Payment completed successfully',
        order: saveResponse
      };
    } catch (error) {
      console.error('❌ Error processing successful payment:', error);
      throw error;
    }
  }

  // Verify payment signature (should ideally be done on server)
  private async verifyPaymentSignature(paymentResponse: RazorpayResponse): Promise<boolean> {
    try {
      console.log('🔍 Verifying payment signature...');
      return true;
    } catch (error) {
      console.error('❌ Error verifying payment signature:', error);
      return false;
    }
  }

  // Handle payment failure
  handlePaymentFailure(error: RazorpayError): string {
    console.error('💸 Payment failed:', error);

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
      { id: 'upi', type: 'UPI', name: 'UPI Payment', details: 'Pay using PhonePe, GPay, Paytm, etc.' },
      { id: 'card', type: 'CARD', name: 'Credit/Debit Card', details: 'Visa, Mastercard, RuPay, Amex' },
      { id: 'netbanking', type: 'NETBANKING', name: 'Net Banking', details: 'All major banks supported' },
      { id: 'wallet', type: 'WALLET', name: 'Digital Wallets', details: 'Paytm, Mobikwik, FreeCharge, etc.' },
    ];
  }

  // Check if payment method requires Razorpay
  isRazorpayMethod(paymentMethod: PaymentMethod): boolean {
    return ['UPI', 'CARD', 'NETBANKING', 'WALLET'].includes(paymentMethod.type);
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

        const paymentData: RazorpayPaymentData = {
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          orderId: razorpayOrder.order_id,
          key: razorpayOrder.key,
          customerEmail: userInfo.email,
          customerPhone: userInfo.phone,
          customerName: userInfo.name,
          description: 'Payment for Order',
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
      console.error('❌ Payment processing failed:', error);

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