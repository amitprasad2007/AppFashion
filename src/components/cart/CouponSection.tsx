import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface CouponSectionProps {
    couponCode: string;
    onCouponCodeChange: (code: string) => void;
    onApply: () => void;
    isApplying: boolean;
}

const CouponSection: React.FC<CouponSectionProps> = ({
    couponCode,
    onCouponCodeChange,
    onApply,
    isApplying,
}) => {
    return (
        <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>Have a Coupon?</Text>
            <View style={styles.couponContainer}>
                <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor={theme.colors.neutral[400]}
                    value={couponCode}
                    onChangeText={onCouponCodeChange}
                    autoCapitalize="characters"
                />
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={onApply}
                    disabled={isApplying || !couponCode.trim()}>
                    {isApplying ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                        <Text style={styles.applyButtonText}>Apply</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    couponSection: {
        backgroundColor: theme.colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 12,
    },
    couponContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    couponInput: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderRadius: 8,
        paddingHorizontal: 12,
        color: theme.colors.neutral[900],
    },
    applyButton: {
        backgroundColor: theme.colors.neutral[900],
        paddingHorizontal: 16,
        height: 44,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        color: theme.colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
});

export default CouponSection;
