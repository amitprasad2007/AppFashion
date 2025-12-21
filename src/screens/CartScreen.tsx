import React, { useState, useEffect } from 'react';
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
  TextInput,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ApiCart, ApiCartItem } from '../services/api';
import { useUserProfile } from '../contexts/UserProfileContext';
import ProtectedScreen from '../components/ProtectedScreen';

const CartScreenContent = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {
    userData,
    isLoading,
    error: profileError,
    getCart,
    updateCartItem,
    removeFromCart,
    refreshUserData
  } = useUserProfile();

  // Local state management
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Load cart data
  const loadCart = async () => {
    try {
      // 1. Try to load from local storage first for immediate display
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (e) {
          console.error('Error parsing local cart:', e);
        }
      }

      // 2. Fetch fresh data from API
      let serverCart: ApiCart | null = null;

      if (userData?.cart_items) {
        serverCart = userData.cart_items;
      } else {
        // Fallback: fetch cart directly
        serverCart = await getCart();
      }

      if (serverCart) {
        setCart(serverCart);
        // Sync to local storage
        await AsyncStorage.setItem('cart', JSON.stringify(serverCart));
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      // Only set empty if we don't have local data either
      if (!cart) {
        setCart({
          items: [],
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
        });
      }
    } finally {
      setRefreshing(false);
    }
  };
  
  // Load cart when user data changes
  useEffect(() => {
    if (userData?.cart_items) {
      setCart(userData.cart_items);
      // Keep local storage in sync
      AsyncStorage.setItem('cart', JSON.stringify(userData.cart_items)).catch(err =>
        console.error('Failed to update local cart storage:', err)
      );
    }
  }, [userData]);

  // Initial cart load
  useEffect(() => {
    if (!userData) {
      loadCart();
    }
  }, []);

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId: number, productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId, productId);
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(cartItemId));
      await updateCartItem(cartItemId, newQuantity);
      // Cart will be updated via refreshUserData in the context
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update item quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  // Remove item
  const removeItem = (cartItemId: number, productId: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingItems(prev => new Set(prev).add(cartItemId));
              await removeFromCart(cartItemId, productId);
              // Cart will be updated via refreshUserData in the context
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            } finally {
              setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  // Clear entire cart
  const clearCart = () => {
    if (!cart || !cart.items || cart.items.length === 0) return;

    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove each item individually since we don't have a clear cart endpoint
              for (const item of cart.items) {
                await removeFromCart(item.cart_id, item.id);
              }
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Apply coupon (placeholder - implement when coupon API is available)
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    try {
      setApplyingCoupon(true);
      // TODO: Implement coupon API endpoint
      Alert.alert('Feature Coming Soon', 'Coupon functionality will be available soon!');
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      Alert.alert('Error', 'Invalid coupon code or coupon has expired');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before proceeding.');
      return;
    }

    navigation.navigate('Checkout', {
      cartItems: cart.items.map(item => ({
        cart_id: item.cart_id,
        id: item.id.toString(),
        name: item.name,
        price: parseFloat(item.price),
        originalPrice: parseFloat(item.price),
        quantity: item.quantity,
        size: null,
        color: '',
        image: Array.isArray(item.image) ? item.image[0] : item.image,
      })),
      total: cart.total,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      tax: cart.tax,
      discount: cart.discount,
    });
  };

  // Continue shopping
  const continueShopping = () => {
    navigation.navigate('MainTabs');
  };

  // Render cart item
  const renderCartItem = ({ item, index }: { item: ApiCartItem; index: number }) => {
   // console.log('item', item);

    const isUpdating = updatingItems.has(item.id);
    const itemPrice = parseFloat(item.price);
    const itemTotal = itemPrice * item.quantity;

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemContent}>
          <Image
            source={{
              uri: Array.isArray(item.image) ? item.image[0] : item.image || 'https://via.placeholder.com/100'
            }}
            style={styles.itemImage}
          />

          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>₹{item.price}</Text>
            </View>

            <Text style={styles.subtotal}>Subtotal: ₹{itemTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.cart_id, item.id)}
              disabled={isUpdating}>
              <Text style={styles.removeIcon}>🗑️</Text>
            </TouchableOpacity>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                onPress={() => updateQuantity(item.cart_id, item.id, item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                {isUpdating ? (
                  <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                ) : (
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                onPress={() => updateQuantity(item.cart_id, item.id, item.quantity + 1)}
                disabled={isUpdating}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Show loading spinner
  if (isLoading && !cart) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <EnhancedHeader
          title="Shopping Cart"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title={`Shopping Cart ${cart && cart.items ? `(${cart.items.reduce((sum, item) => sum + item.quantity, 0)})` : ''}`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          cart && cart.items && cart.items.length > 0 ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCart}>
              <Text style={styles.clearIconText}>🗑️</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Error Message */}
      {profileError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {profileError}</Text>
        </View>
      )}

      {/* Cart Content */}
      {!cart || !cart.items || cart.items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>Add some beautiful sarees to get started</Text>
          <GradientButton
            title="Continue Shopping"
            onPress={continueShopping}
            gradient={theme.colors.gradients.primary}
            style={styles.continueButton}
          />
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={cart.items || []}
            renderItem={renderCartItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.cartList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />
            }
            ListFooterComponent={() => (
              <View style={styles.footer}>
                {/* Coupon Section */}
                <View style={styles.couponSection}>
                  <Text style={styles.sectionTitle}>Have a Coupon?</Text>
                  <View style={styles.couponContainer}>
                    <TextInput
                      style={styles.couponInput}
                      placeholder="Enter coupon code"
                      placeholderTextColor={theme.colors.neutral[400]}
                      value={couponCode}
                      onChangeText={setCouponCode}
                      editable={!applyingCoupon}
                    />
                    <TouchableOpacity
                      style={[styles.applyButton, applyingCoupon && styles.disabledButton]}
                      onPress={applyCoupon}
                      disabled={applyingCoupon}>
                      {applyingCoupon ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                      ) : (
                        <Text style={styles.applyButtonText}>Apply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Order Summary */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>Order Summary</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items ({cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0})</Text>
                    <Text style={styles.summaryValue}>₹{cart.subtotal}</Text>
                  </View>

                  {cart.discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
                      <Text style={[styles.summaryValue, styles.discountValue]}>-₹{cart.discount}</Text>
                    </View>
                  )}

                  {cart.shipping > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Shipping</Text>
                      <Text style={styles.summaryValue}>₹{cart.shipping}</Text>
                    </View>
                  )}

                  {cart.tax > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Tax</Text>
                      <Text style={styles.summaryValue}>₹{cart.tax}</Text>
                    </View>
                  )}

                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{cart.total.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Checkout Button */}
                <GradientButton
                  title={`Proceed to Checkout - ₹${cart.total.toFixed(2)}`}
                  onPress={proceedToCheckout}
                  gradient={theme.colors.gradients.primary}
                  style={styles.checkoutButton}
                />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50], // Cream background
  },
  clearButton: {
    marginRight: 8,
  },
  clearIconText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.neutral[600],
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: theme.colors.error[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  errorText: {
    color: theme.colors.error[700],
    fontSize: 14,
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    width: '100%',
    maxWidth: 250,
  },
  cartList: {
    padding: 14,
  },
  cartItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: theme.colors.neutral[100],
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
  },
  priceContainer: {
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  subtotal: {
    fontSize: 12,
    color: theme.colors.neutral[500],
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  removeIcon: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[50],
  },
  quantityButtonText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontWeight: '600',
  },
  quantityDisplay: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.white,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 12,
  },
  couponSection: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    color: theme.colors.neutral[900],
  },
  applyButton: {
    backgroundColor: theme.colors.neutral[900],
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  summarySection: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.neutral[600],
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.neutral[900],
    fontWeight: '500',
  },
  discountLabel: {
    color: theme.colors.success[700],
  },
  discountValue: {
    color: theme.colors.success[700],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  checkoutButton: {
    marginBottom: 2,
  },
});

const CartScreen = () => {
  return (
    <ProtectedScreen fallbackMessage="Please sign in to view your shopping cart and save items for later.">
      <CartScreenContent />
    </ProtectedScreen>
  );
};

export default CartScreen;