import { ApiProduct } from '../services/api_service/types';
import { getProductUnit, METER_MIN } from './productUnit';

export interface ResolvedPrice {
    price: number;
    originalPrice: number;
    discount: number;
    imageUrl: string;
    variantId?: number;
    isThan: boolean;
    unitType: 'piece' | 'meter';
    minQuantity: number;
    displayPrice: number;
    displayOriginalPrice: number;
}

/**
 * Resolves the primary price, original price, and image for a product.
 * Consistent logic for ProductCard, ProductDetails, and other screens.
 */
export function resolveProductDisplayData(product: ApiProduct, variantId?: number): ResolvedPrice {
    const {
        price = 0,
        originalPrice = 0,
        images = [],
        variants = [],
        defaultVariantId,
        category,
        slug,
        name
    } = product;

    // 1. Determine Unit and Min Quantity
    const unitType = getProductUnit(category?.slug, slug || name);
    const isThan = unitType === 'meter';
    const minQuantity = isThan ? METER_MIN : 1;

    // 2. Determine Variant
    let selectedVariant = null;
    if (variants && variants.length > 0) {
        if (variantId) {
            selectedVariant = variants.find(v => v.id === variantId);
        }
        if (!selectedVariant && defaultVariantId) {
            selectedVariant = variants.find(v => v.id === defaultVariantId);
        }
        if (!selectedVariant) {
            selectedVariant = variants[0];
        }
    }

    // 3. Resolve Base Prices
    let basePrice = Number(price) || 0;
    let baseOriginalPrice = Number(originalPrice) || 0;
    let resolvedVariantId = undefined;

    if (selectedVariant) {
        basePrice = Number(selectedVariant.price ?? price) || basePrice;
        baseOriginalPrice = Number(selectedVariant.originalPrice ?? originalPrice) || baseOriginalPrice;
        resolvedVariantId = selectedVariant.id;
    }

    // 4. Resolve Image
    let imageUrl = images && images.length > 0 ? images[0] : '';
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
        imageUrl = selectedVariant.images[0];
    } else if (images && images.length > 0) {
        imageUrl = images[0];
    }

    if (!imageUrl) {
        imageUrl = `https://picsum.photos/300/400?random=${product.id || 0}`;
    }

    // 5. Calculate Totals (for Than items)
    const displayPrice = basePrice * minQuantity;
    const displayOriginalPrice = baseOriginalPrice * minQuantity;

    // 6. Calculate Discount
    const discount = (displayOriginalPrice && displayOriginalPrice > displayPrice)
        ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
        : 0;

    return {
        price: basePrice,
        originalPrice: baseOriginalPrice,
        discount,
        imageUrl,
        variantId: resolvedVariantId,
        isThan,
        unitType,
        minQuantity,
        displayPrice,
        displayOriginalPrice
    };
}

/**
 * Formats a number as a currency string (Rupees).
 * Rounds to whole numbers for a cleaner look.
 */
export function formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const rounded = Math.round(num || 0);
    return `₹${rounded.toLocaleString('en-IN')}`;
}
