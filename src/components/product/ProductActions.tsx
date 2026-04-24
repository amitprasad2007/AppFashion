import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { ProductUnit, METER_STEP, METER_MIN, METER_PRESETS, formatQuantity } from '../../utils/productUnit';

interface ProductActionsProps {
    quantity: number;
    onUpdateQuantity: (q: number) => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    addingToCart: boolean;
    unit?: ProductUnit;
}

const ProductActions: React.FC<ProductActionsProps> = ({
    quantity,
    onUpdateQuantity,
    onAddToCart,
    onBuyNow,
    addingToCart,
    unit = 'piece',
}) => {
    const isMeter = unit === 'meter';
    const step = isMeter ? METER_STEP : 1;
    const minQty = isMeter ? METER_MIN : 1;

    const handleDecrement = () => {
        if (quantity > minQty) {
            onUpdateQuantity(Math.max(minQty, quantity - step));
        }
    };

    const handleIncrement = () => {
        onUpdateQuantity(quantity + step);
    };
    return (
        <View style={styles.actionsSection}>
            {/* Presets for Meter-based Products */}
            {isMeter && (
                <View style={styles.presetsSection}>
                    <Text style={styles.sectionTitle}>Select Length</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
                        {METER_PRESETS.map((preset) => (
                            <TouchableOpacity
                                key={preset}
                                style={[styles.presetButton, quantity === preset && styles.presetButtonActive]}
                                onPress={() => onUpdateQuantity(preset)}
                            >
                                <Text style={[styles.presetText, quantity === preset && styles.presetTextActive]}>
                                    {preset}m
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Quantity Selector */}
            <View style={styles.quantitySection}>
                <Text style={styles.sectionTitle}>{isMeter ? 'Custom Length' : 'Quantity'}</Text>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={[styles.quantityButton, quantity <= minQty && styles.disabledButton]}
                        onPress={handleDecrement}
                        disabled={quantity <= minQty}>
                        <Text style={[styles.quantityButtonText, quantity <= minQty && styles.disabledText]}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.quantityDisplay}>
                        <Text style={styles.quantityText}>{formatQuantity(quantity, unit)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={handleIncrement}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                {isMeter && (
                    <Text style={styles.minimumNotice}>Minimum {METER_MIN} meters required.</Text>
                )}
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
        height: 55,
    },
    quantityButton: {
        width: 55,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 20,
        color: theme.colors.neutral[600],
    },
    quantityDisplay: {
        width: 55,
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
    disabledText: {
        color: theme.colors.neutral[400],
    },
    presetsSection: {
        marginBottom: 20,
    },
    presetsList: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
    },
    presetButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        backgroundColor: theme.colors.white,
    },
    presetButtonActive: {
        borderColor: theme.colors.primary[600],
        backgroundColor: theme.colors.primary[50],
    },
    presetText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[700],
    },
    presetTextActive: {
        color: theme.colors.primary[700],
    },
    minimumNotice: {
        fontSize: 12,
        color: theme.colors.neutral[500],
        marginTop: 8,
    },
});

export default ProductActions;
