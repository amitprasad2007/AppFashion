import React, {useState, useEffect} from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import AnimatedCard from '../components/AnimatedCard';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import { apiService, ApiProduct } from '../services/api';
import { useUserProfile } from '../contexts/UserProfileContext';

const {width} = Dimensions.get('window');

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

  // Get route parameters - expecting productSlug instead of productId
  const { productId, productSlug } = route.params as any || {};
  
  // Use productSlug if available, otherwise fall back to productId
  const slugToUse = productSlug || productId;

  // Load product details
  const loadProductData = async () => {
    try {
      setError(null);
      
      if (!slugToUse) {
        throw new Error('Product slug is required');
      }
      
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
      
      Alert.alert(
        'Added to Cart', 
        `${product.name} (Qty: ${quantity}) has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
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
        Alert.alert('Removed', 'Item removed from wishlist');
      } else {
        await addToWishlist(product.id);
        setIsFavorite(true);
        Alert.alert('Added', 'Item added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading product details...</Text>
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
    <ScrollView 
      style={styles.container} 
      bounces={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => Alert.alert('Share', `Share ${product.name}`)}>
          <Text style={styles.shareIcon}>🔗</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Product Images */}
      <View style={styles.imageContainer}>
        <Image source={{uri: product.images[selectedImageIndex] || product.images[0]}} style={styles.productImage} />
        
        {/* Badges */}
        {product.isBestseller && (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerText}>🔥 BESTSELLER</Text>
          </View>
        )}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>✨ NEW</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity 
          style={[styles.favoriteButton, togglingWishlist && styles.disabledButton]}
          onPress={handleWishlistToggle}
          disabled={togglingWishlist}>
          {togglingWishlist ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          )}
        </TouchableOpacity>

        {/* Image Pagination */}
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

      {/* Image Thumbnails */}
      {product.images.length > 1 && (
        <View style={styles.thumbnailContainer}>
          {product.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                selectedImageIndex === index && styles.activeThumbnail,
              ]}
              onPress={() => setSelectedImageIndex(index)}>
              <Image source={{uri: image}} style={styles.thumbnailImage} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category?.title || 'Category'}</Text>
        </View>
        
        <Text style={styles.productName}>{product.name}</Text>
        
        {/* Rating and Reviews */}
        <View style={styles.ratingContainer}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {product.rating || 4.5}</Text>
          </View>
          <Text style={styles.reviewCount}>({product.reviewCount || 0} reviews)</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₹{product.price}</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
          )}
          {discount > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>You save ₹{product.originalPrice! - product.price}!</Text>
            </View>
          )}
        </View>

        {/* Product Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>
            {product.description || 'Beautiful handcrafted product with premium quality materials. Perfect for special occasions and daily wear.'}
          </Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
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
              <Text style={styles.addToCartText}>Add to Cart</Text>
            )}
          </TouchableOpacity>
          <GradientButton
            title="Buy Now"
            onPress={handleBuyNow}
            gradient={theme.colors.gradients.primary}
            style={styles.buyNowButton}
          />
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
                onPress={() => navigation.push('ProductDetails', { productId: item.slug })}>
                <Image source={{uri: item.images[0]}} style={styles.relatedImage} />
                <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.relatedPrice}>₹{item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
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
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  productImage: {
    width: width,
    height: 400,
    resizeMode: 'cover',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: theme.colors.error?.[500] || '#ef4444',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
  },
  bestsellerText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
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
  discountBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: theme.colors.success?.[500] || '#10b981',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
  },
  discountText: {
    fontSize: theme.typography.size.sm,
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
  thumbnailContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.spacing.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: theme.colors.primary[500],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: theme.spacing.lg,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.weight.medium,
  },
  productName: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  ratingBadge: {
    backgroundColor: theme.colors.success?.[100] || '#dcfce7',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  ratingText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.success?.[700] || '#15803d',
    fontWeight: theme.typography.weight.medium,
  },
  reviewCount: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
  },
  priceContainer: {
    marginBottom: theme.spacing.lg,
  },
  currentPrice: {
    fontSize: theme.typography.size['2xl'],
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.xs,
  },
  originalPrice: {
    fontSize: theme.typography.size.lg,
    color: theme.colors.neutral[500],
    textDecorationLine: 'line-through',
    marginBottom: theme.spacing.sm,
  },
  savingsBadge: {
    backgroundColor: theme.colors.success?.[50] || '#f0fdf4',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.success?.[700] || '#15803d',
    fontWeight: theme.typography.weight.medium,
  },
  descriptionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.size.base,
    color: theme.colors.neutral[600],
    lineHeight: 24,
  },
  quantityContainer: {
    marginBottom: theme.spacing.xl,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quantityButton: {
    backgroundColor: theme.colors.neutral[100],
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[600],
  },
  quantityText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
    minWidth: 40,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[700],
  },
  buyNowButton: {
    flex: 1,
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