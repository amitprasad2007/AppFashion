import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ApiWishlistItem } from '../services/api';

const WishlistScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { 
    userData, 
    isLoading, 
    error: profileError,
    getWishlist,
    removeFromWishlist,
    removeFromWishlistById,
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
        console.log('Wishlist loaded from user data:', userData.wishlists.length, 'items');
      } else {
        // Fallback: fetch wishlist directly
        const wishlistData = await getWishlist();
        setWishlistItems(wishlistData);
        console.log('Wishlist fetched directly:', wishlistData.length, 'items');
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
    await refreshUserData();
  };

  const handleRemoveFromWishlist = (wishlistId: number, productName: string) => {
    Alert.alert(
      'Remove from Wishlist',
      `Are you sure you want to remove "${productName}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoveLoading(wishlistId);
            try {
              await removeFromWishlistById(wishlistId);
              Alert.alert('Removed', 'Item has been removed from your wishlist.');
            } catch (error) {
              console.error('Error removing from wishlist:', error);
              Alert.alert('Error', 'Failed to remove item from wishlist. Please try again.');
            } finally {
              setRemoveLoading(0);
            }
          },
        },
      ]
    );
  };

  const handleAddToCart = async (productId: number, productName: string) => {
    setAddLoading(productId);
    
    try {
      await addToCart(productId, 1);
      Alert.alert(
        'Added to Cart',
        `${productName} has been added to your cart successfully!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddLoading(0);
    }
  };

  const renderWishlistItem = ({item}: {item: ApiWishlistItem}) => {
    const discountPercentage = item.originalPrice 
      ? Math.round(((item.originalPrice - parseFloat(item.price)) / item.originalPrice) * 100)
      : 0;
    const isRemoving = removeLoading === item.wish_id;
    const isAdding = addLoading === item.id;

    return (
    <View style={styles.itemCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', {productSlug: item.slug})}>
        style={styles.itemContent}>
        <Image 
          source={{
            uri: Array.isArray(item.image) 
              ? item.image[0] 
              : item.image || 'https://via.placeholder.com/150'
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
            <Text style={styles.currentPrice}>₹{parseFloat(item.price).toLocaleString()}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</Text>
            )}
          </View>
          {item.originalPrice && (
            <Text style={styles.savings}>
              You save ₹{(item.originalPrice - parseFloat(item.price)).toFixed(2)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.addToCartButton, isAdding && styles.disabledButton]}
          onPress={() => handleAddToCart(item.id, item.name)}
          disabled={isAdding || isRemoving}>
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addToCartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.removeButton, isRemoving && styles.disabledButton]}
          onPress={() => handleRemoveFromWishlist(item.wish_id, item.name)}
          disabled={isRemoving || isAdding}>
          {isRemoving ? (
            <ActivityIndicator size="small" color="#ff6b6b" />
          ) : (
            <Text style={styles.removeButtonText}>Remove</Text>
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
        onPress={() => navigation.navigate('MainTabs')}>
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading spinner
  if (isLoading && !wishlistItems.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f43f5e" />
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Wishlist ({wishlistItems.length})
        </Text>
        <View style={styles.placeholder} />
      </View>

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
            keyExtractor={item => `wishlist_${item.wish_id}`}
            contentContainerStyle={styles.itemsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          
          {/* Move All to Cart Button */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.moveAllButton}
              onPress={() => {
                Alert.alert(
                  'Move to Cart',
                  `Move all ${wishlistItems.length} items to cart?`,
                  [
                    {text: 'Cancel'},
                    {
                      text: 'Move All',
                      onPress: async () => {
                        try {
                          for (const item of wishlistItems) {
                            await addToCart(item.id, 1);
                          }
                          Alert.alert('Items Moved', 'All items have been moved to your cart.');
                          navigation.navigate('Cart');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to move some items to cart.');
                        }
                      },
                    },
                  ]
                );
              }}>
              <Text style={styles.moveAllText}>
                Move All Items to Cart
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  placeholder: {
    width: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    fontWeight: '500',
  },
  backButton: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    fontSize: 16,
    color: '#ff6b6b',
  },
  itemsList: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    padding: 15,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledButtonText: {
    color: '#999',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  bottomActions: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  moveAllButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  moveAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 6,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default WishlistScreen;