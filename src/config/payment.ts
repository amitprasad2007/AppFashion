// Centralized payment configuration
// NOTE: Only store publishable/client keys in the mobile app. Never store secrets.

export const PAYMENT_CONFIG = {
  // Razorpay publishable key id (safe to embed in client)
  // Prefer backend-provided key during order creation, but this acts as a fallback.
  RAZORPAY_KEY_ID: 'rzp_test_kQ8xDx79gF13e2',
} as const;
