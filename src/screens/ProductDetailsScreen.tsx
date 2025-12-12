import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import CartIcon from '../components/CartIcon';
import SafeAlert from '../utils/safeAlert';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { apiService, ApiProduct } from '../services/api';
import { useUserProfile } from '../contexts/UserProfileContext';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
    addToRecentlyViewed
  } = useUserProfile();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // API state management
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);

  // Get route parameters - handle multiple parameter formats for backwards compatibility
  const { productId, productSlug, product: productParam } = route.params as any || {};

  // Determine the slug to use based on available parameters
  let slugToUse: string | undefined;

  if (productSlug) {
    // Direct slug passed
    slugToUse = productSlug;
  } else if (productParam?.slug) {
    // Product object passed (from HomeScreen)
    slugToUse = productParam.slug;
  } else if (productId) {
    // ID passed - could be either numeric ID or slug string
    slugToUse = productId;
  }

  // Load product details
  const loadProductData = async () => {
    try {
      setError(null);

      if (!slugToUse) {
        console.error('❌ Product slug is missing. Route params:', { productId, productSlug, product: productParam });
        console.error('Available route params:', route.params);
        throw new Error('Product slug is required');
      }

      console.log('🔍 Loading product with slug:', slugToUse);

      // Load product details using slug-based API (matching your frontend)
      const productData = await apiService.getProductBySlug(slugToUse);

      if (productData) {
        setProduct(productData);

        // Check if product is in wishlist
        try {
          const wishlistStatus = await checkWishlist(productData.id);
          setIsFavorite(wishlistStatus.in_wishlist);
        } catch (error) {
          console.log('Error checking wishlist status:', error);
        }

        // Add to recently viewed
        try {
          await addToRecentlyViewed(productData.id);
        } catch (error) {
          console.log('Error adding to recently viewed:', error);
        }

        // Load related products using the correct API with product slug
        let related: ApiProduct[] = [];
        try {
          // Use getRelatedProducts endpoint with product slug
          related = await apiService.getRelatedProducts(productData.slug);
          console.log('Related products loaded:', related.length);
        } catch (error) {
          console.log('getRelatedProducts endpoint failed, using featured products as fallback');
          // Fallback to featured products
          const featuredProducts = await apiService.getFeaturedProducts();
          related = featuredProducts.slice(0, 6); // Limit to 6 products
        }

        // Filter out current product from related
        const filteredRelated = related.filter(p => p.id !== productData.id);
        setRelatedProducts(filteredRelated);

        console.log('Product loaded:', productData.name);
      } else {
        throw new Error('Product not found');
      }

    } catch (err) {
      console.error('Error loading product data:', err);
      setError('Failed to load product details.');

      // Fallback product data
      setProduct({
        id: 1,
        name: 'Premium Banarasi Saree',
        slug: 'premium-banarasi-saree',
        images: [
          'https://via.placeholder.com/400x600/ff6b6b/ffffff?text=Saree+1',
          'https://via.placeholder.com/400x600/4ecdc4/ffffff?text=Saree+2',
          'https://via.placeholder.com/400x600/45b7d1/ffffff?text=Saree+3',
        ],
        price: 2499,
        originalPrice: 3999,
        rating: 4.8,
        reviewCount: 24,
        category: 'Silk Saree\'s',
        isNew: false,
        isBestseller: true,
      } as any);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadProductData();
  }, [slugToUse]);

  // Refresh function
  const onRefresh = () => {
    setRefreshing(true);
    loadProductData();
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity, {
        size: selectedSize,
      });

      SafeAlert.show(
        'Added to Cart',
        `${product.name} (Qty: ${quantity}) has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      SafeAlert.error('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      setTogglingWishlist(true);

      if (isFavorite) {
        await removeFromWishlist(product.id);
        setIsFavorite(false);
        SafeAlert.success('Removed', 'Item removed from wishlist');
      } else {
        await addToWishlist(product.id);
        setIsFavorite(true);
        SafeAlert.success('Added', 'Item added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      SafeAlert.error('Error', 'Failed to update wishlist. Please try again.');
    } finally {
      setTogglingWishlist(false);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!product) return;

    // Create cart item format for checkout - ensure image is always an array of strings
    const productImages = Array.isArray(product.images)
      ? product.images
      : typeof product.images === 'string'
        ? [product.images]
        : ['https://via.placeholder.com/50'];

    const cartItem = {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      size: selectedSize || null,
      color: '',
      image: productImages[0], // Use first image as string
    };

    const orderTotal = product.price * quantity;

    navigation.navigate('Checkout', {
      cartItems: [cartItem],
      total: orderTotal,
      subtotal: orderTotal,
      shipping: 0,
      tax: 0,
      discount: 0,
    });
  };

  // Show loading spinner
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.glassGradients.purple}
          style={styles.backgroundGradient}
        />
        <FloatingElements count={8} />
        <View style={styles.loadingContainer}>
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>Loading product details...</Text>
          </GlassCard>
        </View>
      </View>
    );
  }

  // Show error state
  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ Product not found</Text>
          <GradientButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            gradient={theme.colors.gradients.primary}
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.purple}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={8} />

      <EnhancedHeader
        title={`✨ ${product.name}`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<CartIcon size="medium" color={theme.colors.white} />}
      />

      <ScrollView
        style={styles.scrollView}
        bounces={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <GlassCard style={styles.errorCard} variant="light">
              <Text style={styles.errorBannerText}>⚠️ {error}</Text>
            </GlassCard>
          </View>
        )}

        {/* Clean Product Image */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[selectedImageIndex] || product.images[0] }}
            style={styles.productImage}
          />

          {/* Simple Badges */}
          <View style={styles.badgeContainer}>
            {product.isBestseller && (
              <View style={styles.bestsellerBadge}>
                <Text style={styles.badgeText}>Bestseller</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.badgeText}>{discount}% OFF</Text>
              </View>
            )}
          </View>

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}
            disabled={togglingWishlist}>
            {togglingWishlist ? (
              <ActivityIndicator size="small" color="#ff6b6b" />
            ) : (
              <Text style={styles.heartIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            )}
          </TouchableOpacity>

          {/* Image Indicators */}
          {product.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {product.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.activeIndicator,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnail Gallery */}
        {product.images.length > 1 && (
          <View style={styles.thumbnailSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailContainer}>
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.activeThumbnail,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}>
                  <Image source={{ uri: image }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Clean Product Info */}
        <View style={styles.productInfoSection}>
          {/* Category Tag */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{product.category?.title || 'Premium Collection'}</Text>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {product.rating || 4.5}</Text>
            </View>
            <Text style={styles.reviewText}>({product.reviewCount || 0} reviews)</Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>₹{product.price?.toLocaleString()}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>₹{product.originalPrice?.toLocaleString()}</Text>
            )}
            {discount > 0 && (
              <View style={styles.savingsTag}>
                <Text style={styles.savingsText}>Save ₹{((product.originalPrice || 0) - product.price).toLocaleString()}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>
              {product.description || 'Premium quality product crafted with finest materials and attention to detail. Perfect for special occasions and daily elegance.'}
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.addToCartButton, addingToCart && styles.disabledButton]}
              onPress={handleAddToCart}
              disabled={addingToCart}>
              {addingToCart ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
                  <Text style={styles.cartSubText}>₹{(product.price * quantity).toLocaleString()}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={handleBuyNow}>
              <Text style={styles.buyNowText}>⚡ Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedContainer}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedProducts.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedProduct}
                  onPress={() => navigation.push('ProductDetails', { productSlug: item.slug })}>
                  <Image source={{ uri: item.images[0] }} style={styles.relatedImage} />
                  <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>₹{item.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.size.lg,
    color: theme.colors.error?.[600] || '#dc2626',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorButton: {
    marginTop: theme.spacing.md,
  },
  errorCard: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  errorBanner: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error?.[50] || '#fef2f2',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.error?.[200] || '#fecaca',
  },
  errorBannerText: {
    color: theme.colors.error?.[700] || '#b91c1c',
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: theme.colors.neutral[800],
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 18,
  },
  // Image Section
  imageSection: {
    position: 'relative',
    height: 400,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
  },
  productImage: {
    width: width,
    height: 400,
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  bestsellerBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heartIcon: {
    fontSize: 20,
  },
  newBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
  },
  newText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: theme.colors.white,
  },
  // Thumbnail Section
  thumbnailSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  thumbnailContainer: {
    gap: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  activeThumbnail: {
    borderColor: '#8b5cf6',
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Product Info Section
  productInfoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  ratingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceSection: {
    marginBottom: 24,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  savingsTag: {
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  savingsText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  reviewCount: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
  },
  priceContainer: {
    marginBottom: theme.spacing.lg,
  },
  savingsBadge: {
    backgroundColor: theme.colors.success?.[50] || '#f0fdf4',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  quantitySection: {
    marginBottom: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  quantityDisplay: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 50,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  quantityContainer: {
    marginBottom: theme.spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 20,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cartSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  relatedContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.neutral[50],
  },
  relatedTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.md,
  },
  relatedProduct: {
    width: 140,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.lg,
    overflow: 'hidden',
    padding: theme.spacing.sm,
  },
  relatedImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  relatedName: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs,
  },
  relatedPrice: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.primary[500],
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProductDetailsScreen;