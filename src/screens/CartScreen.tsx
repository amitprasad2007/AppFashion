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
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
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

  // Load cart data from user profile context
  const loadCart = async () => {
    try {
      if (userData?.cart_items) {
        setCart(userData.cart_items);
        console.log('Cart loaded from user data:', userData.cart_items.items.length, 'items');
      } else {
        // Fallback: fetch cart directly
        const cartData = await getCart();
        setCart(cartData);
        console.log('Cart fetched directly:', cartData.items.length, 'items');
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      // Set empty cart on error
      setCart({
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Load cart when user data changes
  useEffect(() => {
    if (userData) {
      setCart(userData.cart_items);
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
    await refreshUserData();
  };

  // Update quantity
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
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
  const removeItem = (cartItemId: number) => {
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
              await removeFromCart(cartItemId);
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
    if (!cart || cart.items.length === 0) return;
    
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
                await removeFromCart(item.id);
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
    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before proceeding.');
      return;
    }
    
    navigation.navigate('Checkout', {
      cartItems: cart.items.map(item => ({
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
  const renderCartItem = ({item, index}: {item: ApiCartItem; index: number}) => {
    const isUpdating = updatingItems.has(item.id);
    const itemPrice = parseFloat(item.price);
    const itemTotal = itemPrice * item.quantity;

    return (
      <AnimatedCard delay={index * 100}>
        <GlassCard style={styles.cartItem} variant="base">
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
              onPress={() => removeItem(item.id)}
              disabled={isUpdating}>
              <Text style={styles.removeIcon}>🗑️</Text>
            </TouchableOpacity>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
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
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={isUpdating}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </GlassCard>
      </AnimatedCard>
    );
  };

  // Show loading spinner
  if (isLoading && !cart) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.glassGradients.aurora}
          style={styles.backgroundGradient}
        />
        <FloatingElements count={6} />
        
        <EnhancedHeader 
          title="🛒 Shopping Cart"
          showBackButton={true}
        />
        
        <View style={styles.loadingContainer}>
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </GlassCard>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.aurora}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={6} />
      
      <EnhancedHeader 
        title={`🛒 Shopping Cart ${cart ? `(${cart.items.reduce((sum, item) => sum + item.quantity, 0)})` : ''}`}
        showBackButton={true}
        rightComponent={
          cart && cart.items.length > 0 ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearCart}>
              <GlassCard style={styles.clearIcon} variant="light">
                <Text style={styles.clearIconText}>🗑️</Text>
              </GlassCard>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Error Message */}
      {profileError && (
        <View style={styles.errorContainer}>
          <GlassCard style={styles.errorCard} variant="light">
            <Text style={styles.errorText}>⚠️ {profileError}</Text>
          </GlassCard>
        </View>
      )}

      {/* Cart Content */}
      {!cart || cart.items.length === 0 ? (
        <View style={styles.emptyCart}>
          <GlassCard style={styles.emptyCartCard} gradientColors={theme.glassGradients.sunset}>
            <Text style={styles.emptyCartIcon}>🛒</Text>
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtitle}>Add some beautiful sarees to get started</Text>
            <GradientButton
              title="Continue Shopping"
              onPress={continueShopping}
              gradient={theme.colors.gradients.primary}
              style={styles.continueButton}
            />
          </GlassCard>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={cart.items}
            renderItem={renderCartItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.cartList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={() => (
              <View style={styles.footer}>
                {/* Coupon Section */}
                <GlassCard style={styles.couponSection} variant="light">
                  <Text style={styles.sectionTitle}>💳 Have a Coupon?</Text>
                  <View style={styles.couponContainer}>
                    <TextInput
                      style={styles.couponInput}
                      placeholder="Enter coupon code"
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
                </GlassCard>

                {/* Order Summary */}
                <GlassCard style={styles.summarySection} variant="base">
                  <Text style={styles.sectionTitle}>📊 Order Summary</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items ({cart.items.reduce((sum, item) => sum + item.quantity, 0)})</Text>
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
                    <Text style={styles.totalValue}>₹{cart.total}</Text>
                  </View>
                </GlassCard>

                {/* Checkout Button */}
                <GradientButton
                  title={`Proceed to Checkout - ₹${cart.total}`}
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
    backgroundColor: theme.light.background,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
  },
  backIcon: {
    fontSize: 20,
    color: theme.colors.white,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  clearButton: {
    marginRight: theme.spacing[2],
  },
  clearIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIconText: {
    fontSize: 18,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
    paddingHorizontal: theme.spacing[6],
  },
  loadingText: {
    marginTop: theme.spacing[4],
    fontSize: theme.typography.body.large.fontSize,
    color: theme.colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    marginHorizontal: theme.spacing[4],
    marginVertical: theme.spacing[2],
  },
  errorCard: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
  },
  errorText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.medium.fontSize,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  emptyCartCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing[10],
    paddingHorizontal: theme.spacing[6],
  },
  emptyCartIcon: {
    fontSize: 80,
    marginBottom: theme.spacing[6],
  },
  emptyCartTitle: {
    fontSize: theme.typography.heading.h2.fontSize,
    fontWeight: theme.typography.heading.h2.fontWeight as any,
    color: theme.colors.white,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: theme.typography.body.large.fontSize,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    opacity: 0.9,
  },
  continueButton: {
    marginTop: theme.spacing.lg,
  },
  cartList: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  cartItem: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs,
  },
  itemCategory: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
    marginBottom: theme.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  currentPrice: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary[500],
  },
  originalPrice: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: theme.colors.success?.[500] || '#10b981',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.spacing.xs,
  },
  discountText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
  },
  selectedOption: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs,
  },
  subtotal: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[800],
  },
  itemActions: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  removeIcon: {
    fontSize: 18,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.spacing.lg,
    padding: theme.spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[600],
  },
  quantityDisplay: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    marginTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
  },
  couponSection: {
    marginBottom: theme.spacing[4],
    padding: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.heading.h3.fontSize,
    fontWeight: theme.typography.heading.h3.fontWeight as any,
    color: theme.colors.white,
    marginBottom: theme.spacing[4],
    textAlign: 'center',
  },
  couponContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.size.base,
  },
  applyButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  applyButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weight.semibold,
  },
  summarySection: {
    marginBottom: theme.spacing[4],
    padding: theme.spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.body.medium.fontSize,
    color: theme.colors.white,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: theme.typography.body.medium.fontSize,
    color: theme.colors.white,
    fontWeight: '600',
  },
  discountLabel: {
    color: theme.colors.success?.[600] || '#059669',
  },
  discountValue: {
    color: theme.colors.success?.[600] || '#059669',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[900],
  },
  totalValue: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary[500],
  },
  checkoutButton: {
    marginBottom: theme.spacing.lg,
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