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
import { getProductUnit, METER_MIN } from '../utils/productUnit';
import { resolveProductDisplayData, formatCurrency } from '../utils/pricing';
import Feather from 'react-native-vector-icons/Feather';

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
        slug = '',
        price = 0,
        originalPrice = 0,
        rating = 0,
        reviewCount = 0,
        images = [],
        category,
        variants = [],
        defaultVariantId,
    } = product;

    // Use centralized logic to resolve price, image and variant
    const displayData = resolveProductDisplayData(product);
    const { 
        displayPrice, 
        displayOriginalPrice, 
        imageUrl, 
        discount, 
        minQuantity,
        unitType
    } = displayData;

    const [addingToCart, setAddingToCart] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [togglingWishlist, setTogglingWishlist] = useState(false);

    // Initial check for wishlist status
    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            if (!id) return;

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

            await addToCart(id, minQuantity, {
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

    // Handlers and derived values moved up or simplified

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
                    style={styles.image as any}
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
                        <Feather 
                            name="heart" 
                            size={16} 
                            color={isWishlisted ? theme.colors.primary[500] : theme.colors.neutral[600]} 
                            style={isWishlisted ? styles.heartFilled : {}}
                        />
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
                    <Text style={styles.price}>{formatCurrency(displayPrice)}</Text>
                    {displayOriginalPrice > displayPrice && (
                        <Text style={styles.originalPrice}>
                            {formatCurrency(displayOriginalPrice)}
                        </Text>
                    )}
                </View>
                {unitType === 'meter' && (
                    <Text style={{ fontSize: 10, color: theme.colors.neutral[500], marginTop: -6, marginBottom: 8 }}>
                        (Min {METER_MIN}m)
                    </Text>
                )}

                {/* Rating */}
                {rating > 0 && (
                    <View style={styles.ratingContainer}>
                        <Feather name="star" size={12} color="#FBBF24" style={styles.star} />
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
        ...theme.shadows.md,
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
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
    },
    heartFilled: {
        color: theme.colors.primary[500],
    },
    content: {
        padding: 12,
    },
    category: {
        fontSize: 10,
        color: theme.colors.neutral[500],
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginBottom: 8,
        lineHeight: 18,
        height: 36,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.primary[800],
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 11,
        color: theme.colors.neutral[400],
        textDecorationLine: 'line-through',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: theme.colors.neutral[50],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    star: {
        marginRight: 4,
        color: '#FBBF24',
    },
    rating: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.neutral[800],
        marginRight: 4,
    },
    reviews: {
        fontSize: 11,
        color: theme.colors.neutral[500],
    },
    addButton: {
        backgroundColor: theme.colors.primary[900],
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: theme.colors.white,
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5,
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
