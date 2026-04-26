/**
 * Product unit detection utility for Than (fabric) products.
 * Than products are sold by the meter instead of by the piece.
 */

export type ProductUnit = 'piece' | 'meter';

/** Known slugs that indicate a Than/fabric product */
const THAN_SLUGS = ['than', 'thaan'];

/**
 * Determine the unit type from category or product slug.
 * Returns 'meter' for Than/fabric products, 'piece' for everything else.
 */
export function getProductUnit(categorySlug?: string | null, productSlug?: string | null): ProductUnit {
  const cSlug = (categorySlug || '').toLowerCase().trim();
  const pSlug = (productSlug || '').toLowerCase().trim();
  
  const isThan = 
    cSlug.includes('than') || 
    cSlug.includes('thaan') || 
    cSlug.includes('fabric') ||
    pSlug.startsWith('than-') ||
    pSlug.startsWith('fabric-');

  return isThan ? 'meter' : 'piece';
}

/**
 * Check unit type from a category slug string (used for cart items).
 */
export function getCartItemUnit(categorySlug?: string | null): ProductUnit {
  if (!categorySlug) return 'piece';
  return getProductUnit(categorySlug);
}

/** Step increment for meter-based products */
export const METER_STEP = 0.5;

/** Minimum selectable length in meters */
export const METER_MIN = 15;

/** Quick-select preset lengths in meters */
export const METER_PRESETS = [15, 20, 25, 30, 40, 50];

/**
 * Format a quantity value with its unit label.
 * e.g., formatQuantity(2.5, 'meter') → "2.5m"
 *        formatQuantity(2, 'piece')  → "2"
 */
export function formatQuantity(qty: number | string, unit: ProductUnit): string {
  const num = typeof qty === 'string' ? parseFloat(qty) : qty;
  const safeQty = num || 0;
  if (unit === 'meter') {
    // Remove trailing .0 for whole numbers
    return `${safeQty}m`;
  }
  return `${safeQty}`;
}

/**
 * Format a price with unit label.
 * e.g., formatUnitPrice(2500, 'meter') → "₹2,500 / meter"
 *        formatUnitPrice(2500, 'piece') → "₹2,500"
 */
export function formatUnitPrice(price: number, unit: ProductUnit): string {
  return unit === 'meter'
    ? `₹${price.toLocaleString('en-IN')} / meter`
    : `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Check if a given quantity is valid for the specified unit type.
 */
export function isValidQuantity(qty: number, unit: ProductUnit): boolean {
  if (unit === 'meter') {
    return qty >= METER_MIN && (qty * 10) % (METER_STEP * 10) === 0;
  }
  return qty >= 1 && Number.isInteger(qty);
}
