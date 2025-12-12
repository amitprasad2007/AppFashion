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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { apiService, ApiOrder } from '../services/api';
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
        console.log('Orders loaded from user data:', filteredOrders.length);
      } else {
        // Fallback: fetch orders directly
        const fetchedOrders = await getOrders({
          status: selectedFilter !== 'ALL' ? selectedFilter : undefined
        });
        setOrders(fetchedOrders);
        console.log('Orders fetched directly:', fetchedOrders.length);
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
      case 'pending': return theme.colors.warning[500];
      case 'confirmed': return theme.colors.primary[500];
      case 'processing': return theme.colors.secondary[500];
      case 'shipped': return theme.colors.secondary[600];
      case 'out for delivery': return '#8b5cf6';
      case 'delivered': return theme.colors.success[500];
      case 'cancelled': return theme.colors.error[500];
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
  const renderOrder = ({ item, index }: { item: ApiOrder; index: number }) => {
    const gradients = [
      theme.glassGradients.aurora,
      theme.glassGradients.sunset,
      theme.glassGradients.emerald,
      theme.glassGradients.purple,
      theme.glassGradients.ocean,
    ];

    const gradient = gradients[index % gradients.length];

    return (
      <AnimatedCard delay={index * 100}>
        <TouchableOpacity onPress={() => viewOrderDetails(item.id)} activeOpacity={0.9}>
          <GlassCard style={styles.orderCard} gradientColors={gradient}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>#{item.id}</Text>
                <Text style={styles.orderDate}>{item.date}</Text>
              </View>
              <GlassCard style={styles.statusBadge} variant="light">
                <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
              </GlassCard>
            </View>

            {/* Order Items Preview */}
            <View style={styles.itemsPreview}>
              {item.items.slice(0, 2).map((orderItem, idx) => (
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
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order Status:</Text>
                <Text style={styles.summaryValue}>{item.status}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order Date:</Text>
                <Text style={styles.summaryValue}>{item.date}</Text>
              </View>
            </View>

            {/* Order Actions */}
            <View style={styles.orderActions}>
              {item.status.toLowerCase() === 'shipped' || item.status.toLowerCase() === 'out for delivery' ? (
                <TouchableOpacity
                  style={styles.actionButtonContainer}
                  onPress={() => trackOrder(item.id)}>
                  <GlassCard style={styles.actionButton} variant="light">
                    <Text style={styles.actionButtonText}>🚚 Track Order</Text>
                  </GlassCard>
                </TouchableOpacity>
              ) : null}

              {item.status.toLowerCase() === 'pending' || item.status.toLowerCase() === 'confirmed' ? (
                <TouchableOpacity
                  style={styles.actionButtonContainer}
                  onPress={() => cancelOrder(item.id)}>
                  <GlassCard style={[styles.actionButton, styles.cancelButton]} variant="light">
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>❌ Cancel</Text>
                  </GlassCard>
                </TouchableOpacity>
              ) : null}

              {item.status.toLowerCase() === 'delivered' ? (
                <TouchableOpacity
                  style={styles.actionButtonContainer}
                  onPress={() => Alert.alert('Reorder', 'Reorder functionality coming soon!')}>
                  <GlassCard style={styles.actionButton} variant="light">
                    <Text style={styles.actionButtonText}>🔄 Reorder</Text>
                  </GlassCard>
                </TouchableOpacity>
              ) : null}
            </View>
          </GlassCard>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  // Render filter button
  const renderFilterButton = (filter: typeof statusFilters[0]) => (
    <TouchableOpacity
      key={filter.key}
      style={styles.filterButtonContainer}
      onPress={() => setSelectedFilter(filter.key as any)}>
      <GlassCard
        style={[styles.filterButton, selectedFilter === filter.key && styles.activeFilter]}
        variant={selectedFilter === filter.key ? 'base' : 'light'}>
        <Text
          style={[
            styles.filterText,
            selectedFilter === filter.key && styles.activeFilterText,
          ]}>
          {filter.label}
        </Text>
        {filter.count > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{filter.count}</Text>
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );

  // Show loading spinner
  if (loading && !refreshing && orders.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.glassGradients.rose}
          style={styles.backgroundGradient}
        />
        <FloatingElements count={6} />

        <EnhancedHeader
          title="📋 My Orders"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.loadingContainer}>
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </GlassCard>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.rose}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={6} />

      <EnhancedHeader
        title="📋 My Orders"
        showBackButton={true}
      />

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <GlassCard style={styles.errorCard} variant="light">
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </GlassCard>
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
          <GlassCard style={styles.emptyCard} gradientColors={theme.glassGradients.sunset}>
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
            {selectedFilter === 'ALL' && (
              <GradientButton
                title="🛍️ Start Shopping"
                onPress={() => navigation.navigate('MainTabs' as any)}
                gradient={theme.colors.gradients.primary}
                style={styles.shopButton}
              />
            )}
          </GlassCard>
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  actionButtonContainer: {
    flex: 1,
  },
  filterButtonContainer: {
    marginRight: theme.spacing.sm,
  },
  filterBadge: {
    marginLeft: theme.spacing.xs,
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.spacing.sm,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
  },
  loadingCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorCard: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
});

const OrdersScreen = () => {
  return (
    <ProtectedScreen fallbackMessage="Please sign in to view your order history and track current orders.">
      < OrdersScreenContent />
    </ProtectedScreen >
  );
};

export default OrdersScreen;