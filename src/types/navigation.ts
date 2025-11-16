// Navigation types for the AppFashion app
export type RootStackParamList = {
  MainTabs: undefined;
  ProductList: {categoryId?: string; categoryName?: string};
  ProductDetails: {productId: string};
  Categories: {categoryId?: string};
  Search: undefined;
  Cart: undefined;
  Checkout: {cartItems: Array<{id: string; name: string; price: number; originalPrice: number; quantity: number; size: string | null; color: string; image: string}>; total: number};
  OrderConfirmation: undefined;
  Orders: undefined;
  Profile: undefined;
  Wishlist: undefined;
  Login: undefined;
  Register: undefined;
  OrderDetails: {orderId: string};
  EditProfile: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
  Settings: undefined;
  Support: undefined;
  Notifications: undefined;
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