import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  inStock: boolean;
  discount: number;
};

const WishlistScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'Summer Dress',
      price: 49.99,
      originalPrice: 79.99,
      image: 'https://via.placeholder.com/150',
      inStock: true,
      discount: 37,
    },
    {
      id: '2',
      name: 'Wireless Headphones',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://via.placeholder.com/150',
      inStock: true,
      discount: 31,
    },
    {
      id: '3',
      name: 'Designer Handbag',
      price: 199.99,
      originalPrice: 299.99,
      image: 'https://via.placeholder.com/150',
      inStock: false,
      discount: 33,
    },
    {
      id: '4',
      name: 'Running Shoes',
      price: 129.99,
      originalPrice: 159.99,
      image: 'https://via.placeholder.com/150',
      inStock: true,
      discount: 19,
    },
  ]);

  const removeFromWishlist = (id: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setWishlistItems(items => items.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const addToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }
    Alert.alert(
      'Added to Cart',
      `${item.name} has been added to your cart.`,
      [
        {text: 'Continue Shopping'},
        {text: 'View Cart', onPress: () => navigation.navigate('Cart')},
      ]
    );
  };

  const renderWishlistItem = ({item}: {item: WishlistItem}) => (
    <View style={styles.itemCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', {productId: item.id})}
        style={styles.itemContent}>
        <Image source={{uri: item.image}} style={styles.itemImage} />
        
        {/* Discount Badge */}
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
        
        {/* Stock Status */}
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{item.price}</Text>
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
          </View>
          <Text style={styles.savings}>
            You save ₹{(item.originalPrice - item.price).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !item.inStock && styles.disabledButton,
          ]}
          onPress={() => addToCart(item)}
          disabled={!item.inStock}>
          <Text
            style={[
              styles.addToCartText,
              !item.inStock && styles.disabledButtonText,
            ]}>
            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromWishlist(item.id)}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyWishlist = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💝</Text>
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Save items you love to your wishlist and shop them later
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('MainTabs')}>
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

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
        {wishlistItems.length > 0 && (
          <TouchableOpacity onPress={() => setWishlistItems([])}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.itemsList}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Move All to Cart Button */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.moveAllButton}
              onPress={() => {
                const inStockItems = wishlistItems.filter(item => item.inStock);
                if (inStockItems.length === 0) {
                  Alert.alert('No Items Available', 'All items in your wishlist are out of stock.');
                  return;
                }
                Alert.alert(
                  'Move to Cart',
                  `Move ${inStockItems.length} available items to cart?`,
                  [
                    {text: 'Cancel'},
                    {
                      text: 'Move All',
                      onPress: () => {
                        Alert.alert('Items Moved', 'Available items have been moved to your cart.');
                        navigation.navigate('Cart');
                      },
                    },
                  ]
                );
              }}>
              <Text style={styles.moveAllText}>
                Move Available Items to Cart
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