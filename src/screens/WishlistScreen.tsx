import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useUserProfile } from '../contexts/UserProfileContext';
import apiService, { ApiWishlistItem } from '../services/api_service';
import ProtectedScreen from '../components/ProtectedScreen';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import SafeAlert from '../utils/safeAlert';
import { theme } from '../theme';
import { getProductUnit, METER_MIN } from '../utils/productUnit';
import { resolveProductDisplayData } from '../utils/pricing';
import { ApiProduct } from '../services/api_service';

const WishlistScreenContent = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {
    userData,
    isLoading,
    error: profileError,
    getWishlist,
    removeFromWishlistById,
    removeFromWishlist,
    addToCart,
    refreshUserData
  } = useUserProfile();

  const [wishlistItems, setWishlistItems] = useState<ApiWishlistItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<number>(0);
  const [addLoading, setAddLoading] = useState<number>(0);

  // Load wishlist items
  const loadWishlist = async () => {
    try {
      if (userData?.wishlists) {
        setWishlistItems(userData.wishlists);
      } else {
        // Fallback: fetch wishlist directly
        const wishlistData = await getWishlist();
        setWishlistItems(wishlistData);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
      setWishlistItems([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Load wishlist when user data changes
  useEffect(() => {
    if (userData) {
      setWishlistItems(userData.wishlists);
    }
  }, [userData]);

  // Initial wishlist load
  useEffect(() => {
    if (!userData) {
      loadWishlist();
    }
  }, []);

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    if (userData) {
      await refreshUserData();
    } else {
      await loadWishlist();
    }
  };

  const handleRemoveFromWishlist = (productId: number, productName: string) => {
    SafeAlert.confirm(
      'Remove from Wishlist',
      `Are you sure you want to remove "${productName}" from your wishlist?`,
      async () => {
        setRemoveLoading(productId);
        try {
          await removeFromWishlist(productId);
          // Manually reload if not using userData subscription (e.g. guest mode)
          if (!userData) {
            await loadWishlist();
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          SafeAlert.error('Error', 'Failed to remove item from wishlist. Please try again.');
        } finally {
          setRemoveLoading(0);
        }
      }
    );
  };

  const handleAddToCart = async (productId: number, productName: string, category: string, slug: string) => {
    setAddLoading(productId);

    try {
      const unit = getProductUnit(category, slug);
      const minQty = unit === 'meter' ? METER_MIN : 1;
      await addToCart(productId, minQty);
      SafeAlert.show(
        'Added to Cart',
        `${productName} has been added to your cart successfully!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      SafeAlert.error('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddLoading(0);
    }
  };

  const renderWishlistItem = ({ item }: { item: ApiWishlistItem }) => {
    // Map ApiWishlistItem to ApiProduct structure for the utility
    const productAdapter: any = {
      ...item,
      category: { slug: item.category, title: item.category },
      price: parseFloat(item.price),
      originalPrice: item.originalPrice
    };

    const displayData = resolveProductDisplayData(productAdapter);
    const { 
        displayPrice: itemPrice, 
        displayOriginalPrice: itemOriginalPrice, 
        discount: discountPercentage,
        isThan,
        minQuantity: minQty
    } = displayData;

    const unit = isThan ? 'meter' : 'piece';
    const isRemoving = removeLoading === item.id;
    const isAdding = addLoading === item.id;

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', { 
            productSlug: item.slug,
            product: productAdapter 
          })}
          style={styles.itemContent}
          activeOpacity={0.8}>
          <Image
            source={{
              uri: Array.isArray(item.images)
                ? item.images[0]
                : item.images || 'https://via.placeholder.com/150'
            }}
            style={styles.itemImage}
          />

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
            </View>
          )}

          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
            <View style={styles.priceContainer}>
              <View>
                <Text style={styles.currentPrice}>₹{itemPrice.toLocaleString()}</Text>
                {unit === 'meter' && (
                  <Text style={styles.minLabel}>(Min {METER_MIN}m)</Text>
                )}
              </View>
              {itemOriginalPrice > itemPrice && (
                <Text style={styles.originalPrice}>₹{itemOriginalPrice.toLocaleString()}</Text>
              )}
            </View>
            {itemOriginalPrice > itemPrice && (
              <Text style={styles.savings}>
                You save ₹{(itemOriginalPrice - itemPrice).toLocaleString()}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addToCartButton, isAdding && styles.disabledButton]}
            onPress={() => handleAddToCart(item.id, item.name, item.category, item.slug)}
            disabled={isAdding || isRemoving}>
            {isAdding ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton, isRemoving && styles.disabledButton]}
            onPress={() => handleRemoveFromWishlist(item.id, item.name)}
            disabled={isRemoving || isAdding}>
            {isRemoving ? (
              <ActivityIndicator size="small" color={theme.colors.neutral[600]} />
            ) : (
              <Text style={styles.removeButtonText}>❌ Remove</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyWishlist = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💝</Text>
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Save your favorite sarees and products here to shop them later
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('MainTabs' as any)}>
        <Text style={styles.shopButtonText}>🛍️ Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading spinner
  if (isLoading && !wishlistItems.length) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
        <EnhancedHeader
          title="💝 My Wishlist"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title={`💝 Wishlist (${wishlistItems.length})`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
      />

      {/* Error Message */}
      {profileError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {profileError}</Text>
        </View>
      )}

      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item, index) => `wishlist_${item.wish_id || item.id || index}`}
            contentContainerStyle={styles.itemsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />
            }
          />

          {/* Move All to Cart Button */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.moveAllButton}
              onPress={() => {
                SafeAlert.confirm(
                  'Move to Cart',
                  `Move all ${wishlistItems.length} items to cart?`,
                  async () => {
                    try {
                      for (const item of wishlistItems) {
                        const unit = getProductUnit(item.category, item.slug);
                        const minQty = unit === 'meter' ? METER_MIN : 1;
                        await addToCart(item.id, minQty);
                      }
                      SafeAlert.success('Items Moved', 'All items have been moved to your cart.');
                      navigation.navigate('Cart');
                    } catch (error) {
                      SafeAlert.error('Error', 'Failed to move some items to cart.');
                    }
                  }
                );
              }}>
              <Text style={styles.moveAllText}>
                🛒 Move All Items to Cart
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <EmptyWishlist />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    marginTop: 12,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: theme.colors.error[50],
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  errorText: {
    color: theme.colors.error[700],
    fontSize: 14,
    textAlign: 'center',
  },
  itemsList: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: theme.colors.neutral[100],
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.accent[500],
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  minLabel: {
    fontSize: 10,
    color: theme.colors.neutral[500],
    marginTop: -2,
  },
  originalPrice: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 11,
    color: theme.colors.success[600],
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary[600],
  },
  removeButton: {
    backgroundColor: theme.colors.neutral[50],
  },
  disabledButton: {
    opacity: 0.7,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error[600],
  },
  bottomActions: {
    padding: 16,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  moveAllButton: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  moveAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

const WishlistScreen = WishlistScreenContent;

export default WishlistScreen;