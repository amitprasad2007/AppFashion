import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

interface ProductImageGalleryProps {
    images: string[];
    selectedImageIndex: number;
    onSelectImage: (index: number) => void;
    isBestseller?: boolean;
    discountPercentage?: number;
    isFavorite: boolean;
    onToggleWishlist: () => void;
    togglingWishlist: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
    images,
    selectedImageIndex,
    onSelectImage,
    isBestseller,
    discountPercentage,
    isFavorite,
    onToggleWishlist,
    togglingWishlist,
}) => {
    return (
        <View>
            {/* Main Image */}
            <View style={styles.imageSection}>
                <Image
                    source={{ uri: images[selectedImageIndex] || images[0] }}
                    style={styles.productImage}
                />

                {/* Badges */}
                <View style={styles.badgeContainer}>
                    {isBestseller && (
                        <View style={styles.bestsellerBadge}>
                            <Text style={styles.badgeText}>Bestseller</Text>
                        </View>
                    )}
                    {discountPercentage !== undefined && discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.badgeText}>{discountPercentage}% OFF</Text>
                        </View>
                    )}
                </View>

                {/* Wishlist Button */}
                <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={onToggleWishlist}
                    disabled={togglingWishlist}>
                    {togglingWishlist ? (
                        <ActivityIndicator size="small" color="#ff6b6b" />
                    ) : (
                        <Text style={styles.heartIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                    )}
                </TouchableOpacity>

                {/* Image Indicators */}
                {images.length > 1 && (
                    <View style={styles.imageIndicators}>
                        {images.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.indicator,
                                    selectedImageIndex === index && styles.activeIndicator,
                                ]}
                                onPress={() => onSelectImage(index)}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
                <View style={styles.thumbnailSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailContainer}>
                        {images.map((image, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.thumbnail,
                                    selectedImageIndex === index && styles.activeThumbnail,
                                ]}
                                onPress={() => onSelectImage(index)}>
                                <Image source={{ uri: image }} style={styles.thumbnailImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    imageSection: {
        position: 'relative',
        backgroundColor: theme.colors.white,
    },
    productImage: {
        width: width,
        height: 450,
        resizeMode: 'cover',
    },
    badgeContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        gap: 8,
    },
    bestsellerBadge: {
        backgroundColor: theme.colors.secondary[500],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    discountBadge: {
        backgroundColor: theme.colors.primary[600],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    wishlistButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    heartIcon: {
        fontSize: 20,
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeIndicator: {
        backgroundColor: theme.colors.white,
        width: 20,
    },
    thumbnailSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: theme.colors.white,
    },
    thumbnailContainer: {
        gap: 12,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
    },
    activeThumbnail: {
        borderColor: theme.colors.primary[600],
        borderWidth: 2,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default ProductImageGallery;
