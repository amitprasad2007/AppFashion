import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
    ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import apiService, { ApiProduct } from '../services/api_service';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import SafeAlert from '../utils/safeAlert';
import { theme } from '../theme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { getProductUnit, METER_MIN } from '../utils/productUnit';
import { resolveProductDisplayData } from '../utils/pricing';

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
        } finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); };

    const handleAddToCart = async (product: ApiProduct) => {
        setAddLoading(product.id);
        try {
            const unitType = getProductUnit((product.category as any)?.slug, product.slug || product.name);
            const minQuantity = unitType === 'meter' ? METER_MIN : 1;
            await addToCart(product.id, minQuantity);
            SafeAlert.show('Added to Cart', `${product.name} has been added to your cart successfully!`, [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
            ]);
        } catch (error) {
            SafeAlert.error('Error', 'Failed to add item to cart. Please try again.');
        } finally { setAddLoading(0); }
    };

    const renderItem = ({ item }: { item: ApiProduct }) => {
        const { displayPrice, displayOriginalPrice, imageUrl } = resolveProductDisplayData(item);
        const isAdding = addLoading === item.id;
        const unitType = getProductUnit((item.category as any)?.slug, item.slug || item.name);
        const discountPct = displayOriginalPrice > displayPrice
            ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
            : 0;

        return (
            <View style={styles.itemCard}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProductDetails', { productSlug: item.slug, product: item })}
                    style={styles.itemContent}
                    activeOpacity={0.7}
                >
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                        {discountPct > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discountPct}%</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currentPrice}>₹{displayPrice.toLocaleString()}</Text>
                            {displayOriginalPrice > displayPrice && (
                                <Text style={styles.originalPrice}>₹{displayOriginalPrice.toLocaleString()}</Text>
                            )}
                        </View>
                        {unitType === 'meter' && (
                            <Text style={styles.minLabel}>Min {METER_MIN} meters</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, isAdding && styles.disabledButton]}
                    onPress={() => handleAddToCart(item)}
                    disabled={isAdding}
                    activeOpacity={0.7}
                >
                    {isAdding ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                        <Text style={styles.addButtonText}>🛒 Add</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <EnhancedHeader title="Recently Viewed" showBackButton={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                    <Text style={styles.loadingText}>Loading recently viewed items...</Text>
                </View>
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
                <>
                    <View style={styles.countBar}>
                        <Text style={styles.countText}>{items.length} item{items.length !== 1 ? 's' : ''} viewed recently</Text>
                    </View>
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />}
                    />
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>👀</Text>
                    <Text style={styles.emptyTitle}>No Recently Viewed Items</Text>
                    <Text style={styles.emptySubtitle}>Items you view will appear here. Start exploring our collections!</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
                        <Text style={styles.shopButtonText}>🛍️  Explore Now</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: theme.colors.neutral[500], fontSize: 14 },
    countBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    countText: { fontSize: 13, fontWeight: '600', color: theme.colors.neutral[400], textTransform: 'uppercase', letterSpacing: 0.8 },
    listContent: { padding: 16 },
    itemCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white,
        borderRadius: 16, marginBottom: 12, padding: 14, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
        shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.colors.neutral[100],
    },
    itemContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    imageWrapper: { position: 'relative' },
    itemImage: {
        width: 72, height: 72, borderRadius: 12, marginRight: 14, backgroundColor: theme.colors.neutral[100],
    },
    discountBadge: {
        position: 'absolute', top: 4, left: 4, backgroundColor: theme.colors.error[500],
        paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
    },
    discountText: { color: '#fff', fontSize: 9, fontWeight: '700' },
    itemDetails: { flex: 1, marginRight: 8 },
    itemName: { fontSize: 14, fontWeight: '600', color: theme.colors.neutral[900], marginBottom: 6, lineHeight: 19 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    currentPrice: { fontSize: 16, fontWeight: '700', color: theme.colors.primary[700] },
    originalPrice: { fontSize: 12, color: theme.colors.neutral[400], textDecorationLine: 'line-through' },
    minLabel: { fontSize: 11, color: theme.colors.neutral[500], marginTop: 3 },
    addButton: {
        backgroundColor: theme.colors.primary[600], paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 10, minWidth: 70, alignItems: 'center',
    },
    disabledButton: { opacity: 0.7 },
    addButtonText: { color: 'white', fontSize: 12, fontWeight: '700' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 8 },
    emptySubtitle: { textAlign: 'center', color: theme.colors.neutral[500], marginBottom: 24, lineHeight: 22, fontSize: 15 },
    shopButton: {
        backgroundColor: theme.colors.primary[600], paddingHorizontal: 28, paddingVertical: 14,
        borderRadius: 12, shadowColor: theme.colors.primary[600], shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
    },
    shopButtonText: { color: 'white', fontWeight: '700', fontSize: 15 },
});

export default RecentlyViewedScreen;
