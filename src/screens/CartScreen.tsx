import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ApiCart, ApiCartItem } from '../services/api_service/types';
import { useUserProfile } from '../contexts/UserProfileContext';
import ProtectedScreen from '../components/ProtectedScreen';
import SafeAlert from '../utils/safeAlert';

// Modular Components
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CouponSection from '../components/cart/CouponSection';

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

  // Sync cart from userData
  useEffect(() => {
    if (userData?.cart_items) {
      setCart(userData.cart_items);
      AsyncStorage.setItem('cart', JSON.stringify(userData.cart_items)).catch(err =>
        console.warn('Failed to sync cart to local storage:', err)
      );
    }
  }, [userData]);

  // Initial load if no userData
  useEffect(() => {
    const initCart = async () => {
      if (!userData) {
        try {
          const savedCart = await AsyncStorage.getItem('cart');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
          const freshCart = await getCart();
          if (freshCart) setCart(freshCart);
        } catch (err) {
          console.error('Error initializing cart:', err);
        }
      }
    };
    initCart();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData]);

  const handleUpdateQuantity = async (cartItemId: number, productId: number, variantId: number | undefined, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId, productId, variantId);
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(cartItemId));
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      SafeAlert.error('Error', 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = (cartItemId: number, productId: number, variantId?: number) => {
    SafeAlert.show(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingItems(prev => new Set(prev).add(cartItemId));
              await removeFromCart(cartItemId, productId, variantId);
            } catch (error) {
              SafeAlert.error('Error', 'Failed to remove item');
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

  const handleClearCart = () => {
    if (!cart?.items?.length) return;

    SafeAlert.show(
      'Clear Cart',
      'Remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const item of cart.items) {
                await removeFromCart(item.cart_id, item.id, item.variant_id);
              }
            } catch (error) {
              SafeAlert.error('Error', 'Failed to clear cart');
            }
          },
        },
      ]
    );
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setApplyingCoupon(true);
      // Implementation pending API
      SafeAlert.show('Coming Soon', 'Coupon functionality is being implemented.');
      setCouponCode('');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (!cart?.items?.length) {
      SafeAlert.error('Cart Empty', 'Please add items before checkout.');
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

  const cartItemCount = useMemo(() =>
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    , [cart]);

  if (isLoading && !cart) {
    return (
      <View style={styles.container}>
        <EnhancedHeader title="Shopping Cart" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title={`Shopping Cart (${cartItemCount})`}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          cart?.items?.length ? (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
              <Text style={styles.clearIconText}>🗑️</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {profileError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {profileError}</Text>
        </View>
      )}

      {!cart?.items?.length ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>Add some items to get started</Text>
          <GradientButton
            title="Continue Shopping"
            onPress={() => navigation.navigate('MainTabs')}
            gradient={theme.colors.gradients.primary}
            style={styles.continueButton}
          />
        </View>
      ) : (
        <FlatList
          data={cart.items}
          renderItem={({ item }) => (
            <CartItem
              item={item}
              isUpdating={updatingItems.has(item.cart_id)}
              onUpdateQuantity={(q) => handleUpdateQuantity(item.cart_id, item.id, item.variant_id, q)}
              onRemove={() => handleRemoveItem(item.cart_id, item.id, item.variant_id)}
            />
          )}
          keyExtractor={item => `${item.cart_id}-${item.id}`}
          contentContainerStyle={styles.cartList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />
          }
          ListFooterComponent={() => (
            <View style={styles.footer}>
              <CouponSection
                couponCode={couponCode}
                onCouponCodeChange={setCouponCode}
                onApply={handleApplyCoupon}
                isApplying={applyingCoupon}
              />
              <CartSummary
                subtotal={cart.subtotal}
                discount={cart.discount}
                shipping={cart.shipping}
                tax={cart.tax}
                total={cart.total}
                onCheckout={handleCheckout}
              />
            </View>
          )}
        />
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
  errorContainer: {
    backgroundColor: theme.colors.error[50],
    padding: 10,
    margin: 10,
    borderRadius: 8,
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
  clearButton: {
    padding: 8,
  },
  clearIconText: {
    fontSize: 18,
  },
  footer: {
    marginTop: 8,
  },
});

const CartScreen = () => {
  return (
    <ProtectedScreen fallbackMessage="Please sign in to view your shopping cart.">
      <CartScreenContent />
    </ProtectedScreen>
  );
};

export default CartScreen;