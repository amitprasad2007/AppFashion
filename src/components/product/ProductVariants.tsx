import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme';
import Feather from 'react-native-vector-icons/Feather';

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
                                    { backgroundColor: variant.color?.value || '#eee' },
                                    isSelected && styles.selectedColorOption
                                ]}
                                onPress={() => onSelectVariant(variant)}
                                activeOpacity={0.8}
                            >
                                {isSelected && (
                                    <View style={styles.checkIcon}>
                                        <Feather name="check" size={14} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                {selectedVariant && (
                    <Text style={styles.selectedColorText}>
                        Selected: <Text style={styles.selectedColorValue}>{selectedVariant.color?.name || 'Standard'}</Text>
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
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: theme.typography.size.lg,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.neutral[900],
        marginBottom: theme.spacing.md,
    },
    colorSection: {
        marginBottom: 0,
    },
    colorContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: theme.colors.neutral[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    selectedColorOption: {
        borderColor: theme.colors.primary[500],
        borderWidth: 2,
        transform: [{ scale: 1.1 }],
        ...theme.shadows.sm,
    },
    checkIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    selectedColorText: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.size.sm,
        color: theme.colors.neutral[500],
        fontWeight: theme.typography.weight.medium,
    },
    selectedColorValue: {
        color: theme.colors.neutral[900],
        fontWeight: theme.typography.weight.bold,
    },
});

export default ProductVariants;
