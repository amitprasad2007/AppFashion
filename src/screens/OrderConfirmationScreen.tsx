import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import EnhancedImage from '../components/EnhancedImage';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import { theme } from '../theme';
import LinearGradient from 'react-native-linear-gradient';

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
    tax: 0, // Calculate if needed
    shipping: 0, // Free shipping for COD
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
      <AnimatedCard key={item.id} delay={300 + index * 100}>
        <GlassCard style={styles.orderItem} variant="light">
          <EnhancedImage 
            source={{uri: itemImageUrl}} 
            style={styles.itemImage}
            width={60}
            height={60}
            borderRadius={theme.borderRadius.lg}
            placeholder={item.name}
            fallbackIcon="📦"
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            {item.color && item.color !== 'Default' && (
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
        </GlassCard>
      </AnimatedCard>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.aurora}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={10} />
      
      <EnhancedHeader 
        title="✅ Order Confirmed"
        showBackButton={false}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.closeButton}>
            <GlassCard style={styles.closeIcon} variant="light">
              <Text style={styles.closeIconText}>✕</Text>
            </GlassCard>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Order Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for your purchase. Your order has been placed successfully with {orderDetails.paymentMethod.type}.
        </Text>
      </View>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Number</Text>
            <Text style={styles.infoValue}>#{orderDetails.orderNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>{orderDetails.orderDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated Delivery</Text>
            <Text style={styles.infoValue}>{orderDetails.estimatedDelivery}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Status</Text>
            <Text style={[styles.infoValue, styles.statusValue]}>
              {orderDetails.paymentMethod.orderStatus?.charAt(0).toUpperCase() + 
               orderDetails.paymentMethod.orderStatus?.slice(1) || 'Pending'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status</Text>
            <Text style={[styles.infoValue, styles.paymentStatusValue]}>
              {orderDetails.paymentMethod.status?.charAt(0).toUpperCase() + 
               orderDetails.paymentMethod.status?.slice(1) || 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items Ordered ({orderDetails.items.length})</Text>
        {orderDetails.items.length > 0 ? (
          orderDetails.items.map(renderOrderItem)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items to display</Text>
          </View>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentCard}>
          <Text style={styles.paymentType}>{orderDetails.paymentMethod.type}</Text>
          <Text style={styles.paymentDetails}>
            {orderDetails.paymentMethod.type === 'Cash on Delivery' 
              ? 'Pay when your order is delivered to your doorstep'
              : `Payment Status: ${orderDetails.paymentMethod.status}`}
          </Text>
        </View>
      </View>

      {/* Order Total */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Total</Text>
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(orderDetails.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>
              {orderDetails.shipping > 0 ? formatCurrency(orderDetails.shipping) : 'Free'}
            </Text>
          </View>
          {orderDetails.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{formatCurrency(orderDetails.tax)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(orderDetails.total)}
            </Text>
          </View>
        </View>
      </View>

      {/* What's Next */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Next?</Text>
        <View style={styles.nextStepsCard}>
          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>📧</Text>
            <Text style={styles.stepText}>
              You'll receive an order confirmation email shortly
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>📦</Text>
            <Text style={styles.stepText}>
              We'll notify you when your order ships
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepIcon}>🚚</Text>
            <Text style={styles.stepText}>
              Track your delivery in real-time
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
          <Text style={styles.trackButtonText}>Track Your Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueShopping}>
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          If you have any questions about your order, please contact our customer support.
        </Text>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  successHeader: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fff8',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    margin: 15,
    padding: 20,
    borderRadius: 8,
  },
  section: {
    margin: 15,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemColor: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  emptyState: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statusValue: {
    color: '#28a745',
    fontWeight: '600',
  },
  paymentStatusValue: {
    color: '#ffc107',
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#666',
  },
  totalCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  nextStepsCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    padding: 15,
    gap: 10,
  },
  trackButton: {
    backgroundColor: '#ff6b6b',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  continueButton: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  helpSection: {
    backgroundColor: '#f8f9fa',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  helpButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
});

export default OrderConfirmationScreen;