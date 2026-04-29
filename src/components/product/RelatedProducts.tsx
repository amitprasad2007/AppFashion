import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../../theme';
import { ApiProduct } from '../../services/api_service/types';
import { getProductUnit, METER_MIN } from '../../utils/productUnit';
import Feather from 'react-native-vector-icons/Feather';

interface RelatedProductsProps {
    products: ApiProduct[];
    onProductPress: (product: ApiProduct) => void;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, onProductPress }) => {
    if (!products || products.length === 0) return null;

    return (
        <View style={styles.relatedContainer}>
            <Text style={styles.relatedTitle}>You May Also Like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {products.map((item) => {
                    const unitType = getProductUnit(item.category?.slug, item.slug || item.name);
                    const minQuantity = unitType === 'meter' ? METER_MIN : 1;
                    let basePrice = Number(item.price) || 0;
                    
                    if (item.variants && item.variants.length > 0) {
                        const defaultVar = item.variants.find(v => v.id === item.defaultVariantId) || item.variants[0];
                        if (defaultVar) {
                            basePrice = Number(defaultVar.price ?? item.price) || basePrice;
                        }
                    }
                    
                    const displayPrice = basePrice * minQuantity;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.relatedProduct}
                            onPress={() => onProductPress(item)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.images[0] }} style={styles.relatedImage} />
                            </View>
                            <View style={styles.productDetails}>
                                <Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.priceRow}>
                                    <View>
                                        <Text style={styles.relatedPrice}>₹{displayPrice.toLocaleString()}</Text>
                                        {unitType === 'meter' && (
                                            <Text style={styles.minLabel}>(Min {METER_MIN}m)</Text>
                                        )}
                                    </View>
                                    <View style={styles.actionButton}>
                                        <Feather name="chevron-right" size={16} color={theme.colors.primary[500]} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    relatedContainer: {
        paddingVertical: theme.spacing.xl,
        backgroundColor: theme.colors.neutral[50],
    },
    relatedTitle: {
        fontSize: theme.typography.size.lg,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.neutral[900],
        marginBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.md,
    },
    relatedProduct: {
        width: 150,
        marginRight: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderRadius: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    imageContainer: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: theme.spacing.lg,
        borderTopRightRadius: theme.spacing.lg,
        overflow: 'hidden',
    },
    relatedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productDetails: {
        padding: theme.spacing.md,
    },
    relatedName: {
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.medium,
        color: theme.colors.neutral[800],
        marginBottom: theme.spacing.xs,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    relatedPrice: {
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.primary[600],
    },
    minLabel: {
        fontSize: 10,
        color: theme.colors.neutral[500],
        marginTop: 2,
    },
    actionButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RelatedProducts;
