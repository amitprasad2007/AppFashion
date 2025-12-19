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
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { apiService, ShippingAddress, PaymentMethod } from '../services/api';
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
  const [orderNotes, setOrderNotes] = useState('');
  const [summary, setSummary] = useState<{
    total_items: number;
    subtotal: number;
    total: number;
    discount: number;
    shipping: number;
    tax: number;
  } | null>(null);

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

  const [addressErrors, setAddressErrors] = useState<{
    name?: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }>({});

  useEffect(() => {
    loadCheckoutData();
  }, []);
  
  // Razorpay is initialized per-payment using server-provided key in razorpayService.createOrder()
  // No secrets are stored on the client.

  const loadCheckoutData = async () => {
    try {
      setLoading(true);

      const [addressesData, paymentMethodsData, cartSummary] = await Promise.all([
        apiService.getAddresses(),
        apiService.getPaymentMethods(),
        apiService.getCartSummary().catch(err => {
          console.warn('Cart summary not available, falling back to client totals:', err);
          return null;
        })
      ]);
      setSummary(cartSummary);

      const transformedAddresses: ShippingAddress[] = addressesData.map(apiAddr => ({
        id: apiAddr.id.toString(),
        name: apiAddr.name,
        phone: apiAddr.phone,
        email: '',
        addressLine1: apiAddr.address,
        addressLine2: '',
        city: apiAddr.city,
        state: apiAddr.state,
        pincode: apiAddr.postal,
        landmark: '',
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
        { id: 'online', type: 'ONLINE', name: 'Online Payment' }
      ];

      setPaymentMethods(fallbackPaymentMethods);
      setSelectedPayment(fallbackPaymentMethods[0]);
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = (addr: typeof newAddress): boolean => {
    const errors: typeof addressErrors = {};
    if (!addr.name.trim()) errors.name = 'Full name is required';
    const phone = addr.phone.replace(/\D/g, '');
    if (phone.length !== 10) errors.phone = 'Enter a valid 10-digit phone number';
    if (!addr.addressLine1.trim()) errors.addressLine1 = 'Address Line 1 is required';
    if (!addr.city.trim()) errors.city = 'City is required';
    if (!addr.state.trim()) errors.state = 'State is required';
    const pincode = addr.pincode.replace(/\D/g, '');
    if (pincode.length !== 6) errors.pincode = 'Enter a valid 6-digit pincode';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAddress = async () => {
    try {
      if (!validateAddress(newAddress)) {
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
      if (!items || items.length === 0) {
        throw new Error('No items found in cart');
      }

      const codOrderData = {
        items: items.map((item: any) => {
          const itemData = item.product || item;
          const itemImage = Array.isArray(itemData.images) ? itemData.images[0] :
            Array.isArray(itemData.image) ? itemData.image[0] :
              typeof itemData.image === 'string' ? itemData.image :
                itemData.images?.[0] || '';

          const cartId = item.cart_id;
          const productId = itemData.id || item.id;
          const productName = itemData.name || item.name;
          const productPrice = (itemData.price || item.price || 0).toString();
          const quantity = item.quantity || 1;
          const color = item.selectedColor || item.color || itemData.color || 'Default';
          const slug = itemData.slug || item.slug || `product-${productId}`;

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
        discount: Number(discountAmount) || 0,
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
              navigation.replace('OrderConfirmation', {
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
        discount: Number(discountAmount) || 0,
        total: Number(finalTotal) || 0,
        totalquantity: Number(itemsCount) || 0,
        coupon_code: null,
      };

      const userInfo = {
        name: address.name,
        email: address.email || 'customer@example.com',
        phone: address.phone
      };

      const paymentResult = await razorpayService.processPayment(selectedPayment!, orderData, userInfo);

      if (paymentResult.success) {
        console.log('✅ Razorpay payment successful:', paymentResult);

        try {
          await apiService.clearCart();
        } catch (clearError) {
          console.warn('Could not clear cart after order:', clearError);
        }

        Alert.alert(
          'Payment Successful! 🎉',
          `Your order has been placed successfully!\n\nPayment: ${selectedPayment!.name}\nAmount: ₹${finalTotal}`,
          [{
            text: 'View Order',
            onPress: () => {
              navigation.replace('OrderConfirmation', {
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
        `Payment could not be completed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [
          {
            text: 'Retry',
            onPress: () => {
              handleRazorpayPayment(items, address, finalTotal, itemsCount, itemsTotal, discountAmount, shippingAmount, taxAmount)
                .catch(() => {});
            }
          },
          {
            text: 'Use COD',
            onPress: () => {
              setSelectedPayment({ id: 'cod', type: 'COD', name: 'Cash on Delivery' });
              handleCODPayment(items, address, finalTotal, itemsCount, itemsTotal, discountAmount, shippingAmount, taxAmount)
                .catch(() => {});
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      throw error;
    }
  };

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

      const items = cart?.items || cartItems || [];

      // Calculate totals (prefer server summary if available)
      const itemsCount = summary?.total_items ?? (cart?.totalItems ||
        (cartItems ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0));
      const itemsTotal = summary?.subtotal ?? (cart?.totalAmount || subtotal || 0);
      const discountAmount = summary?.discount ?? (cart?.discount || discount || 0);
      const shippingAmount = summary?.shipping ?? (cart?.deliveryCharge || shipping || 0);
      const taxAmount = summary?.tax ?? (tax || 0);
      const finalTotal = summary?.total ?? (cart?.finalAmount || total || 0);

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
        await handleCODPayment(items, selectedAddress, finalTotal, itemsCount, itemsTotal, discountAmount, shippingAmount, taxAmount);
      } else if (selectedPayment.type === 'ONLINE' || selectedPayment.id === 'online') {
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

  const renderCartSummary = () => {
    const items = cart?.items || cartItems || [];
    const itemsToShow = items.slice(0, 3);

    const itemsCount = summary?.total_items ?? (cart?.totalItems ||
      (cartItems ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0));
    const itemsTotal = summary?.subtotal ?? (cart?.totalAmount || subtotal || 0);
    const discountAmount = summary?.discount ?? (cart?.discount || discount || 0);
    const shippingAmount = summary?.shipping ?? (cart?.deliveryCharge || shipping || 0);
    const taxAmount = summary?.tax ?? (cart?.tax || tax || 0);
    const finalTotal = summary?.total ?? (cart?.finalAmount || total || 0);

    return (
      <View style={styles.section}>
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
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              {taxAmount > 0 ? `₹${taxAmount}` : 'FREE'}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{finalTotal}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAddressSelection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏠 Delivery Address</Text>
        <TouchableOpacity onPress={() => setShowAddressForm(!showAddressForm)}>
          <Text style={styles.addButton}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {showAddressForm && (
        <View style={styles.addressForm}>
          <Text style={styles.formTitle}>📍 Add New Address</Text>

          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.halfInput, addressErrors.name ? styles.inputError : null]}
              placeholder="Full Name *"
              value={newAddress.name}
              onChangeText={(text) => {
                setNewAddress(prev => ({ ...prev, name: text }));
                if (addressErrors.name) setAddressErrors(prev => ({ ...prev, name: undefined }));
              }}
            />
            {addressErrors.name ? <Text style={styles.errorText}>{addressErrors.name}</Text> : null}
            <TextInput
              style={[styles.input, styles.halfInput, addressErrors.phone ? styles.inputError : null]}
              placeholder="Phone Number *"
              value={newAddress.phone}
              onChangeText={(text) => {
                const digits = text.replace(/\D/g, '').slice(0, 10);
                setNewAddress(prev => ({ ...prev, phone: digits }));
                if (addressErrors.phone) setAddressErrors(prev => ({ ...prev, phone: undefined }));
              }}
              keyboardType="phone-pad"
            />
            {addressErrors.phone ? <Text style={styles.errorText}>{addressErrors.phone}</Text> : null}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email (optional)"
            value={newAddress.email}
            onChangeText={(text) => setNewAddress(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
          />

          <TextInput
            style={[styles.input, addressErrors.addressLine1 ? styles.inputError : null]}
            placeholder="Address Line 1 *"
            value={newAddress.addressLine1}
            onChangeText={(text) => {
              setNewAddress(prev => ({ ...prev, addressLine1: text }));
              if (addressErrors.addressLine1) setAddressErrors(prev => ({ ...prev, addressLine1: undefined }));
            }}
            multiline
          />
          {addressErrors.addressLine1 ? <Text style={styles.errorText}>{addressErrors.addressLine1}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Address Line 2 (optional)"
            value={newAddress.addressLine2}
            onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine2: text }))}
          />

          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.halfInput, addressErrors.city ? styles.inputError : null]}
              placeholder="City *"
              value={newAddress.city}
              onChangeText={(text) => {
                setNewAddress(prev => ({ ...prev, city: text }));
                if (addressErrors.city) setAddressErrors(prev => ({ ...prev, city: undefined }));
              }}
            />
            {addressErrors.city ? <Text style={styles.errorText}>{addressErrors.city}</Text> : null}
            <TextInput
              style={[styles.input, styles.halfInput, addressErrors.pincode ? styles.inputError : null]}
              placeholder="Pincode *"
              value={newAddress.pincode}
              onChangeText={(text) => {
                const digits = text.replace(/\D/g, '').slice(0, 6);
                setNewAddress(prev => ({ ...prev, pincode: digits }));
                if (addressErrors.pincode) setAddressErrors(prev => ({ ...prev, pincode: undefined }));
              }}
              keyboardType="numeric"
            />
            {addressErrors.pincode ? <Text style={styles.errorText}>{addressErrors.pincode}</Text> : null}
          </View>

          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.halfInput, addressErrors.state ? styles.inputError : null]}
              placeholder="State *"
              value={newAddress.state}
              onChangeText={(text) => {
                setNewAddress(prev => ({ ...prev, state: text }));
                if (addressErrors.state) setAddressErrors(prev => ({ ...prev, state: undefined }));
              }}
            />
            {addressErrors.state ? <Text style={styles.errorText}>{addressErrors.state}</Text> : null}
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
        </View>
      )}

      {addresses.map((address, index) => (
        <TouchableOpacity
          key={address.id}
          style={[
            styles.addressCard,
            selectedAddress?.id === address.id && styles.selectedAddress
          ]}
          onPress={() => setSelectedAddress(address)}>
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
        </TouchableOpacity>
      ))}

      {addresses.length === 0 && !showAddressForm && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>📍 No saved addresses</Text>
          <TouchableOpacity onPress={() => setShowAddressForm(true)}>
            <Text style={styles.addFirstAddressText}>Add your first address</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPaymentMethods = () => {

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Method</Text>

        {(paymentMethods || []).map((method, index) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedPayment?.id === method.id && styles.selectedPayment
            ]}
            onPress={() => setSelectedPayment(method)}>
            <View style={styles.paymentMethodContent}>
              <Text style={styles.paymentMethodIcon}>
                {method.type === 'COD' ? '💵' :
                  method.type === 'ONLINE' ? '📱 💳 🏦 💰' : '💰'}
              </Text>
              <View style={styles.paymentMethodDetails}>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                {method.details && (
                  <Text style={styles.paymentMethodDetailsText}>{method.details}</Text>
                )}
                {['ONLINE'].includes(method.type) && (
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
          </TouchableOpacity>
        ))}

        {(!paymentMethods || paymentMethods.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>💳 No payment methods available</Text>
            <Text style={styles.addFirstAddressText}>Loading payment options...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderOrderNotes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 Order Notes (Optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Any special instructions for delivery..."
        placeholderTextColor={theme.colors.neutral[400]}
        value={orderNotes}
        onChangeText={setOrderNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title="Checkout"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>

        {renderAddressSelection()}
        {renderPaymentMethods()}
        {renderCartSummary()}
        {renderOrderNotes()}

        <GradientButton
          title={loading ? 'Processing...' : `Place Order - ₹${params?.total || params?.cart?.total || 0}`}
          onPress={placeOrder}
          disabled={loading}
          gradient={theme.colors.gradients.primary}
          style={styles.placeOrderButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50], // Cream background
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 12,
  },
  addButton: {
    color: theme.colors.primary[600],
    fontWeight: '600',
    fontSize: 14,
  },
  addressCard: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  selectedAddress: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginRight: 8,
  },
  addressPhone: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: theme.colors.neutral[200],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.neutral[600],
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    marginBottom: 2,
    lineHeight: 20,
  },
  addressLandmark: {
    fontSize: 13,
    color: theme.colors.neutral[500],
    fontStyle: 'italic',
    marginTop: 4,
  },
  addressForm: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    paddingBottom: 16,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
  },
  halfInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
  },
  cancelButtonText: {
    color: theme.colors.neutral[700],
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[900],
    borderRadius: 8,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: theme.colors.neutral[500],
    fontSize: 14,
    marginBottom: 8,
  },
  addFirstAddressText: {
    color: theme.colors.primary[600],
    fontWeight: '600',
    fontSize: 14,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  selectedPayment: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  paymentMethodDetailsText: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  razorpayBadge: {
    marginTop: 4,
    backgroundColor: '#3399cc15',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  razorpayBadgeText: {
    fontSize: 10,
    color: '#3399cc',
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary[600],
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  orderItemImage: {
    width: 50,
    height: 65,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: theme.colors.neutral[100],
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
  },
  orderItemInfo: {
    fontSize: 12,
    color: theme.colors.neutral[500],
  },
  orderItemOption: {
    fontSize: 11,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  moreItems: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginBottom: 12,
  },
  orderSummary: {
    paddingTop: 4,
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
  inputError: {
    borderColor: theme.colors.error[500],
  },
  errorText: {
    color: theme.colors.error[600],
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
    height: 80,
  },
  placeOrderButton: {
    marginTop: 16,
  },
});

const CheckoutScreen = () => {
  return (
    <ProtectedScreen fallbackMessage="Please sign in to complete your purchase.">
      <CheckoutScreenContent />
    </ProtectedScreen>
  );
};

export default CheckoutScreen;