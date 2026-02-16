import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import api, { ApiOrderItem, ApiAddress } from '../services/api_service';

type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

interface OrderDetails {
    id: string;
    order_number: string;
    status: string;
    total: number;
    items: ApiOrderItem[];
    shipping_address: ApiAddress;
    payment_method: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
}

const OrderDetailsScreen = () => {
    const route = useRoute<OrderDetailsRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getOrderDetails(orderId);
            if (response && response.order) {
                setOrder(response.order);
            } else {
                setError('Order not found');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return theme.colors.warning?.[500] || '#f59e0b';
            case 'confirmed': return theme.colors.primary[500];
            case 'processing': return theme.colors.secondary?.[500] || '#64748b';
            case 'shipped': return theme.colors.info?.[600] || '#2563eb';
            case 'out for delivery': return '#8b5cf6';
            case 'delivered': return theme.colors.success?.[500] || '#10b981';
            case 'cancelled': return theme.colors.error?.[500] || '#ef4444';
            default: return theme.colors.neutral[500];
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <EnhancedHeader title="Order Details" showBackButton={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                </View>
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={styles.container}>
                <EnhancedHeader title="Order Details" showBackButton={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error || 'Order not found'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title={`Order #${order.order_number || order.id}`} showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.statusTitle, { color: getStatusColor(order.status) }]}>
                        {order.status?.toUpperCase()}
                    </Text>
                    <Text style={styles.statusDate}>
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items in Order</Text>
                    {order.items.map((item, index) => (
                        <View key={item.id || index} style={styles.itemRow}>
                            <Image
                                source={{ uri: Array.isArray(item.image) ? item.image[0] : (item.image || 'https://via.placeholder.com/60') }}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                                <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Shipping Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressName}>{order.shipping_address?.name}</Text>
                        <Text style={styles.addressText}>{order.shipping_address?.address}</Text>
                        <Text style={styles.addressText}>
                            {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal}
                        </Text>
                        <Text style={styles.addressText}>Phone: {order.shipping_address?.phone}</Text>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Method</Text>
                        <Text style={styles.value}>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={[styles.value, { color: order.payment_status === 'paid' ? theme.colors.success[600] : theme.colors.warning[600] }]}>
                            {order.payment_status?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>₹{order.total}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Shipping</Text>
                        <Text style={styles.value}>Free</Text>
                    </View>
                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{order.total}</Text>
                    </View>
                </View>

                {/* Actions */}
                {order.status === 'pending' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => Alert.alert('Cancel Order', 'To cancel this order, please contact support.')}>
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[50],
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        paddingBottom: 30,
    },
    statusBanner: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statusDate: {
        fontSize: 14,
        color: theme.colors.neutral[600],
    },
    section: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[100],
        paddingBottom: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: theme.colors.neutral[100],
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 14,
        color: theme.colors.neutral[800],
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 12,
        color: theme.colors.neutral[500],
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginTop: 2,
    },
    addressContainer: {
        gap: 4,
    },
    addressName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[900],
    },
    addressText: {
        fontSize: 14,
        color: theme.colors.neutral[600],
        lineHeight: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: theme.colors.neutral[500],
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.neutral[900],
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[200],
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.neutral[900],
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary[600],
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.error[600],
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: theme.colors.primary[600],
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelButton: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.error[500],
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: theme.colors.error[600],
        fontWeight: '600',
        fontSize: 16,
    },
});

export default OrderDetailsScreen;
