import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import { theme } from '../theme';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import { apiService, Order, OrderStatusUpdate } from '../services/api';

const OrdersScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  // API state management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | Order['status']>('ALL');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const statusFilters = [
    { key: 'ALL', label: 'All Orders', count: 0 },
    { key: 'PENDING', label: 'Pending', count: 0 },
    { key: 'CONFIRMED', label: 'Confirmed', count: 0 },
    { key: 'SHIPPED', label: 'Shipped', count: 0 },
    { key: 'DELIVERED', label: 'Delivered', count: 0 },
    { key: 'CANCELLED', label: 'Cancelled', count: 0 },
  ];

  // Load orders from API
  const loadOrders = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) setError(null);
      
      const params: any = { page: pageNum, limit: 10 };
      if (selectedFilter !== 'ALL') {
        params.status = selectedFilter;
      }
      
      const response = await apiService.getOrders(params);
      
      if (isRefresh || pageNum === 1) {
        setOrders(response.orders);
      } else {
        setOrders(prev => [...prev, ...response.orders]);
      }
      
      setHasMore(response.hasMore);
      setPage(pageNum);
      
      console.log('Orders loaded:', response.orders.length, 'total:', response.total);
      
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
      
      // Fallback orders for demo
      if (pageNum === 1) {
        setOrders([
          {
            id: 'demo_order_1',
            orderNumber: 'SSP2024001',
            items: [
              {
                id: 'item_1',
                productId: 11,
                product: {
                  id: 11,
                  name: 'Banarasi Kattan Buti Silk Saree',
                  slug: 'banarasi-buti-kattan-silk-saree',
                  images: ['https://superadmin.samarsilkpalace.com/storage/product-variant-images/FCToUaCthEL7jSXNuUeuOgSOn3c7twWfHgkdX9dA.jpg'],
                  price: 1649,
                  originalPrice: 2999,
                  rating: 4.3,
                  reviewCount: 3,
                  category: 'Silk Saree\'s',
                  isNew: false,
                  isBestseller: true,
                },
                quantity: 1,
                selectedSize: 'Free Size',
                addedAt: new Date().toISOString(),
                subtotal: 1649,
              }
            ],
            status: 'DELIVERED',
            paymentStatus: 'PAID',
            paymentMethod: {
              id: 'cod',
              type: 'COD',
              name: 'Cash on Delivery'
            },
            shippingAddress: {
              name: 'John Doe',
              phone: '+91 9876543210',
              addressLine1: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001'
            },
            totalItems: 1,
            totalAmount: 1649,
            deliveryCharge: 0,
            finalAmount: 1649,
            placedAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:15:00Z',
            estimatedDelivery: '2024-01-25',
          },
          {
            id: 'demo_order_2',
            orderNumber: 'SSP2024002',
            items: [
              {
                id: 'item_2',
                productId: 149,
                product: {
                  id: 149,
                  name: 'KANJIVARAM MUGHALAI BUTA SAREE',
                  slug: 'kanjivaram-mughalai-buta-saree',
                  images: ['https://superadmin.samarsilkpalace.com/storage/product-variant-images/LQrlXIjm5oeWlAXZaYgHfrUnE1x5ibqoGRpJWuPR.jpg'],
                  price: 2723,
                  originalPrice: 4950,
                  rating: 4.8,
                  reviewCount: 8,
                  category: 'Kanjivaram Silk',
                  isNew: false,
                  isBestseller: true,
                },
                quantity: 1,
                selectedSize: 'Free Size',
                addedAt: new Date().toISOString(),
                subtotal: 2723,
              }
            ],
            status: 'SHIPPED',
            paymentStatus: 'PAID',
            paymentMethod: {
              id: 'upi',
              type: 'UPI',
              name: 'UPI Payment'
            },
            shippingAddress: {
              name: 'Jane Smith',
              phone: '+91 9876543211',
              addressLine1: '456 Oak Avenue',
              city: 'Delhi',
              state: 'Delhi',
              pincode: '110001'
            },
            totalItems: 1,
            totalAmount: 2723,
            deliveryCharge: 99,
            finalAmount: 2822,
            placedAt: '2024-01-18T15:45:00Z',
            updatedAt: '2024-01-22T09:20:00Z',
            estimatedDelivery: '2024-01-28',
            trackingId: 'TRK123456789'
          }
        ]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadOrders(1, true);
  }, [selectedFilter]);

  // Refresh function
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadOrders(1, true);
  };

  // Load more orders
  const loadMore = () => {
    if (!loading && hasMore) {
      loadOrders(page + 1, false);
    }
  };

  // Cancel order
  const cancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelOrder(orderId, 'Customer requested cancellation');
              onRefresh(); // Reload orders
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Track order
  const trackOrder = (orderId: string) => {
    navigation.navigate('OrderTracking', { orderId });
  };

  // View order details
  const viewOrderDetails = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  // Reorder items
  const reorderItems = (order: Order) => {
    Alert.alert(
      'Reorder Items',
      'Add these items to your cart again?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: async () => {
            try {
              // Add each item to cart
              for (const item of order.items) {
                await apiService.addToCart(item.product.id, item.quantity, {
                  size: item.selectedSize,
                  color: item.selectedColor,
                });
              }
              Alert.alert('Success', 'Items added to cart!', [
                { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
                { text: 'Continue', style: 'cancel' }
              ]);
            } catch (error) {
              console.error('Error reordering:', error);
              Alert.alert('Error', 'Failed to add items to cart. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Get status color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return theme.colors.warning?.[500] || '#f59e0b';
      case 'CONFIRMED': return theme.colors.primary[500];
      case 'PROCESSING': return theme.colors.info?.[500] || '#3b82f6';
      case 'SHIPPED': return theme.colors.info?.[600] || '#2563eb';
      case 'OUT_FOR_DELIVERY': return theme.colors.purple?.[500] || '#8b5cf6';
      case 'DELIVERED': return theme.colors.success?.[500] || '#10b981';
      case 'CANCELLED': return theme.colors.error?.[500] || '#ef4444';
      case 'RETURNED': return theme.colors.gray?.[500] || '#6b7280';
      default: return theme.colors.neutral[500];
    }
  };

  // Format status text
  const formatStatus = (status: Order['status']) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter orders by status
  const filteredOrders = selectedFilter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  // Render order item
  const renderOrder = ({item, index}: {item: Order; index: number}) => (
    <AnimatedCard
      style={styles.orderCard}
      elevation="md"
      animationType="slide"
      delay={index * 100}
      onPress={() => viewOrderDetails(item.id)}>
      
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.placedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        {item.items.slice(0, 2).map((orderItem, idx) => (
          <View key={orderItem.id} style={styles.orderItemRow}>
            <Image source={{uri: orderItem.product.images[0]}} style={styles.orderItemImage} />
            <View style={styles.orderItemDetails}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {orderItem.product.name}
              </Text>
              <Text style={styles.orderItemInfo}>
                Qty: {orderItem.quantity} • ₹{orderItem.product.price}
              </Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 2} more item{item.items.length > 3 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Items:</Text>
          <Text style={styles.summaryValue}>{item.totalItems}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order Total:</Text>
          <Text style={styles.summaryValue}>₹{item.finalAmount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment:</Text>
          <Text style={styles.summaryValue}>{item.paymentMethod.name}</Text>
        </View>
        {item.estimatedDelivery && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expected by:</Text>
            <Text style={styles.summaryValue}>
              {new Date(item.estimatedDelivery).toLocaleDateString('en-IN')}
            </Text>
          </View>
        )}
      </View>

      {/* Order Actions */}
      <View style={styles.orderActions}>
        {item.status === 'SHIPPED' || item.status === 'OUT_FOR_DELIVERY' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => trackOrder(item.id)}>
            <Text style={styles.actionButtonText}>Track Order</Text>
          </TouchableOpacity>
        ) : null}
        
        {item.status === 'PENDING' || item.status === 'CONFIRMED' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => cancelOrder(item.id)}>
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        ) : null}
        
        {item.status === 'DELIVERED' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => reorderItems(item)}>
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </AnimatedCard>
  );

  // Render filter button
  const renderFilterButton = (filter: typeof statusFilters[0]) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.activeFilter,
      ]}
      onPress={() => setSelectedFilter(filter.key as any)}>
      <Text
        style={[
          styles.filterText,
          selectedFilter === filter.key && styles.activeFilterText,
        ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  // Show loading spinner
  if (loading && !refreshing && orders.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.colors.gradients.primary} style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.placeholder} />
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={theme.colors.gradients.primary} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={statusFilters}
          renderItem={({item}) => renderFilterButton(item)}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>
            {selectedFilter === 'ALL' ? 'No orders yet' : `No ${formatStatus(selectedFilter as Order['status']).toLowerCase()} orders`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === 'ALL' 
              ? 'Start shopping to see your orders here' 
              : 'Try changing the filter or check back later'
            }
          </Text>
          {selectedFilter === 'ALL' && (
            <GradientButton
              title="Start Shopping"
              onPress={() => navigation.navigate('Home')}
              gradient={theme.colors.gradients.primary}
              style={styles.shopButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() => (
            loading && orders.length > 0 ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              </View>
            ) : null
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error?.[50] || '#fef2f2',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.error?.[200] || '#fecaca',
  },
  errorText: {
    color: theme.colors.error?.[700] || '#b91c1c',
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  filtersList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.lg,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  activeFilter: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  filterText: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.neutral[600],
  },
  activeFilterText: {
    color: theme.colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.typography.size.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  shopButton: {
    marginTop: theme.spacing.lg,
  },
  ordersList: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderNumber: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[900],
  },
  orderDate: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.white,
  },
  itemsPreview: {
    marginBottom: theme.spacing.md,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
    marginBottom: 2,
  },
  orderItemInfo: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
  },
  moreItems: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weight.medium,
    marginLeft: 64, // Align with product names
  },
  orderSummary: {
    backgroundColor: theme.colors.neutral[50],
    padding: theme.spacing.md,
    borderRadius: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
  },
  summaryValue: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.neutral[900],
  },
  orderActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
  },
  cancelButton: {
    backgroundColor: theme.colors.error?.[500] || '#ef4444',
  },
  cancelButtonText: {
    color: theme.colors.white,
  },
  loadMoreContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
});

export default OrdersScreen;