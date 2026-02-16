import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../../theme';
import { ApiProduct } from '../../services/api_service/types';

interface RelatedProductsProps {
    products: ApiProduct[];
    onProductPress: (product: ApiProduct) => void;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, onProductPress }) => {
    if (!products || products.length === 0) return null;

    return (
        <View style={styles.relatedContainer}>
            <Text style={styles.relatedTitle}>You May Also Like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {products.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.relatedProduct}
                        onPress={() => onProductPress(item)}>
                        <Image source={{ uri: item.images[0] }} style={styles.relatedImage} />
                        <Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.relatedPrice}>₹{item.price?.toLocaleString()}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    relatedContainer: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.neutral[50],
    },
    relatedTitle: {
        fontSize: theme.typography.size.lg,
        fontWeight: theme.typography.weight.semibold,
        color: theme.colors.neutral[900],
        marginBottom: theme.spacing.md,
    },
    relatedProduct: {
        width: 140,
        marginRight: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderRadius: theme.spacing.lg,
        overflow: 'hidden',
        padding: theme.spacing.sm,
    },
    relatedImage: {
        width: '100%',
        height: 120,
        borderRadius: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    relatedName: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.neutral[700],
        marginBottom: theme.spacing.xs,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    relatedPrice: {
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.semibold,
        color: theme.colors.primary[500],
    },
});

export default RelatedProducts;
