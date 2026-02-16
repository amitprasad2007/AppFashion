import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme';

interface ProductVariantsProps {
    variants: any[];
    selectedVariant: any;
    onSelectVariant: (variant: any) => void;
    selectedSize?: string;
    onSelectSize?: (size: string) => void;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
    variants,
    selectedVariant,
    onSelectVariant,
    selectedSize,
    onSelectSize,
}) => {
    if (!variants || variants.length === 0) return null;

    return (
        <View style={styles.variantsSection}>
            {/* Colors Section */}
            <View style={styles.colorSection}>
                <Text style={styles.sectionTitle}>Available Colors</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorContainer}>
                    {variants.map((variant) => {
                        const isSelected = selectedVariant && selectedVariant.id === variant.id;
                        return (
                            <TouchableOpacity
                                key={variant.id}
                                style={[
                                    styles.colorOption,
                                    isSelected && styles.selectedColorOption,
                                    { backgroundColor: variant.color?.value || '#eee' }
                                ]}
                                onPress={() => onSelectVariant(variant)}
                            >
                                {isSelected && (
                                    <View style={styles.checkIcon}>
                                        <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                {selectedVariant && (
                    <Text style={styles.selectedColorText}>
                        Selected: {selectedVariant.color?.name || 'Standard'}
                    </Text>
                )}
            </View>

            {/* Sizes Section - If available in data */}
            {/* {sizes && sizes.length > 0 && (...)} */}
        </View>
    );
};

const styles = StyleSheet.create({
    variantsSection: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 12,
    },
    colorSection: {
        marginBottom: 0,
    },
    colorContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 8,
    },
    colorOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: theme.colors.neutral[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    selectedColorOption: {
        borderColor: theme.colors.primary[600],
        borderWidth: 2,
        transform: [{ scale: 1.1 }],
    },
    checkIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColorText: {
        marginTop: 8,
        fontSize: 14,
        color: theme.colors.neutral[600],
        fontWeight: '500',
    },
});

export default ProductVariants;
