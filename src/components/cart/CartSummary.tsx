import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import GradientButton from '../GradientButton';

interface CartSummaryProps {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
    subtotal,
    discount,
    shipping,
    tax,
    total,
    onCheckout,
}) => {
    return (
        <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
            </View>

            {discount > 0 && (
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
                    <Text style={[styles.summaryValue, styles.discountValue]}>- ₹{discount.toLocaleString()}</Text>
                </View>
            )}

            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                </Text>
            </View>

            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>₹{tax.toLocaleString()}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
            </View>

            <GradientButton
                title="Proceed to Checkout"
                onPress={onCheckout}
                gradient={theme.colors.gradients.primary}
                style={styles.checkoutButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    summarySection: {
        backgroundColor: theme.colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: theme.colors.neutral[600],
    },
    summaryValue: {
        fontSize: 14,
        color: theme.colors.neutral[900],
        fontWeight: '500',
    },
    discountLabel: {
        color: theme.colors.success[700],
    },
    discountValue: {
        color: theme.colors.success[700],
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[200],
        paddingTop: 12,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.neutral[900],
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary[600],
    },
    checkoutButton: {
        marginTop: 16,
        marginBottom: 4,
    },
});

export default CartSummary;
