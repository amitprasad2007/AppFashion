import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import { ApiProduct } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44; // Approx 44% of screen width

interface ProductCardProps {
    product: ApiProduct;
    onPress: (product: ApiProduct) => void;
    style?: ViewStyle;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, style }) => {
    const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : `https://picsum.photos/300/400?random=${product.id}`;

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={() => onPress(product)}
            activeOpacity={0.9}
        >
            {/* Image Container */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{discount}% OFF</Text>
                    </View>
                )}

                {/* Wishlist / Action Placeholder */}
                <View style={styles.actionButton}>
                    <Text style={styles.heartIcon}>🤍</Text>
                </View>
            </View>

            {/* Content Container */}
            <View style={styles.content}>
                {/* Category */}
                <Text style={styles.category} numberOfLines={1}>
                    {product.category?.title || 'Silk Saree'}
                </Text>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {product.name}
                </Text>

                {/* Price Section */}
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{(product.price || 0).toLocaleString()}</Text>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <Text style={styles.originalPrice}>
                            ₹{product.originalPrice.toLocaleString()}
                        </Text>
                    )}
                </View>

                {/* Rating */}
                {product.rating && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.rating}>{product.rating}</Text>
                        <Text style={styles.reviews}>({product.reviewCount || 0})</Text>
                    </View>
                )}

                {/* Add to Cart Button (Small) */}
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>ADD TO CART</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: 16,
        marginRight: 12,
        // Soft Shadow
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
        overflow: 'hidden',
    },
    imageContainer: {
        height: CARD_WIDTH * 1.3, // 3:4 Aspect Ratio roughly
        width: '100%',
        backgroundColor: theme.colors.neutral[100],
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: theme.colors.primary[600],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: theme.colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    heartIcon: {
        fontSize: 14,
    },
    content: {
        padding: 12,
    },
    category: {
        fontSize: 12,
        color: theme.colors.neutral[500],
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginBottom: 8,
        lineHeight: 20,
        height: 40, // Fixed height for 2 lines
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary[800],
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 12,
        color: theme.colors.neutral[400],
        textDecorationLine: 'line-through',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    star: {
        fontSize: 10,
        marginRight: 2,
    },
    rating: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.neutral[800],
        marginRight: 2,
    },
    reviews: {
        fontSize: 12,
        color: theme.colors.neutral[400],
    },
    addButton: {
        backgroundColor: theme.colors.neutral[900],
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    addButtonText: {
        color: theme.colors.gold,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default ProductCard;
