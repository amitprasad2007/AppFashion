import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';

interface ProductActionsProps {
    quantity: number;
    onUpdateQuantity: (q: number) => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    addingToCart: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({
    quantity,
    onUpdateQuantity,
    onAddToCart,
    onBuyNow,
    addingToCart,
}) => {
    return (
        <View style={styles.actionsSection}>
            {/* Quantity Selector */}
            <View style={styles.quantitySection}>
                <Text style={styles.sectionTitle}>Quantity</Text>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => quantity > 1 && onUpdateQuantity(quantity - 1)}>
                        <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.quantityDisplay}>
                        <Text style={styles.quantityText}>{quantity}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onUpdateQuantity(quantity + 1)}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.addToCartButton, addingToCart && styles.disabledButton]}
                    onPress={onAddToCart}
                    disabled={addingToCart}>
                    {addingToCart ? (
                        <ActivityIndicator size="small" color={theme.colors.primary[600]} />
                    ) : (
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buyNowButton}
                    onPress={onBuyNow}>
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    actionsSection: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 12,
    },
    quantitySection: {
        marginBottom: 24,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderRadius: 8,
        alignSelf: 'flex-start',
        height: 44,
    },
    quantityButton: {
        width: 44,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 20,
        color: theme.colors.neutral[600],
    },
    quantityDisplay: {
        width: 44,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.colors.neutral[300],
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.neutral[900],
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    addToCartButton: {
        flex: 1,
        height: 56,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.primary[600],
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary[600],
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: '#8b5cf6', // Purple as per original
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyNowText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default ProductActions;
