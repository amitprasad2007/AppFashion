import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import EnhancedImage from '../components/EnhancedImage';
import { theme } from '../theme';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const OrderConfirmationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const orderDetails = {
    orderNumber: 'ORD001234',
    orderDate: new Date().toLocaleDateString(),
    estimatedDelivery: 'Dec 18, 2024',
    total: 269.97,
    items: [
      {
        id: '1',
        name: 'Summer Dress',
        price: 49.99,
        quantity: 2,
        image: 'https://via.placeholder.com/60',
      },
      {
        id: '2',
        name: 'Wireless Headphones',
        price: 89.99,
        quantity: 1,
        image: 'https://via.placeholder.com/60',
      },
      {
        id: '3',
        name: 'Running Shoes',
        price: 129.99,
        quantity: 1,
        image: 'https://via.placeholder.com/60',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St, Apt 4B',
      city: 'New York, NY 10001',
      country: 'United States',
    },
    paymentMethod: {
      type: 'Credit Card',
      last4: '1234',
    },
  };

  const handleTrackOrder = () => {
    navigation.navigate('Orders');
  };

  const handleContinueShopping = () => {
    navigation.navigate('MainTabs');
  };

  const renderOrderItem = (item: OrderItem) => (
    <View key={item.id} style={styles.orderItem}>
      <EnhancedImage 
        source={{uri: item.image}} 
        style={styles.itemImage}
        width={60}
        height={60}
        borderRadius={theme.borderRadius.lg}
        placeholder={item.name}
        fallbackIcon="📦"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          ₹{item.price} × {item.quantity}
        </Text>
      </View>
      <Text style={styles.itemTotal}>
        ₹{(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper 
      scrollable={true}
      showBackButton={false}
      headerComponent={
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order Confirmed</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      }>
      <View style={styles.contentContainer}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Order Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for your purchase. Your order has been placed successfully.
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
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        {orderDetails.items.map(renderOrderItem)}
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressName}>{orderDetails.shippingAddress.name}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.address}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.city}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.country}</Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentCard}>
          <Text style={styles.paymentType}>{orderDetails.paymentMethod.type}</Text>
          <Text style={styles.paymentDetails}>
            **** **** **** {orderDetails.paymentMethod.last4}
          </Text>
        </View>
      </View>

      {/* Order Total */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Total</Text>
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹261.97</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>Free</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>₹8.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ₹{orderDetails.total.toFixed(2)}
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
    </ScreenWrapper>
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
});

export default OrderConfirmationScreen;