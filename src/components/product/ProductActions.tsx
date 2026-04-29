import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
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
                    activeOpacity={0.7}
                    disabled={addingToCart}>
                    {addingToCart ? (
                        <ActivityIndicator size="small" color={theme.colors.primary[600]} />
                    ) : (
                        <>
                            <Feather name="shopping-cart" size={18} color={theme.colors.primary[600]} style={{ marginRight: 8 }} />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buyNowContainer]}
                    onPress={onBuyNow}
                    activeOpacity={0.8}>
                    <LinearGradient
                        colors={theme.colors.gradients.primary || [theme.colors.primary[600], theme.colors.primary[800]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buyNowGradient}
                    >
                        <Feather name="zap" size={18} color={theme.colors.white} style={{ marginRight: 8 }} />
                        <Text style={styles.buyNowText}>Buy Now</Text>
                    </LinearGradient>
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
        borderWidth: 1.5,
        borderColor: theme.colors.primary[600],
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary[600],
    },
    buyNowContainer: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme.colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buyNowGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyNowText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.white,
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
