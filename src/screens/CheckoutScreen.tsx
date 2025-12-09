import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import GlassInput from '../components/GlassInput';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { apiService, Cart, ShippingAddress, PaymentMethod, Order } from '../services/api';
import ProtectedScreen from '../components/ProtectedScreen';
import razorpayService from '../services/razorpayService';

const CheckoutScreenContent = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const params = route.params as any;
  const cart = params?.cart;
  const cartItems = params?.cartItems;
  const total = params?.total;
  const subtotal = params?.subtotal;
  const shipping = params?.shipping;
  const tax = params?.tax;
  const discount = params?.discount;

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const [newAddress, setNewAddress] = useState<Omit<ShippingAddress, 'id'>>({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  useEffect(() => {
    loadCheckoutData();
    initializeRazorpay();
  }, []);
  const initializeRazorpay = () => {
    try {
      // TODO: Replace with your actual Razorpay credentials
      razorpayService.initialize({
        key_id: 'rzp_test_kQ8xDx79gF13e2', // Replace with your Razorpay Test/Live Key ID
        key_secret: 'hAWjjASWTuj3SHs3G4Q2s871', // This should be kept on server only
      });
      console.log('🔧 Razorpay initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Razorpay:', error);
    }
  };

  const loadCheckoutData = async () => {
    try {
      setLoading(true);

      const [addressesData, paymentMethodsData] = await Promise.all([
        apiService.getAddresses(),
        apiService.getPaymentMethods()
      ]);

      const transformedAddresses: ShippingAddress[] = addressesData.map(apiAddr => ({
        id: apiAddr.id.toString(),
        name: apiAddr.name,
        phone: apiAddr.phone,
        email: '',
        addressLine1: apiAddr.address,
        addressLine2: '', // ApiAddress doesn't have addressLine2
        city: apiAddr.city,
        state: apiAddr.state,
        pincode: apiAddr.postal,
        landmark: '', // ApiAddress doesn't have landmark
        isDefault: apiAddr.isDefault,
      }));

      setAddresses(transformedAddresses);

      const finalPaymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : [];

      setPaymentMethods(finalPaymentMethods);


      const defaultAddress = addressesData.find(addr => addr.isDefault) || addressesData[0];
      if (defaultAddress) {
        setSelectedAddress(transformedAddresses.find(addr => addr.id === defaultAddress.id.toString()) || null);
      }

      if (paymentMethodsData.length > 0) {
        setSelectedPayment(paymentMethodsData[0]);
      }

    } catch (error) {
      console.error('Error loading checkout data:', error);

      // Fallback payment methods
      const fallbackPaymentMethods: PaymentMethod[] = [
        { id: 'cod', type: 'COD', name: 'Cash on Delivery' },
        { id: 'upi', type: 'UPI', name: 'UPI Payment' },
        { id: 'card', type: 'CARD', name: 'Credit/Debit Card' },
        { id: 'netbanking', type: 'NETBANKING', name: 'Net Banking' },
      ];

      setPaymentMethods(fallbackPaymentMethods);
      setSelectedPayment(fallbackPaymentMethods[0]);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    try {
      if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 ||
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);
      const savedAddress = await apiService.createAddress({
        name: newAddress.name,
        type: 'shipping',
        phone: newAddress.phone,
        address: newAddress.addressLine1,
        city: newAddress.city,
        state: newAddress.state,
        postal: newAddress.pincode,
        isDefault: newAddress.isDefault || false,
      });
      setAddresses(prev => [...prev, {
        id: savedAddress.address?.id.toString() || '',
        name: savedAddress.address?.name || '',
        phone: savedAddress.address?.phone || '',
        email: '',
        addressLine1: savedAddress.address?.address || '',
        addressLine2: '',
        city: savedAddress.address?.city || '',
        state: savedAddress.address?.state || '',
        pincode: savedAddress.address?.postal || '',
        landmark: '',
        isDefault: savedAddress.address?.isDefault || false,
      }]);
      setSelectedAddress({
        id: savedAddress.address?.id.toString() || '',
        name: savedAddress.address?.name || '',
        phone: savedAddress.address?.phone || '',
        email: '',
        addressLine1: savedAddress.address?.address || '',
        addressLine2: '',
        city: savedAddress.address?.city || '',
        state: savedAddress.address?.state || '',
        pincode: savedAddress.address?.postal || '',
        landmark: '',
        isDefault: savedAddress.address?.isDefault || false,
      });
      setShowAddressForm(false);

    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Cash on Delivery payment
  const handleCODPayment = async (
    items: any[],
    address: ShippingAddress,
    finalTotal: number,
    itemsCount: number,
    itemsTotal: number,
    discountAmount: number,
    shippingAmount: number,
    taxAmount: number
  ) => {
    try {
      // Validate cart items before processing
      if (!items || items.length === 0) {
        throw new Error('No items found in cart');
      }

      // Use the specific COD checkout API
      const codOrderData = {
        items: items.map((item: any) => {
          // Handle different item structures from cart vs direct items
          const itemData = item.product || item;
          const itemImage = Array.isArray(itemData.images) ? itemData.images[0] :
            Array.isArray(itemData.image) ? itemData.image[0] :
              typeof itemData.image === 'string' ? itemData.image :
                itemData.images?.[0] || '';

          // Ensure all required fields are present
          const cartId = item.cart_id;
          const productId = itemData.id || item.id;
          const productName = itemData.name || item.name;
          const productPrice = (itemData.price || item.price || 0).toString();
          const quantity = item.quantity || 1;
          const color = item.selectedColor || item.color || itemData.color || 'Default';
          const slug = itemData.slug || item.slug || `product-${productId}`;

          // Validate required fields
          if (!productId || !productName || !productPrice) {
            console.error('Missing required item data:', {
              productId, productName, productPrice, item
            });
            throw new Error(`Missing required product data for item: ${productName || 'Unknown'}`);
          }

          return {
            cart_id: cartId,
            id: productId,
            name: productName,
            price: productPrice,
            quantity: quantity,
            image: itemImage,
            color: color,
            slug: slug,
          };
        }),
        address_id: parseInt(address.id || '1'),
        shipping: Number(shippingAmount) || 0,
        payment_method: 'cod',
        subtotal: Number(itemsTotal) || 0,
        shippingcost: Number(shippingAmount) || 0,
        tax: Number(taxAmount) || 0,
        total: Number(finalTotal) || 0,
        totalquantity: Number(itemsCount) || 0,
        coupon_code: null,
      };

      const authToken = apiService.getAuthToken();
      if (!authToken) {
        Alert.alert('Authentication Required', 'Please login to place an order.');
        return;
      }

      try {
        const serverCart = await apiService.getCart();
        if (serverCart.items.length === 0) {
          for (const item of codOrderData.items) {
            try {
              await apiService.addToCart(item.id, item.quantity);
            } catch (addError) {
              console.warn(`Failed to add item ${item.id}:`, addError);
            }
          }
        }
      } catch (cartError) {
        console.warn('Could not check/sync cart:', cartError);
      }

      const response = await apiService.checkoutCOD(codOrderData);

      if (response.success) {
        const orderDetails = response.order;
        const orderId = response.order_id || orderDetails?.order_id;
        const orderNumber = response.order_number || orderDetails?.order_id;
        try {
          await apiService.clearCart();
        } catch (clearError) {
          console.warn('Could not clear cart after order:', clearError);
        }

        Alert.alert(
          'Order Placed Successfully! 🎉',
          `Your order has been placed successfully!\n\nOrder ID: ${orderId}\nPayment: Cash on Delivery\nStatus: ${orderDetails?.status || 'Pending'}\nTotal: ₹${orderDetails?.total_amount || finalTotal}`,
          [{
            text: 'View Order',
            onPress: () => {
              navigation.navigate('OrderConfirmation', {
                orderId: orderId,
                orderNumber: orderNumber,
                orderTotal: orderDetails?.total_amount || finalTotal,
                paymentMethod: 'Cash on Delivery',
                paymentStatus: orderDetails?.payment_status || 'unpaid',
                orderStatus: orderDetails?.status || 'pending',
                orderItems: orderDetails?.cart_items || [],
                orderDetails: orderDetails
              });
            }
          }]
        );
      } else {
        throw new Error(response.message || 'Order placement failed');
      }
    } catch (error) {
      console.error('❌ COD payment failed:', error);
      throw error;
    }
  };

  const handleRazorpayPayment = async (
    items: any[],
    address: ShippingAddress,
    finalTotal: number,
    itemsCount: number,
    itemsTotal: number,
    discountAmount: number,
    shippingAmount: number,
    taxAmount: number
  ) => {
    try {
      const authToken = apiService.getAuthToken();
      if (!authToken) {
        Alert.alert('Authentication Required', 'Please login to place an order.');
        return;
      }
      const orderData = {
        items: items.map((item: any) => {
          const itemData = item.product || item;
          const itemImage = Array.isArray(itemData.images) ? itemData.images[0] :
            Array.isArray(itemData.image) ? itemData.image[0] :
              typeof itemData.image === 'string' ? itemData.image :
                itemData.images?.[0] || '';

          return {
            cart_id: item.cart_id,
            id: itemData.id || item.id,
            name: itemData.name || item.name,
            price: (itemData.price || item.price || 0).toString(),
            quantity: item.quantity || 1,
            image: itemImage,
            color: item.selectedColor || item.color || itemData.color || 'Default',
            slug: itemData.slug || item.slug || `product-${itemData.id}`,
          };
        }),
        address_id: parseInt(address.id || '1'),
        shipping: Number(shippingAmount) || 0,
        payment_method: 'online',
        subtotal: Number(itemsTotal) || 0,
        shippingcost: Number(shippingAmount) || 0,
        tax: Number(taxAmount) || 0,
        total: Number(finalTotal) || 0,
        totalquantity: Number(itemsCount) || 0,
        coupon_code: null,
      };

      const userInfo = {
        name: address.name,
        email: address.email || 'customer@example.com',
        phone: address.phone
      };

      // Use Razorpay service to process payment
      const paymentResult = await razorpayService.processPayment(selectedPayment!, orderData, userInfo);

      if (paymentResult.success) {
        console.log('✅ Razorpay payment successful:', paymentResult);

        // Clear cart after successful order
        try {
          await apiService.clearCart();
        } catch (clearError) {
          console.warn('Could not clear cart after order:', clearError);
        }

        // Show success message
        Alert.alert(
          'Payment Successful! 🎉',
          `Your order has been placed successfully!\n\nPayment: ${selectedPayment!.name}\nAmount: ₹${finalTotal}`,
          [{
            text: 'View Order',
            onPress: () => {
              navigation.navigate('OrderConfirmation', {
                orderId: paymentResult.paymentData?.razorpay_order_id || '',
                orderNumber: paymentResult.paymentData?.razorpay_order_id || '',
                orderTotal: finalTotal,
                paymentMethod: selectedPayment!.name,
                paymentStatus: 'paid',
                orderStatus: 'confirmed',
                orderItems: items,
                orderDetails: null
              });
            }
          }]
        );
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }
    } catch (error) {
      console.error('❌ Razorpay payment failed:', error);
      Alert.alert(
        'Payment Failed',
        `Payment could not be completed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  };

  // Place order (enhanced with Razorpay support)
  const placeOrder = async () => {
    try {
      if (!selectedAddress) {
        Alert.alert('Error', 'Please select a delivery address');
        return;
      }

      if (!selectedPayment) {
        Alert.alert('Error', 'Please select a payment method');
        return;
      }

      setLoading(true);

      // Determine the items to process
      const items = cart?.items || cartItems || [];

      // Calculate totals
      const itemsCount = cart?.totalItems ||
        (cartItems ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0);
      const itemsTotal = cart?.totalAmount || subtotal || 0;
      const discountAmount = cart?.discount || discount || 0;
      const shippingAmount = cart?.deliveryCharge || shipping || 0;
      const taxAmount = tax || 0;
      const finalTotal = cart?.finalAmount || total || 0;

      // Validate required data
      if (items.length === 0) {
        Alert.alert('Error', 'No items found in cart. Please add items to cart first.');
        return;
      }

      if (finalTotal <= 0) {
        Alert.alert('Error', 'Invalid order total. Please check your cart.');
        return;
      }

      // Handle different payment methods
      if (selectedPayment.type === 'COD' || selectedPayment.id === 'cod') {
        // Handle Cash on Delivery
        await handleCODPayment(items, selectedAddress, finalTotal, itemsCount, itemsTotal, discountAmount, shippingAmount, taxAmount);
      } else if (['UPI', 'CARD', 'NETBANKING', 'WALLET'].includes(selectedPayment.type)) {
        // Handle Razorpay payments
        await handleRazorpayPayment(items, selectedAddress, finalTotal, itemsCount, itemsTotal, discountAmount, shippingAmount, taxAmount);
      } else {
        throw new Error(`Unsupported payment method: ${selectedPayment.type}`);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Render cart summary (handle both cart and individual items)
  const renderCartSummary = () => {
    // Determine the items to display
    const items = cart?.items || cartItems || [];
    const itemsToShow = items.slice(0, 3);

    // Calculate totals
    const itemsCount = cart?.totalItems ||
      (cartItems ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0);
    const itemsTotal = cart?.totalAmount || subtotal || 0;
    const discountAmount = cart?.discount || discount || 0;
    const shippingAmount = cart?.deliveryCharge || shipping || 0;
    const finalTotal = cart?.finalAmount || total || 0;

    return (
      <AnimatedCard delay={100}>
        <GlassCard style={styles.section} gradientColors={theme.glassGradients.sunset}>
          <Text style={styles.sectionTitle}>📦 Order Summary</Text>

          {itemsToShow.map((item: any, index: number) => (
            <View key={item.id || index} style={styles.orderItem}>
              <Image
                source={{
                  uri: item.product?.images?.[0] ||
                    (Array.isArray(item.image) ? item.image[0] : item.image) ||
                    item.images?.[0] ||
                    'https://via.placeholder.com/50'
                }}
                style={styles.orderItemImage}
              />
              <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemName} numberOfLines={2}>
                  {item.product?.name || item.name}
                </Text>
                <Text style={styles.orderItemInfo}>
                  Qty: {item.quantity} • ₹{item.product?.price || item.price}
                </Text>
                {item.selectedSize && (
                  <Text style={styles.orderItemOption}>Size: {item.selectedSize}</Text>
                )}
              </View>
              <Text style={styles.orderItemPrice}>
                ₹{item.subtotal || (parseFloat(item.price) * item.quantity)}
              </Text>
            </View>
          ))}

          {items.length > 3 && (
            <Text style={styles.moreItems}>
              +{items.length - 3} more item{items.length > 4 ? 's' : ''}
            </Text>
          )}

          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({itemsCount})</Text>
              <Text style={styles.summaryValue}>₹{itemsTotal}</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>-₹{discountAmount}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                {shippingAmount > 0 ? `₹${shippingAmount}` : 'FREE'}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{finalTotal}</Text>
            </View>
          </View>
        </GlassCard>
      </AnimatedCard>
    );
  };

  // Render address selection
  const renderAddressSelection = () => (
    <AnimatedCard delay={200}>
      <GlassCard style={styles.section} gradientColors={theme.glassGradients.emerald}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏠 Delivery Address</Text>
          <TouchableOpacity onPress={() => setShowAddressForm(!showAddressForm)}>
            <GlassCard style={styles.addButtonCard} variant="light">
              <Text style={styles.addButton}>+ Add New</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {showAddressForm && (
          <GlassCard style={styles.addressForm} variant="light">
            <Text style={styles.formTitle}>📍 Add New Address</Text>

            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Full Name *"
                value={newAddress.name}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, name: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Phone Number *"
                value={newAddress.phone}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              value={newAddress.email}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Address Line 1 *"
              value={newAddress.addressLine1}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine1: text }))}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Address Line 2 (optional)"
              value={newAddress.addressLine2}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine2: text }))}
            />

            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City *"
                value={newAddress.city}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Pincode *"
                value={newAddress.pincode}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, pincode: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State *"
                value={newAddress.state}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Landmark"
                value={newAddress.landmark}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, landmark: text }))}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddressForm(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveAddress}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {addresses.map((address, index) => (
          <AnimatedCard key={address.id} delay={300 + index * 50}>
            <TouchableOpacity
              style={styles.addressCardContainer}
              onPress={() => setSelectedAddress(address)}>
              <GlassCard
                style={[styles.addressCard, selectedAddress?.id === address.id && styles.selectedAddress]}
                variant={selectedAddress?.id === address.id ? "base" : "light"}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressPhone}>{address.phone}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                </Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} - {address.pincode}
                </Text>
                {address.landmark && (
                  <Text style={styles.addressLandmark}>Near {address.landmark}</Text>
                )}
              </GlassCard>
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        {addresses.length === 0 && !showAddressForm && (
          <GlassCard style={styles.emptyState} variant="light">
            <Text style={styles.emptyStateText}>📍 No saved addresses</Text>
            <TouchableOpacity onPress={() => setShowAddressForm(true)}>
              <Text style={styles.addFirstAddressText}>Add your first address</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </GlassCard>
    </AnimatedCard>
  );

  // Render payment methods
  const renderPaymentMethods = () => {

    return (
      <AnimatedCard delay={400}>
        <GlassCard style={styles.section} gradientColors={theme.glassGradients.purple}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>

          {(paymentMethods || []).map((method, index) => (
            <AnimatedCard key={method.id} delay={450 + index * 50}>
              <TouchableOpacity
                style={styles.paymentMethodContainer}
                onPress={() => setSelectedPayment(method)}>
                <GlassCard
                  style={[styles.paymentMethod, selectedPayment?.id === method.id && styles.selectedPayment]}
                  variant={selectedPayment?.id === method.id ? "base" : "light"}>
                  <View style={styles.paymentMethodContent}>
                    <Text style={styles.paymentMethodIcon}>
                      {method.type === 'COD' ? '💵' :
                        method.type === 'UPI' ? '📱' :
                          method.type === 'CARD' ? '💳' :
                            method.type === 'NETBANKING' ? '🏦' : '💰'}
                    </Text>
                    <View style={styles.paymentMethodDetails}>
                      <Text style={styles.paymentMethodName}>{method.name}</Text>
                      {method.details && (
                        <Text style={styles.paymentMethodDetailsText}>{method.details}</Text>
                      )}
                      {['UPI', 'CARD', 'NETBANKING', 'WALLET'].includes(method.type) && (
                        <View style={styles.razorpayBadge}>
                          <Text style={styles.razorpayBadgeText}>Powered by Razorpay</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedPayment?.id === method.id && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </AnimatedCard>
          ))}

          {(!paymentMethods || paymentMethods.length === 0) && (
            <GlassCard style={styles.emptyState} variant="light">
              <Text style={styles.emptyStateText}>💳 No payment methods available</Text>
              <Text style={styles.addFirstAddressText}>Loading payment options...</Text>
            </GlassCard>
          )}
        </GlassCard>
      </AnimatedCard>
    );
  };

  // Render order notes
  const renderOrderNotes = () => (
    <AnimatedCard delay={500}>
      <GlassCard style={styles.section} gradientColors={theme.glassGradients.ocean}>
        <Text style={styles.sectionTitle}>📝 Order Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any special instructions for delivery..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={orderNotes}
          onChangeText={setOrderNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </GlassCard>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.aurora}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={8} />

      <EnhancedHeader
        title="💳 Checkout"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCartSummary()}
        {renderAddressSelection()}
        {renderPaymentMethods()}
        {renderOrderNotes()}

        <View style={styles.footer}>
          <View style={styles.totalSummary}>
            <Text style={styles.finalTotalLabel}>Total Amount:</Text>
            <Text style={styles.finalTotalValue}>₹{cart?.finalAmount || total || 0}</Text>
          </View>

          <GradientButton
            title={loading ? 'Placing Order...' : `Place Order - ₹${cart?.finalAmount || total || 0}`}
            onPress={placeOrder}
            gradient={theme.colors.gradients.primary}
            style={styles.placeOrderButton}
            disabled={loading || !selectedAddress || !selectedPayment}
          />

          <Text style={styles.secureText}>
            🔒 Your payment information is secure and encrypted
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
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
  placeholder: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
  },
  addButtonCard: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
  },
  addButton: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
  },

  // Order Summary Styles
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs,
  },
  orderItemInfo: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
  },
  orderItemOption: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.primary[500],
  },
  moreItems: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weight.medium,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.size.base,
    color: theme.colors.neutral[600],
  },
  summaryValue: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.neutral[900],
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

  // Address Form Styles
  addressForm: {
    backgroundColor: theme.colors.neutral[50],
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.size.base,
    marginBottom: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.neutral[200],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.neutral[700],
    fontWeight: theme.typography.weight.semibold,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weight.semibold,
  },

  // Address Card Styles
  addressCardContainer: {
    marginBottom: theme.spacing.md,
  },
  addressCard: {
    backgroundColor: theme.colors.neutral[50],
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAddress: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  addressName: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
  },
  addressPhone: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.spacing.sm,
  },
  defaultBadgeText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
  },
  addressText: {
    fontSize: theme.typography.size.base,
    color: theme.colors.neutral[700],
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  addressLandmark: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.size.base,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.sm,
  },
  addFirstAddressText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weight.semibold,
  },

  // Payment Method Styles
  paymentMethodContainer: {
    marginBottom: theme.spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPayment: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  paymentMethodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs,
  },
  paymentMethodDetailsText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs,
  },
  razorpayBadge: {
    backgroundColor: '#3395FF',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  razorpayBadgeText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.medium,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary[500],
  },

  // Notes Input
  notesInput: {
    backgroundColor: theme.colors.neutral[50],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.size.base,
    minHeight: 80,
  },

  // Footer
  footer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  totalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  finalTotalLabel: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[900],
  },
  finalTotalValue: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary[500],
  },
  placeOrderButton: {
    marginBottom: theme.spacing.md,
  },
  secureText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
});

const CheckoutScreen = () => {
  return (
    <ProtectedScreen fallbackMessage="Please sign in to proceed with checkout and place your order securely.">
      <CheckoutScreenContent />
    </ProtectedScreen>
  );
};

export default CheckoutScreen;