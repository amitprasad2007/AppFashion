import React, { useState, useEffect } from 'react';
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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import EnhancedHeader from '../components/EnhancedHeader';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ApiOrder } from '../services/api';
import { useUserProfile } from '../contexts/UserProfileContext';
import ProtectedScreen from '../components/ProtectedScreen';

const OrdersScreenContent = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const {
    userData,
    isLoading,
    error: profileError,
    getOrders,
    refreshUserData
  } = useUserProfile();

  // Local state management
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | string>('ALL');

  const statusFilters = [
    { key: 'ALL', label: 'All Orders', count: orders.length },
    { key: 'Pending', label: 'Pending', count: orders.filter(o => o.status === 'Pending').length },
    { key: 'Confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'Confirmed').length },
    { key: 'Shipped', label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length },
    { key: 'Delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
    { key: 'Cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length },
  ];

  // Load orders from API
  const loadOrders = async (isRefresh: boolean = false) => {
    try {
      setError(null);

      // Use the comprehensive user data if available
      if (userData?.orders) {
        let filteredOrders = userData.orders;

        // Apply status filter
        if (selectedFilter !== 'ALL') {
          filteredOrders = userData.orders.filter(order =>
            order.status.toLowerCase() === selectedFilter.toLowerCase()
          );
        }

        setOrders(filteredOrders);
      } else {
        // Fallback: fetch orders directly
        const fetchedOrders = await getOrders({
          status: selectedFilter !== 'ALL' ? selectedFilter : undefined
        });
        setOrders(fetchedOrders);
      }

    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
      setOrders([]); // Clear orders on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadOrders(true);
  }, [selectedFilter, userData]);

  // Update loading state based on user profile loading
  useEffect(() => {
    setLoading(isLoading && !userData);
  }, [isLoading, userData]);

  // Update error state
  useEffect(() => {
    setError(profileError);
  }, [profileError]);

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
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
          onPress: () => {
            Alert.alert('Cancel Order', 'Order cancellation functionality coming soon!');
          },
        },
      ]
    );
  };

  // Track order
  const trackOrder = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  // View order details
  const viewOrderDetails = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };


  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return theme.colors.warning?.[500] || '#f59e0b';
      case 'confirmed': return theme.colors.primary[500];
      case 'processing': return theme.colors.secondary?.[500] || '#64748b';
      case 'shipped': return theme.colors.info?.[600] || '#2563eb';
      case 'out for delivery': return '#8b5cf6';
      case 'delivered': return theme.colors.success?.[500] || '#10b981';
      case 'cancelled': return theme.colors.error?.[500] || '#ef4444';
      case 'returned': return theme.colors.neutral[500];
      default: return theme.colors.neutral[500];
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter orders by status
  const filteredOrders = selectedFilter === 'ALL'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === selectedFilter.toLowerCase());

  // Render order item
  const renderOrder = ({ item }: { item: ApiOrder }) => {
    return (
      <TouchableOpacity onPress={() => viewOrderDetails(item.id)} activeOpacity={0.8} style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>#{item.id}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          {item.items.slice(0, 2).map((orderItem) => (
            <View key={orderItem.id} style={styles.orderItemRow}>
              <Image
                source={{
                  uri: Array.isArray(orderItem.image)
                    ? orderItem.image[0]
                    : orderItem.image || 'https://via.placeholder.com/50'
                }}
                style={styles.orderItemImage}
              />
              <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemName} numberOfLines={1}>
                  {orderItem.name}
                </Text>
                <Text style={styles.orderItemInfo}>
                  Qty: {orderItem.quantity} • ₹{orderItem.price}
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
            <Text style={styles.summaryValue}>{item.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Total:</Text>
            <Text style={styles.summaryValue}>₹{item.total}</Text>
          </View>
        </View>

        {/* Order Actions */}
        <View style={styles.orderActions}>
          {item.status.toLowerCase() === 'shipped' || item.status.toLowerCase() === 'out for delivery' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => trackOrder(item.id)}>
              <Text style={styles.actionButtonText}>🚚 Track</Text>
            </TouchableOpacity>
          ) : null}

          {item.status.toLowerCase() === 'pending' || item.status.toLowerCase() === 'confirmed' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => cancelOrder(item.id)}>
              <Text style={styles.actionButtonText}>❌ Cancel</Text>
            </TouchableOpacity>
          ) : null}

          {item.status.toLowerCase() === 'delivered' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.reorderButton]}
              onPress={() => Alert.alert('Reorder', 'Reorder functionality coming soon!')}>
              <Text style={styles.actionButtonText}>🔄 Reorder</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // Render filter button
  const renderFilterButton = (filter: typeof statusFilters[0]) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.activeFilter
      ]}
      onPress={() => setSelectedFilter(filter.key as any)}>
      <Text
        style={[
          styles.filterText,
          selectedFilter === filter.key && styles.activeFilterText,
        ]}>
        {filter.label}
      </Text>
      {filter.count > 0 && (
        <View style={[
          styles.filterBadge,
          selectedFilter === filter.key ? styles.activeFilterBadge : null
        ]}>
          <Text style={[
            styles.filterBadgeText,
            selectedFilter === filter.key ? styles.activeFilterBadgeText : null
          ]}>{filter.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Show loading spinner
  if (loading && !refreshing && orders.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
        <EnhancedHeader
          title=" 🗳️ My Orders"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title="🗳️ My Orders"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

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
          renderItem={({ item }) => renderFilterButton(item)}
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
            {selectedFilter === 'ALL' ? 'No orders yet' : `No ${formatStatus(selectedFilter).toLowerCase()} orders`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === 'ALL'
              ? 'Start shopping to see your orders here'
              : 'Try changing the filter or check back later'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50], // Cream background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    marginTop: 12,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: theme.colors.error[50],
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  errorText: {
    color: theme.colors.error[700],
    fontSize: 14,
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.neutral[600],
  },
  activeFilterText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: theme.colors.neutral[300],
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.neutral[700],
  },
  activeFilterBadgeText: {
    color: theme.colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  ordersList: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
  },
  itemsPreview: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[100],
    marginRight: 12,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
  },
  orderItemInfo: {
    fontSize: 13,
    color: theme.colors.neutral[600],
  },
  moreItems: {
    fontSize: 12,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginTop: 4,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: theme.colors.neutral[50],
    padding: 12,
    borderRadius: 8,
  },
  summaryRow: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  trackButton: {
    backgroundColor: theme.colors.primary[600],
  },
  cancelButton: {
    backgroundColor: theme.colors.error[500],
  },
  reorderButton: {
    backgroundColor: theme.colors.secondary[500],
  },
});

const OrdersScreen = () => {
  return (
    <ProtectedScreen fallbackMessage="Please sign in to view your order history and track current orders.">
      <OrdersScreenContent />
    </ProtectedScreen>
  );
};

export default OrdersScreen;