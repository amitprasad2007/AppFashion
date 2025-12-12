import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedImage from '../components/EnhancedImage';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  amount?: string;
};

type OrderConfirmationRouteProps = RouteProp<RootStackParamList, 'OrderConfirmation'>;

const OrderConfirmationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<OrderConfirmationRouteProps>();

  // Extract order data from route params with fallbacks
  const {
    orderId = 'N/A',
    orderNumber = 'N/A',
    orderTotal = 0,
    paymentMethod = 'COD',
    paymentStatus = 'pending',
    orderStatus = 'pending',
    orderItems = [],
    orderDetails: serverOrderDetails,
  } = route.params || {};

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainTabs');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation])
  );

  // Helper function to format currency
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to get estimated delivery date
  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Transform cart items to display format
  const transformOrderItems = () => {
    if (serverOrderDetails?.cart_items && Array.isArray(serverOrderDetails.cart_items)) {
      return serverOrderDetails.cart_items.map((item: any) => ({
        id: item.id?.toString() || item.product_id?.toString() || Math.random().toString(),
        name: item.product?.name || item.name || 'Unknown Product',
        price: parseFloat(item.price || item.product?.price || '0'),
        quantity: item.quantity || 1,
        image: item.product?.image || item.image || 'https://via.placeholder.com/60',
        color: item.product?.color || item.color || '',
        amount: item.amount || (parseFloat(item.price || '0') * (item.quantity || 1)).toString(),
      }));
    } else if (orderItems && Array.isArray(orderItems)) {
      return orderItems.map((item: any) => ({
        id: item.id?.toString() || Math.random().toString(),
        name: item.name || item.product?.name || 'Unknown Product',
        price: parseFloat(item.price || item.product?.price || '0'),
        quantity: item.quantity || 1,
        image: item.image || item.product?.image || 'https://via.placeholder.com/60',
        color: item.color || item.selectedColor || '',
        amount: item.amount || (parseFloat(item.price || '0') * (item.quantity || 1)).toString(),
      }));
    }
    return [];
  };

  const orderDetails = {
    orderNumber: orderNumber || orderId,
    orderDate: serverOrderDetails?.created_at
      ? new Date(serverOrderDetails.created_at).toLocaleDateString('en-IN')
      : new Date().toLocaleDateString('en-IN'),
    estimatedDelivery: getEstimatedDelivery(),
    total: serverOrderDetails?.total_amount || orderTotal,
    subtotal: serverOrderDetails?.sub_total || orderTotal,
    tax: serverOrderDetails?.tax || 0, // Calculate if needed
    shipping_cost: serverOrderDetails?.shipping_cost || 0, // Free shipping for COD
    discount: serverOrderDetails?.discount || 0, // Calculate if needed
    items: transformOrderItems(),
    paymentMethod: {
      type: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod,
      status: paymentStatus,
      orderStatus: orderStatus,
    },
    orderInfo: {
      orderId: orderId,
      orderNumber: orderNumber,
      customerId: serverOrderDetails?.customer_id,
      addressId: serverOrderDetails?.address_id,
      paymentDetails: serverOrderDetails?.payment_details,
    }
  };

  const handleTrackOrder = () => {
    navigation.navigate('Orders');
  };

  const handleContinueShopping = () => {
    navigation.navigate('MainTabs');
  };

  const renderOrderItem = (item: OrderItem, index: number) => {
    const itemImageUrl = typeof item.image === 'string' && item.image.startsWith('http')
      ? item.image
      : item.image
        ? `https://superadmin.samarsilkpalace.com/storage/${item.image}`
        : 'https://via.placeholder.com/60';

    return (
      <View key={item.id} style={styles.orderItem}>
        <EnhancedImage
          source={{ uri: itemImageUrl }}
          style={styles.itemImage}
          width={60}
          height={60}
          borderRadius={theme.borderRadius.base}
          placeholder={item.name}
          fallbackIcon="📦"
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          {!!item.color && item.color !== 'Default' && (
            <Text style={styles.itemColor}>Color: {item.color}</Text>
          )}
          <Text style={styles.itemPrice}>
            {formatCurrency(item.price)} × {item.quantity}
          </Text>
        </View>
        <View style={styles.itemTotalContainer}>
          <Text style={styles.itemTotal}>
            {formatCurrency(item.amount || (item.price * item.quantity))}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.success[50]} />

      <EnhancedHeader
        title="Order Placed"
        showBackButton={false}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for your purchase. We've received your order and it will be processed soon.
            </Text>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Number</Text>
                <Text style={styles.infoValue}>#{orderDetails.orderNumber}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{orderDetails.orderDate}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Est. Delivery</Text>
                <Text style={styles.infoValue}>{orderDetails.estimatedDelivery}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Status</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: orderDetails.paymentMethod.status === 'paid' ? theme.colors.success[100] : theme.colors.warning[100] }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: orderDetails.paymentMethod.status === 'paid' ? theme.colors.success[700] : theme.colors.warning[800] }
                  ]}>
                    {(orderDetails.paymentMethod.status || 'PENDING').toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({orderDetails.items.length})</Text>
            {orderDetails.items.length > 0 ? (
              <View style={styles.itemsContainer}>
                {orderDetails.items.map(renderOrderItem)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No items info available</Text>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Info</Text>
            <View style={styles.card}>
              <Text style={styles.paymentType}>{orderDetails.paymentMethod.type}</Text>
              <Text style={styles.paymentDetails}>
                {orderDetails.paymentMethod.type === 'Cash on Delivery'
                  ? 'Pay cash upon delivery at your doorstep.'
                  : 'Payment processed successfully.'}
              </Text>
            </View>
          </View>

          {/* Order Total */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Totals</Text>
            <View style={styles.card}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(orderDetails.subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>
                  {orderDetails.shipping_cost > 0 ? formatCurrency(orderDetails.shipping_cost) : 'Free'}
                </Text>
              </View>
              {!!orderDetails.discount && orderDetails.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={[styles.totalValue, styles.discountText]}>
                    -{formatCurrency(orderDetails.discount)}
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total Amount</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(orderDetails.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* What's Next */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Next?</Text>
            <View style={styles.card}>
              <View style={styles.stepItem}>
                <Text style={styles.stepIcon}>📧</Text>
                <Text style={styles.stepText}>
                  Order confirmation email sent
                </Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepIcon}>📦</Text>
                <Text style={styles.stepText}>
                  We'll notify you when it ships
                </Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepIcon}>🚚</Text>
                <Text style={styles.stepText}>
                  Track your delivery status anytime
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleTrackOrder}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Track Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleContinueShopping}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50], // Cream background
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral[100],
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.neutral[600],
  },
  successHeader: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
    backgroundColor: theme.colors.success[50],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.success[100],
    marginBottom: 16,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.colors.success[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[800],
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemsContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.neutral[500],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[100],
    marginVertical: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
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
    lineHeight: 20,
  },
  itemColor: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: theme.colors.neutral[600],
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  emptyState: {
    backgroundColor: theme.colors.neutral[50],
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontStyle: 'italic',
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 6,
  },
  paymentDetails: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.colors.neutral[600],
  },
  totalValue: {
    fontSize: 15,
    color: theme.colors.neutral[900],
    fontWeight: '500',
  },
  discountText: {
    color: theme.colors.success[600],
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.neutral[700],
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary[600],
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  secondaryButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[700],
  },
});

export default OrderConfirmationScreen;