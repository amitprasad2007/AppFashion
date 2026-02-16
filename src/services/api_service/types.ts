// API Interface definitions for AppFashion

export interface ProductSearchParams {
    categoryId?: number | string;
    type?: 'featured' | 'bestseller' | 'new' | 'category';
    search?: string;
}

export interface ApiBannerData {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    cta: string | null;
    path: string | null;
}

export interface ApiCategory {
    id: number;
    name: string;
    description: string;
    image: string;
    count: number;
    slug: string;
}

export interface ApiSearchSuggestion {
    id: number;
    type: 'product' | 'category' | 'collection' | 'page';
    label: string;
    slug: string;
}

export interface ApiProduct {
    id: number;
    name: string;
    slug: string;
    brand?: {
        id: number;
        name: string;
        slug: string;
    };
    price: number;
    originalPrice: number;
    discountPercentage: number;
    rating?: number;
    reviewCount?: number;
    category: {
        id: number;
        title: string;
        slug: string;
        summary: string;
        photo: string;
        is_parent: number;
        parent_id?: number;
    };
    subCategory?: {
        id: number;
        title: string;
        slug: string;
        summary: string;
        photo: string;
        is_parent: number;
        parent_id?: number;
    };
    sku: string;
    images: string[];
    colors: Array<{
        name: string;
        value: string;
        available: boolean;
        variantId: number;
    }>;
    defaultVariantId: number;
    variants: Array<{
        id: number;
        color: {
            name: string;
            value: string;
        };
        sku: string;
        images: string[];
        stock: number;
        available: boolean;
        price: number;
        originalPrice: number;
    }>;
    sizes: string;
    stock: number;
    description: string;
    specifications: Array<{
        name: string;
        value: string;
    }>;
    isBestseller: boolean;
    isNew?: boolean;
    inStock?: boolean;
}

export interface ApiCollectionType {
    id: number;
    name: string;
    slug: string;
}

export interface ApiCollection {
    id: number;
    collection_type_id: number;
    name: string;
    slug: string;
    description: string;
    banner_image: string;
    thumbnail_image: string;
    seo_title?: string;
    seo_description?: string;
    collection_type: ApiCollectionType;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    acceptTerms: boolean;
}

export interface AuthUser {
    id: number;
    name: string;
    phone: string;
    email: string;
    address?: string | null;
    gstin?: string | null;
    created_at: string;
    updated_at: string;
    google_id?: string | null;
    avatar?: string | null;
    facebook_id?: string | null;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: AuthUser;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface ApiProductReview {
    id: string;
    product_slug: string;
    user_id: string;
    user_name?: string;
    rating: number;
    review_text: string;
    created_at: string;
    updated_at: string;
}

export interface ApiCartItem {
    id: number;
    cart_id: number;
    name: string;
    price: string;
    quantity: number;
    image: string[];
    variant_id?: number;
    product_variant_id?: number;
}

export interface ApiCart {
    items: ApiCartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
}

export interface ApiOrderItem {
    id: number;
    name: string;
    image: string | string[];
    price: string;
    quantity: number;
}

export interface ApiOrder {
    id: string;
    date: string;
    total: string;
    status: string;
    statusColor: string;
    items: ApiOrderItem[];
}

export interface ApiWishlistItem {
    wish_id: number;
    id: number;
    name: string;
    slug: string;
    image: string[];
    price: string;
    originalPrice: number | null;
    category: string;
}

export interface ApiAddress {
    id: number;
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    postal: string;
    phone: string;
    isDefault: boolean;
    full_name?: string;
    address_line1?: string;
    address_line2?: string;
    country?: string;
    postal_code?: string;
    address_type?: string;
    is_default?: boolean;
}

export interface PolicySection {
    title: string;
    items: string[];
}

export interface DeliveryArea {
    area: string;
    time: string;
}

export interface ShippingMethod {
    name: string;
    time: string;
    price: string;
    details: string;
}

export interface TrackingInfo {
    title: string;
    content: string;
}

export interface PolicyMetadata {
    introduction: string;
    sections?: PolicySection[];
    note?: string;
    tracking?: TrackingInfo;
    delivery_areas?: DeliveryArea[];
    shipping_methods?: ShippingMethod[];
}

export interface ApiPolicy {
    title: string;
    content: string | null;
    metadata?: PolicyMetadata;
}

export interface AddressInput {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    address_type: 'home' | 'work' | 'other';
    is_default: boolean;
}

export interface UserData {
    user: AuthUser;
    orders: ApiOrder[];
    wishlists: ApiWishlistItem[];
    addresses: ApiAddress[];
    cart_items: ApiCart;
}

// Legacy interfaces
export interface CartItem {
    id: string;
    productId: number;
    product: ApiProduct;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    addedAt: string;
    subtotal: number;
}

export interface Cart {
    id: string;
    userId?: string;
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    discount?: number;
    deliveryCharge?: number;
    finalAmount: number;
    updatedAt: string;
}

export interface ShippingAddress {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault?: boolean;
}

export interface PaymentMethod {
    id: string;
    type: 'COD' | 'ONLINE';
    name: string;
    details?: string;
    razorpay_enabled?: boolean;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId?: string;
    items: CartItem[];
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paymentMethod: PaymentMethod;
    shippingAddress: ShippingAddress;
    totalItems: number;
    totalAmount: number;
    discount?: number;
    deliveryCharge: number;
    finalAmount: number;
    estimatedDelivery?: string;
    placedAt: string;
    updatedAt: string;
    trackingId?: string;
    notes?: string;
}

export interface OrderStatusUpdate {
    status: Order['status'];
    timestamp: string;
    message: string;
    location?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    status?: number;
}
