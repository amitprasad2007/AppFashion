import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useUserProfile } from '../contexts/UserProfileContext';
import apiService, { ApiWishlistItem } from '../services/api_service';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import SafeAlert from '../utils/safeAlert';
import { theme } from '../theme';
import { getProductUnit, METER_MIN } from '../utils/productUnit';
import { resolveProductDisplayData } from '../utils/pricing';
import { ApiProduct } from '../services/api_service';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const WishlistScreenContent = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {
    userData, isLoading, error: profileError,
    getWishlist, removeFromWishlist, addToCart, refreshUserData
  } = useUserProfile();

  const [wishlistItems, setWishlistItems] = useState<ApiWishlistItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<number>(0);
  const [addLoading, setAddLoading] = useState<number>(0);

  const loadWishlist = async () => {
    try {
      if (userData?.wishlists) { setWishlistItems(userData.wishlists); }
      else { const data = await getWishlist(); setWishlistItems(data); }
    } catch (err) { setWishlistItems([]); }
    finally { setRefreshing(false); }
  };

  useEffect(() => { if (userData) setWishlistItems(userData.wishlists); }, [userData]);
  useEffect(() => { if (!userData) loadWishlist(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userData) await refreshUserData(); else await loadWishlist();
  };

  const handleRemoveFromWishlist = (productId: number, productName: string) => {
    SafeAlert.confirm('Remove from Wishlist', `Remove "${productName}" from your wishlist?`, async () => {
      setRemoveLoading(productId);
      try {
        await removeFromWishlist(productId);
        if (!userData) await loadWishlist();
      } catch (error) {
        SafeAlert.error('Error', 'Failed to remove item. Please try again.');
      } finally { setRemoveLoading(0); }
    });
  };

  const handleAddToCart = async (productId: number, productName: string, category: string, slug: string) => {
    setAddLoading(productId);
    try {
      const unit = getProductUnit(category, slug);
      const minQty = unit === 'meter' ? METER_MIN : 1;
      await addToCart(productId, minQty);
      SafeAlert.show('Added to Cart', `${productName} added to your cart!`, [
        { text: 'Continue', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error) {
      SafeAlert.error('Error', 'Failed to add item to cart.');
    } finally { setAddLoading(0); }
  };

  const renderWishlistItem = ({ item }: { item: ApiWishlistItem }) => {
    const productAdapter: any = {
      ...item,
      category: { slug: item.category, title: item.category },
      price: parseFloat(item.price),
      originalPrice: item.originalPrice,
    };
    const { displayPrice, displayOriginalPrice, discount, isThan } = resolveProductDisplayData(productAdapter);
    const unit = isThan ? 'meter' : 'piece';
    const isRemoving = removeLoading === item.id;
    const isAdding = addLoading === item.id;
    const imageUri = Array.isArray(item.images) ? item.images[0] : item.images || 'https://via.placeholder.com/150';

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', { productSlug: item.slug, product: productAdapter })}
          style={styles.itemContent} activeOpacity={0.7}
        >
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.itemImage} />
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            )}
          </View>

          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{displayPrice.toLocaleString()}</Text>
              {displayOriginalPrice > displayPrice && (
                <Text style={styles.originalPrice}>₹{displayOriginalPrice.toLocaleString()}</Text>
              )}
            </View>
            {unit === 'meter' && <Text style={styles.minLabel}>Min {METER_MIN} meters</Text>}
            {displayOriginalPrice > displayPrice && (
              <Text style={styles.savings}>You save ₹{(displayOriginalPrice - displayPrice).toLocaleString()}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.cartBtnContainer, isAdding && styles.disabledBtn]}
            onPress={() => handleAddToCart(item.id, item.name, item.category, item.slug)}
            disabled={isAdding || isRemoving} activeOpacity={0.7}
          >
            <LinearGradient colors={theme.colors.gradients?.primary || ['#6366f1', '#4f46e5']} style={styles.cartGradient}>
              {isAdding ? <ActivityIndicator size="small" color="#fff" /> : (
                <>
                  <Icon name="shopping-cart" size={16} color="#fff" style={{marginRight: 6}} />
                  <Text style={styles.cartBtnText}>Add to Cart</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.removeBtn, isRemoving && styles.disabledBtn]}
            onPress={() => handleRemoveFromWishlist(item.id, item.name)}
            disabled={isRemoving || isAdding} activeOpacity={0.7}
          >
            {isRemoving ? <ActivityIndicator size="small" color={theme.colors.neutral[600]} /> : <Icon name="trash-2" size={18} color={theme.colors.error?.[400] || theme.colors.neutral[400]} />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading && !wishlistItems.length) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
        <EnhancedHeader title="My Wishlist" showBackButton onBackPress={() => navigation.goBack()}
          rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />} />
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
        title={`Wishlist (${wishlistItems.length})`}
        showBackButton onBackPress={() => navigation.goBack()}
        rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
      />

      {profileError && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle" size={16} color={theme.colors.error?.[700] || '#b91c1c'} style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>{profileError}</Text>
        </View>
      )}

      {wishlistItems.length > 0 ? (
        <>
          <View style={styles.countBar}>
            <Text style={styles.countText}>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</Text>
          </View>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item, index) => `wishlist_${item.wish_id || item.id || index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />}
          />
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.moveAllBtnContainer} activeOpacity={0.8}
              onPress={() => {
                SafeAlert.confirm('Move to Cart', `Move all ${wishlistItems.length} items to cart?`, async () => {
                  try {
                    for (const item of wishlistItems) {
                      const unit = getProductUnit(item.category, item.slug);
                      await addToCart(item.id, unit === 'meter' ? METER_MIN : 1);
                    }
                    SafeAlert.success('Items Moved', 'All items moved to your cart.');
                    navigation.navigate('Cart');
                  } catch { SafeAlert.error('Error', 'Failed to move some items.'); }
                });
              }}>
              <LinearGradient colors={theme.colors.gradients?.primary || ['#6366f1', '#4f46e5']} style={styles.moveAllGradient}>
                <Icon name="shopping-cart" size={18} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.moveAllText}>Move All to Cart</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="heart" size={48} color={theme.colors.neutral[400]} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>Save your favorite sarees and products here to shop them later</Text>
          <TouchableOpacity style={styles.shopBtnContainer} onPress={() => navigation.navigate('MainTabs' as any)} activeOpacity={0.8}>
            <LinearGradient colors={theme.colors.gradients?.primary || ['#6366f1', '#4f46e5']} style={styles.shopGradient}>
              <Icon name="shopping-bag" size={16} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: theme.colors.neutral[500], marginTop: 12 },
  errorBanner: {
    padding: 12, backgroundColor: theme.colors.error?.[50] || '#fef2f2', marginHorizontal: 16, marginTop: 8,
    borderRadius: 10, borderWidth: 1, borderColor: theme.colors.error?.[200] || '#fecaca',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  errorText: { color: theme.colors.error?.[700] || '#b91c1c', fontSize: 13, textAlign: 'center' },
  countBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  countText: { fontSize: 13, fontWeight: '600', color: theme.colors.neutral[400], textTransform: 'uppercase', letterSpacing: 0.8 },
  listContent: { padding: 16 },

  // Item Card
  itemCard: {
    backgroundColor: theme.colors.white, borderRadius: 16, marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
    shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.colors.neutral[100],
  },
  itemContent: { flexDirection: 'row', padding: 14 },
  imageWrapper: { position: 'relative' },
  itemImage: {
    width: 100, height: 100, borderRadius: 12, marginRight: 14, backgroundColor: theme.colors.neutral[100],
  },
  discountBadge: {
    position: 'absolute', top: 6, left: 6, backgroundColor: theme.colors.error[500],
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  discountText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: theme.colors.neutral[900], marginBottom: 6, lineHeight: 20 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6,
  },
  categoryText: { fontSize: 11, color: theme.colors.neutral[600], fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 2 },
  currentPrice: { fontSize: 17, fontWeight: '700', color: theme.colors.primary[700] },
  originalPrice: { fontSize: 12, color: theme.colors.neutral[400], textDecorationLine: 'line-through' },
  minLabel: { fontSize: 11, color: theme.colors.neutral[500], marginTop: 2 },
  savings: { fontSize: 11, color: theme.colors.success?.[600] || '#059669', fontWeight: '600', marginTop: 2 },

  // Actions
  itemActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },
  cartBtnContainer: {
    flex: 1,
  },
  cartGradient: {
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  cartBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  removeBtn: {
    width: 56, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.neutral[50], borderLeftWidth: 1, borderLeftColor: theme.colors.neutral[100],
  },
  disabledBtn: { opacity: 0.6 },

  // Bottom
  bottomBar: {
    padding: 16, backgroundColor: theme.colors.white,
    borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },
  moveAllBtnContainer: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: theme.colors.primary[600], shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
  },
  moveAllGradient: {
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  moveAllText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  // Empty
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIconContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: theme.colors.neutral[500], textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  shopBtnContainer: {
    borderRadius: 12, overflow: 'hidden',
    shadowColor: theme.colors.primary[600], shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  shopGradient: {
    paddingHorizontal: 28, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  shopBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

const WishlistScreen = WishlistScreenContent;
export default WishlistScreen;