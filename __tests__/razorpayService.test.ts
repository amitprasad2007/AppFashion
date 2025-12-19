import { razorpayService } from '../src/services/razorpayService';
import { apiService } from '../src/services/api';

jest.mock('../src/services/api', () => {
  const actual = jest.requireActual('../src/services/api');
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      createRazorpayOrder: jest.fn(),
    },
  };
});

describe('razorpayService.createOrder normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses backend razorpayOrderId + key', async () => {
    (apiService.createRazorpayOrder as jest.Mock).mockResolvedValue({
      razorpayOrderId: 'order_123',
      amount: 12300,
      key: 'rzp_test_abc',
      currency: 'INR',
      rzdetails: { receipt: 'rcpt_1' },
    });

    const result = await razorpayService.createOrder({ total: 12300 });
    expect(result.order_id).toBe('order_123');
    expect(result.key).toBe('rzp_test_abc');
    expect(result.amount).toBe(12300);
    expect(result.currency).toBe('INR');
  });

  it('supports snake_case fields (razorpay_order_id, razorpay_key)', async () => {
    (apiService.createRazorpayOrder as jest.Mock).mockResolvedValue({
      razorpay_order_id: 'order_456',
      amount: 4500,
      razorpay_key: 'rzp_live_xyz',
    });

    const result = await razorpayService.createOrder({ total: 4500 });
    expect(result.order_id).toBe('order_456');
    expect(result.key).toBe('rzp_live_xyz');
    expect(result.amount).toBe(4500);
  });

  it('falls back to initialized key_id when backend does not provide key', async () => {
    razorpayService.initialize({ key_id: 'rzp_fallback_key' });

    (apiService.createRazorpayOrder as jest.Mock).mockResolvedValue({
      id: 'order_789',
      amount: 999,
    });

    const result = await razorpayService.createOrder({ total: 999 });
    expect(result.order_id).toBe('order_789');
    expect(result.key).toBe('rzp_fallback_key');
  });

  it('throws a clear error when neither backend nor client config provides a key', async () => {
    // Ensure not configured
    razorpayService.initialize({ key_id: '' });

    (apiService.createRazorpayOrder as jest.Mock).mockResolvedValue({
      id: 'order_000',
      amount: 100,
    });

    await expect(razorpayService.createOrder({ total: 100 })).rejects.toThrow(
      /Missing Razorpay key/i
    );
  });
});
