import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import FloatingElements from '../components/FloatingElements';
import CartIcon from '../components/CartIcon';
import ProductReviews from '../components/ProductReviews';
import SafeAlert from '../utils/safeAlert';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import apiService, { ApiProduct } from '../services/api_service';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAuth } from '../contexts/AuthContext';

// Modular Components
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductVariants from '../components/product/ProductVariants';
import ProductActions from '../components/product/ProductActions';
import RelatedProducts from '../components/product/RelatedProducts';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { state: authState } = useAuth();
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
    addToRecentlyViewed
  } = useUserProfile();

  // Selection State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);

  // Navigation Parameters handling (Standardization)
  const params = route.params as any || {};
  const slugToUse = useMemo(() => {
    // Priority: direct productSlug > slug from product object > productId (legacy)
    return params.productSlug || params.product?.slug || params.productId;
  }, [params.productSlug, params.product?.slug, params.productId]);

  // Derived Values
  const currentImages = useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) return selectedVariant.images;
    if (product && Array.isArray(product.images)) return product.images;
    if (product?.images) return [product.images as any];
    return [];
  }, [product, selectedVariant]);

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentOriginalPrice = selectedVariant?.originalPrice || product?.originalPrice || 0;

  const discount = useMemo(() => {
    if (!currentOriginalPrice || currentOriginalPrice <= currentPrice) return 0;
    return Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100);
  }, [currentPrice, currentOriginalPrice]);

  // Load Data
  const loadProductData = useCallback(async (isRefresh = false) => {
    if (!slugToUse) {
      setError('Product not found');
      setLoading(false);
      return;
    }

    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      // Fetch product details
      const productData = await apiService.getProductBySlug(slugToUse);
      if (productData) {
        setProduct(productData);

        // Initialize variant selection
        if (productData.variants && productData.variants.length > 0) {
          const defaultVar = productData.variants.find(v => v.id === productData.defaultVariantId) || productData.variants[0];
          setSelectedVariant(defaultVar);
        }

        const variantId = productData.variants?.[0]?.id;

        // Concurrent API requests
        const [wishlistStatus, related] = await Promise.all([
          checkWishlist(productData.id, variantId),
          apiService.getRelatedProducts(productData.slug).catch(() => apiService.getFeaturedProducts())
        ]);

        setIsFavorite(wishlistStatus.in_wishlist);

        if (Array.isArray(related)) {
          setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 6));
        }

        // Track view (Fire and forget)
        addToRecentlyViewed(productData.id, variantId).catch(err =>
          console.debug('Error tracking viewed item:', err)
        );
      } else {
        throw new Error('Product not found');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slugToUse, checkWishlist, addToRecentlyViewed]);

  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  // Handlers
  const handleWishlistToggle = async () => {
    if (!product || togglingWishlist) return;
    try {
      setTogglingWishlist(true);
      const variantId = selectedVariant?.id;
      if (isFavorite) {
        await removeFromWishlist(product.id, variantId);
        setIsFavorite(false);
        SafeAlert.success('Success', 'Removed from wishlist');
      } else {
        await addToWishlist(product.id, variantId);
        setIsFavorite(true);
        SafeAlert.success('Success', 'Added to wishlist');
      }
    } catch (err) {
      SafeAlert.error('Error', 'Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;

    if (!authState.isAuthenticated) {
      SafeAlert.show('Login Required', 'Please login to add items to your cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    try {
      setAddingToCart(true);
      const variantId = selectedVariant?.id || (product.variants && product.variants.length > 0 ? product.variants[0].id : undefined);

      await addToCart(product.id, quantity, {
        size: selectedSize,
        variant_id: variantId,
        color: selectedVariant?.color?.name
      });

      SafeAlert.show('Added to Cart', `${product.name} (Qty: ${quantity}) has been added to your cart.`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]);
    } catch (err) {
      SafeAlert.error('Error', 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    const item = {
      id: (selectedVariant?.id || product.id).toString(),
      name: product.name,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      quantity,
      size: selectedSize || null,
      color: selectedVariant?.color?.name || '',
      image: currentImages[0],
    };

    navigation.navigate('Checkout', {
      cartItems: [item],
      total: currentPrice * quantity,
      subtotal: currentPrice * quantity,
      shipping: 0,
      tax: 0,
      discount: 0,
    });
  };

  // UI Components mapping
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.glassGradients.purple} style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.white} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error || 'Product not found'}</Text>
          <GradientButton title="Go Back" onPress={() => navigation.goBack()} gradient={theme.colors.gradients.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.glassGradients.purple} style={styles.backgroundGradient} />
      <FloatingElements count={6} />

      <EnhancedHeader
        title={product.name}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={<CartIcon size="medium" color={theme.colors.white} />}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProductData(true)} />}
        showsVerticalScrollIndicator={false}>

        {/* Gallery Component */}
        <ProductImageGallery
          images={currentImages}
          selectedImageIndex={selectedImageIndex}
          onSelectImage={setSelectedImageIndex}
          isBestseller={product.isBestseller}
          discountPercentage={discount}
          isFavorite={isFavorite}
          onToggleWishlist={handleWishlistToggle}
          togglingWishlist={togglingWishlist}
        />

        {/* Info Component */}
        <ProductInfo
          name={product.name}
          categoryTitle={product.category?.title}
          rating={product.rating}
          reviewCount={product.reviewCount}
          price={currentPrice}
          originalPrice={currentOriginalPrice}
          discountPercentage={discount}
          description={product.description}
        />

        {/* Variants Component */}
        <ProductVariants
          variants={product.variants || []}
          selectedVariant={selectedVariant}
          onSelectVariant={(v) => { setSelectedVariant(v); setSelectedImageIndex(0); }}
        />

        {/* Actions Component */}
        <ProductActions
          quantity={quantity}
          onUpdateQuantity={setQuantity}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          addingToCart={addingToCart}
        />

        {/* Reviews Section */}
        <ProductReviews productSlug={product.slug} />

        {/* Related Section */}
        <RelatedProducts
          products={relatedProducts}
          onProductPress={(p) => navigation.push('ProductDetails', { productSlug: p.slug })}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.neutral[600],
    marginBottom: 20,
  },
});

export default ProductDetailsScreen;