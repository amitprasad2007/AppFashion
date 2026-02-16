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
import { theme } from '../theme';
import { ApiProduct } from '../services/api_service';
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

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onPress, style }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    // Safety check - if product is missing, render a fallback or null
    if (!product) {
        return (
            <View style={[styles.container, styles.errorContainer, { width: CARD_WIDTH }, style]}>
                <Text style={styles.errorText}>Product unavailable</Text>
            </View>
        );
    }

    const { state: authState } = useAuth();
    const { addToCart, addToWishlist, removeFromWishlist, checkWishlist } = useUserProfile();

    const {
        id = 0,
        name = 'Unknown Product',
        price = 0,
        originalPrice = 0,
        rating = 0,
        reviewCount = 0,
        images = [],
        category,
        variants = [],
        defaultVariantId,
    } = product;

    const [addingToCart, setAddingToCart] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [togglingWishlist, setTogglingWishlist] = useState(false);

    // Initial check for wishlist status
    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            if (!id || !authState.isAuthenticated) return;

            try {
                // Determine default variant for checking
                let variantId = undefined;
                if (variants && variants.length > 0) {
                    const defaultVar = variants.find(v => v.id === defaultVariantId) || variants[0];
                    variantId = defaultVar?.id;
                }

                const status = await checkWishlist(id, variantId);
                if (isMounted) {
                    setIsWishlisted(!!status?.in_wishlist);
                }
            } catch (error) {
                // Fail silently for wishlist check
                console.log('Error checking wishlist status:', error);
            }
        };

        checkStatus();
        return () => { isMounted = false; };
    }, [id, authState.isAuthenticated]);

    const handleWishlistToggle = async () => {
        if (togglingWishlist) return;

        // Check if user is authenticated
        if (!authState.isAuthenticated) {
            SafeAlert.show(
                'Login Required',
                'Please login to manage your wishlist',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        try {
            setTogglingWishlist(true);

            // Determine variant
            let variantId = undefined;
            if (variants && variants.length > 0) {
                const defaultVar = variants.find(v => v.id === defaultVariantId) || variants[0];
                variantId = defaultVar?.id;
            }

            if (isWishlisted) {
                await removeFromWishlist(id, variantId);
                setIsWishlisted(false);
                SafeAlert.success('Removed', 'Item removed from wishlist');
            } else {
                await addToWishlist(id, variantId);
                setIsWishlisted(true);
                SafeAlert.success('Added', 'Item added to wishlist');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            SafeAlert.error('Error', 'Failed to update wishlist. Please try again.');
        } finally {
            setTogglingWishlist(false);
        }
    };

    const handleAddToCart = async () => {
        // Check if user is authenticated
        if (!authState.isAuthenticated) {
            SafeAlert.show(
                'Login Required',
                'Please login to add items to your cart',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        try {
            setAddingToCart(true);

            // Determine default variant
            let variantId = undefined;
            if (variants && variants.length > 0) {
                const defaultVar = variants.find(v => v.id === defaultVariantId) || variants[0];
                variantId = defaultVar?.id;
            }

            await addToCart(id, 1, {
                variant_id: variantId,
            });

            SafeAlert.show(
                'Added to Cart',
                `${name} has been added to your cart.`,
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

    const imageUrl = images && images.length > 0
        ? images[0]
        : `https://picsum.photos/300/400?random=${id}`;

    const discount = (originalPrice && originalPrice > price)
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
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

                {/* Wishlist Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleWishlistToggle}
                    disabled={togglingWishlist}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {togglingWishlist ? (
                        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                    ) : (
                        <Text style={[styles.heartIcon, isWishlisted && { color: 'red' }]}>
                            {isWishlisted ? '❤️' : '🤍'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Content Container */}
            <View style={styles.content}>
                {/* Category */}
                <Text style={styles.category} numberOfLines={1}>
                    {category?.title || 'Silk Saree'}
                </Text>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {name}
                </Text>

                {/* Price Section */}
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{(price || 0).toLocaleString()}</Text>
                    {originalPrice && originalPrice > price && (
                        <Text style={styles.originalPrice}>
                            ₹{originalPrice.toLocaleString()}
                        </Text>
                    )}
                </View>

                {/* Rating */}
                {rating > 0 && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.rating}>{rating}</Text>
                        <Text style={styles.reviews}>({reviewCount || 0})</Text>
                    </View>
                )}

                {/* Add to Cart Button */}
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
});

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: 16,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
        overflow: 'hidden',
    },
    imageContainer: {
        height: CARD_WIDTH * 1.3,
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
        height: 40,
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
    },
    errorContainer: {
        height: CARD_WIDTH * 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.neutral[50],
        borderStyle: 'dashed',
    },
    errorText: {
        color: theme.colors.neutral[400],
        fontSize: 12,
        fontWeight: '500',
    }
});

export default ProductCard;
