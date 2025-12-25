import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ApiProduct, apiService, ApiWishlistItem } from '../services/api';
import { useUserProfile } from '../contexts/UserProfileContext';
import ProductCard from './ProductCard';
import { theme } from '../theme';

interface UserActivityProps {
    recentlyViewed: ApiProduct[];
    wishlistItems: ApiProduct[];
}

const UserActivitySection = ({ recentlyViewed, wishlistItems }: UserActivityProps) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    // Deduplicate items to prevent "duplicate key" errors
    const uniqueRecentlyViewed = React.useMemo(() => {
        const seen = new Set();
        return recentlyViewed.filter(item => {
            const duplicate = seen.has(item.id);
            seen.add(item.id);
            return !duplicate;
        });
    }, [recentlyViewed]);

    const uniqueWishlistItems = React.useMemo(() => {
        const seen = new Set();
        return wishlistItems.filter(item => {
            const duplicate = seen.has(item.id);
            seen.add(item.id);
            return !duplicate;
        });
    }, [wishlistItems]);

    // Internal loading state is no longer needed as parent handles fetching
    const isEmpty = !uniqueRecentlyViewed.length && !uniqueWishlistItems.length;

    const handleProductPress = (product: ApiProduct) => {
        navigation.navigate('ProductDetails', { product });
    };

    const renderSection = (title: string, data: ApiProduct[], onViewAll?: () => void) => {
        if (!data || data.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {onViewAll && (
                        <TouchableOpacity onPress={onViewAll}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={handleProductPress}
                        />
                    )}
                    keyExtractor={(item) => `activity_${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                />
            </View>
        );
    };

    if (isEmpty) return null;

    return (
        <View>
            {renderSection(
                'Recently Viewed',
                uniqueRecentlyViewed,
                () => navigation.navigate('RecentlyViewed')
            )}

            {renderSection(
                'Your Wishlist',
                uniqueWishlistItems,
                () => navigation.navigate('Wishlist')
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary[900],
        letterSpacing: 0.5,
    },
    seeAllText: {
        fontSize: 14,
        color: theme.colors.primary[600],
        fontWeight: '600',
    },
    horizontalList: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
});

export default UserActivitySection;
