import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ViewStyle,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import { ApiProduct } from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAuth } from '../contexts/AuthContext';
import SafeAlert from '../utils/safeAlert';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44; // Approx 44% of screen width

interface ProductCardProps {
    product: ApiProduct;
    onPress: (product: ApiProduct) => void;
    style?: ViewStyle;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, style }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { state: authState } = useAuth();
    const { addToCart, addToWishlist, removeFromWishlist, checkWishlist } = useUserProfile();
    const [addingToCart, setAddingToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingWishlist, setTogglingWishlist] = useState(false);

    // Initial check for wishlist status
    useEffect(() => {
        const checkStatus = async () => {
            if (product && !togglingWishlist) {
                try {
                    // Determine default variant for checking
                    let variantId = undefined;
                    if (product.variants && product.variants.length > 0) {
                        const defaultVar = product.variants.find(v => v.id === product.defaultVariantId) || product.variants[0];
                        variantId = defaultVar.id;
                    }

                    const status = await checkWishlist(product.id, variantId);
                    setIsFavorite(status.in_wishlist);
                } catch (error) {
                    // Fail silently for wishlist check
                    console.log('Error checking wishlist status:', error);
                }
            }
        };

        checkStatus();
    }, [product.id, product.variants]); // Re-check if product changes
    console.log(isFavorite);

    const handleWishlistToggle = async () => {
        if (togglingWishlist) return;

        try {
            setTogglingWishlist(true);

            // Determine variant
            let variantId = undefined;
            if (product.variants && product.variants.length > 0) {
                const defaultVar = product.variants.find(v => v.id === product.defaultVariantId) || product.variants[0];
                variantId = defaultVar.id;
            }

            if (isFavorite) {
                await removeFromWishlist(product.id, variantId);
                setIsFavorite(false);
                SafeAlert.success('Removed', 'Item removed from wishlist');
            } else {
                await addToWishlist(product.id, variantId);
                setIsFavorite(true);
                SafeAlert.success('Added', 'Item added to wishlist');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            // Revert state on error if needed, or just show error
            SafeAlert.error('Error', 'Failed to update wishlist. Please try again.');
        } finally {
            setTogglingWishlist(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        // Check if user is authenticated
        if (!authState.isAuthenticated) {
            SafeAlert.show(
                'Login Required',
                'Please login to add items to your cart',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Login',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
            return;
        }

        try {
            setAddingToCart(true);

            // Determine default variant
            let variantId = undefined;
            if (product.variants && product.variants.length > 0) {
                // Try to find default variant or use first one
                const defaultVar = product.variants.find(v => v.id === product.defaultVariantId) || product.variants[0];
                variantId = defaultVar.id;
            }

            await addToCart(product.id, 1, {
                variant_id: variantId,
            });

            SafeAlert.show(
                'Added to Cart',
                `${product.name} has been added to your cart.`,
                [
                    { text: 'Continue Shopping', style: 'cancel' },
                    { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
                ]
            );
        } catch (error) {
            console.error('Error adding to cart:', error);
            SafeAlert.error('Error', 'Failed to add item to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };
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
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleWishlistToggle}
                    disabled={togglingWishlist}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {togglingWishlist ? (
                        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                    ) : (
                        <Text style={[styles.heartIcon, isFavorite && { color: 'red' }]}>
                            {isFavorite ? '❤️' : '🤍'}
                        </Text>
                    )}
                </TouchableOpacity>
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
                <TouchableOpacity
                    style={[styles.addButton, addingToCart && { opacity: 0.8 }]}
                    onPress={handleAddToCart}
                    disabled={addingToCart}
                >
                    {addingToCart ? (
                        <ActivityIndicator size="small" color={theme.colors.gold} />
                    ) : (
                        <Text style={styles.addButtonText}>ADD TO CART</Text>
                    )}
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
