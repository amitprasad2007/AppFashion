import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { removeHtmlTags } from '../../utils/textUtils';

interface ProductInfoProps {
    name: string;
    categoryTitle?: string;
    rating?: number;
    reviewCount?: number;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    description?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
    name,
    categoryTitle,
    rating,
    reviewCount,
    price,
    originalPrice,
    discountPercentage,
    description,
}) => {
    const savings = originalPrice && originalPrice > price ? originalPrice - price : 0;

    return (
        <View style={styles.productInfoSection}>
            {/* Category Tag */}
            <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{categoryTitle || 'Premium Collection'}</Text>
            </View>

            {/* Product Name */}
            <Text style={styles.productName}>{name}</Text>

            {/* Rating */}
            <View style={styles.ratingSection}>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {rating || 4.5}</Text>
                </View>
                <Text style={styles.reviewText}>({reviewCount || 0} reviews)</Text>
            </View>

            {/* Price Section */}
            <View style={styles.priceSection}>
                <Text style={styles.currentPrice}>₹{price?.toLocaleString()}</Text>
                {originalPrice && originalPrice > price && (
                    <Text style={styles.originalPrice}>₹{originalPrice?.toLocaleString()}</Text>
                )}
                {savings > 0 && (
                    <View style={styles.savingsTag}>
                        <Text style={styles.savingsText}>Save ₹{savings.toLocaleString()}</Text>
                    </View>
                )}
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Product Details</Text>
                <Text style={styles.description}>
                    {removeHtmlTags(description) || 'Experience the elegance of this premium saree, crafted with the finest materials. Perfect for weddings, festivals, and special occasions.'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    productInfoSection: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    categoryTag: {
        alignSelf: 'flex-start',
        marginTop: 24,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 14,
        color: theme.colors.secondary[600],
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    productName: {
        fontSize: 26,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 12,
        lineHeight: 32,
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    ratingBadge: {
        backgroundColor: theme.colors.secondary[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.secondary[200],
    },
    ratingText: {
        fontSize: 14,
        color: theme.colors.secondary[700],
        fontWeight: '700',
    },
    reviewText: {
        fontSize: 14,
        color: theme.colors.neutral[500],
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    currentPrice: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.primary[800],
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 18,
        color: theme.colors.neutral[400],
        textDecorationLine: 'line-through',
        marginRight: 12,
    },
    savingsTag: {
        backgroundColor: theme.colors.success[50],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    savingsText: {
        color: theme.colors.success[700],
        fontWeight: '600',
        fontSize: 12,
    },
    descriptionSection: {
        marginBottom: 12,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[100],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: theme.colors.neutral[600],
        lineHeight: 24,
    },
});

export default ProductInfo;
