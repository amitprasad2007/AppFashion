import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { ApiCartItem } from '../../services/api_service/types';

interface CartItemProps {
    item: ApiCartItem;
    isUpdating: boolean;
    onUpdateQuantity: (newQuantity: number) => void;
    onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
    item,
    isUpdating,
    onUpdateQuantity,
    onRemove,
}) => {
    const itemPrice = parseFloat(item.price);
    const itemTotal = itemPrice * item.quantity;
    const imageUrl = Array.isArray(item.image) ? item.image[0] : item.image || 'https://via.placeholder.com/100';

    return (
        <View style={styles.cartItem}>
            <View style={styles.itemContent}>
                <Image source={{ uri: imageUrl }} style={styles.itemImage} />

                <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.currentPrice}>₹{item.price}</Text>
                    </View>
                    <Text style={styles.subtotal}>Subtotal: ₹{itemTotal.toFixed(2)}</Text>
                </View>

                <View style={styles.itemActions}>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={onRemove}
                        disabled={isUpdating}>
                        <Text style={styles.removeIcon}>🗑️</Text>
                    </TouchableOpacity>

                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                            onPress={() => onUpdateQuantity(item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}>
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>

                        <View style={styles.quantityDisplay}>
                            {isUpdating ? (
                                <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                            ) : (
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                            onPress={() => onUpdateQuantity(item.quantity + 1)}
                            disabled={isUpdating}>
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cartItem: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemContent: {
        flexDirection: 'row',
    },
    itemImage: {
        width: 80,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: theme.colors.neutral[100],
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginBottom: 4,
    },
    priceContainer: {
        marginBottom: 4,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary[600],
    },
    subtotal: {
        fontSize: 12,
        color: theme.colors.neutral[500],
    },
    itemActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingLeft: 8,
    },
    removeButton: {
        padding: 4,
    },
    removeIcon: {
        fontSize: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderRadius: 6,
        overflow: 'hidden',
    },
    quantityButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.neutral[50],
    },
    quantityButtonText: {
        fontSize: 16,
        color: theme.colors.neutral[600],
        fontWeight: '600',
    },
    quantityDisplay: {
        width: 32,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.colors.neutral[300],
        backgroundColor: theme.colors.white,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[900],
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default CartItem;
