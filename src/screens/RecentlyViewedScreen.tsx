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
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ApiProduct, apiService } from '../services/api';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import SafeAlert from '../utils/safeAlert';
import { theme } from '../theme';
import { useUserProfile } from '../contexts/UserProfileContext';

const RecentlyViewedScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { addToCart } = useUserProfile();

    const [items, setItems] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [addLoading, setAddLoading] = useState<number>(0);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await apiService.getRecentlyViewedItems();
            setItems(data);
        } catch (err) {
            console.error('Error loading recently viewed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const handleAddToCart = async (productId: number, productName: string) => {
        setAddLoading(productId);
        try {
            await addToCart(productId, 1);
            SafeAlert.show(
                'Added to Cart',
                `${productName} has been added to your cart successfully!`,
                [
                    { text: 'Continue Shopping', style: 'cancel' },
                    { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
                ]
            );
        } catch (error) {
            console.error('Error adding to cart:', error);
            SafeAlert.error('Error', 'Failed to add item to cart. Please try again.');
        } finally {
            setAddLoading(0);
        }
    };

    const renderItem = ({ item }: { item: ApiProduct }) => {
        const imageUrl = item.images && item.images.length > 0
            ? item.images[0]
            : 'https://via.placeholder.com/150';

        const isAdding = addLoading === item.id;

        return (
            <View style={styles.itemCard}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProductDetails', { productSlug: item.slug })}
                    style={styles.itemContent}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.itemImage}
                    />
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.currentPrice}>₹{(item.price || 0).toLocaleString()}</Text>
                            {item.originalPrice > (item.price || 0) && (
                                <Text style={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</Text>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, isAdding && styles.disabledButton]}
                    onPress={() => handleAddToCart(item.id, item.name)}
                    disabled={isAdding}
                >
                    {isAdding ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                        <Text style={styles.addButtonText}>Add to Cart</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                <Text style={styles.loadingText}>Loading recently viewed items...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader
                title="Recently Viewed"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
            />

            {items.length > 0 ? (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>👀</Text>
                    <Text style={styles.emptyTitle}>No Recently Viewed Items</Text>
                    <Text style={styles.emptySubtitle}>
                        Items you view will appear here. Start exploring our collections!
                    </Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.shopButtonText}>Explore Now</Text>
                    </TouchableOpacity>
                </View>
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
    loadingText: {
        marginTop: 12,
        color: theme.colors.neutral[600],
    },
    listContent: {
        padding: 16,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
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
        marginRight: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginBottom: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currentPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.primary[700],
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: theme.colors.neutral[400],
        textDecorationLine: 'line-through',
    },
    addButton: {
        backgroundColor: theme.colors.primary[600],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        minWidth: 80,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    addButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 8,
    },
    emptySubtitle: {
        textAlign: 'center',
        color: theme.colors.neutral[600],
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: theme.colors.primary[600],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default RecentlyViewedScreen;
