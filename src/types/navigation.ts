// Navigation types for the AppFashion app
export type RootStackParamList = {
  MainTabs: undefined;
  ProductList: { categoryId?: string; categoryName?: string };
  ProductDetails: { productId?: string; productSlug?: string; product?: any };
  Categories: { categoryId?: string };
  Search: undefined;
  Cart: undefined;
  Checkout: { cartItems: Array<{ id: string; name: string; price: number; originalPrice: number; quantity: number; size: string | null; color: string; image: string }>; total: number; subtotal: number; shipping: number; tax: number; discount: number };
  OrderConfirmation: {
    orderId: string;
    orderNumber: string;
    orderTotal?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    orderStatus?: string;
    orderItems?: any[];
    orderDetails?: any;
  };
  Orders: undefined;
  Profile: undefined;
  Wishlist: undefined;
  Login: undefined;
  Register: undefined;
  OrderDetails: { orderId: string };
  EditProfile: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
  Settings: undefined;
  Support: undefined;
  Notifications: undefined;
  Home: undefined;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  rating?: number;
  description?: string;
};

export type Category = {
  id: string;
  name: string;
  image: string;
};