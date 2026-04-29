import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import CollectionCard from '../components/CollectionCard';
import UserActivitySection from '../components/UserActivitySection';
import apiService, { ApiCategory, ApiProduct, ApiCollection } from '../services/api_service';
import type { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State management for API data
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<ApiProduct[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ApiProduct[]>([]);
  const [wishlistItems, setWishlistItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading home screen data...');

      const results = await Promise.allSettled([
        apiService.getCategories(),
        apiService.getFeaturedProducts(),
        apiService.getBestsellerProducts(),
        apiService.getFeaturedCollections(),
        apiService.getRecentlyViewedItems(),
        apiService.getWishlistItems(),
      ]);

      if (results[0].status === 'fulfilled') setCategories(results[0].value);
      if (results[1].status === 'fulfilled') setFeaturedProducts(results[1].value);
      if (results[2].status === 'fulfilled') setBestsellerProducts(results[2].value);
      if (results[3].status === 'fulfilled') setCollections(results[3].value);
      if (results[4].status === 'fulfilled') setRecentlyViewed(results[4].value);
      if (results[5].status === 'fulfilled') setWishlistItems(results[5].value);

    } catch (error) {
      console.error('❌ Error loading home data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCollectionPress = (collection: ApiCollection) => {
    // For now navigate to ProductList, can be enhanced to support collection filtering
    navigation.navigate('ProductList', { categoryName: collection.name });
  };

  const handleProductPress = (product: ApiProduct) => {
    navigation.navigate('ProductDetails', { 
      productSlug: product.slug,
      product 
    });
  };

  const SectionHeader = ({ title, onSeeAll }: { title: string, onSeeAll?: () => void }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
          <Feather name="chevron-right" size={16} color={theme.colors.primary[600]} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />

      {/* Header */}
      <EnhancedHeader
        title="Samar Silk Palace"
        rightComponent={<CartIcon size="medium" color={theme.colors.primary[800]} />}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[600]]}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <BannerSlider />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <SectionHeader 
            title="Shop by Category" 
            onSeeAll={() => navigation.navigate('Categories', {})} 
          />

          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => navigation.navigate('Categories', {})}
              />
            )}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* User Activity Section (Recently Viewed / Wishlist) */}
        <UserActivitySection
          recentlyViewed={recentlyViewed}
          wishlistItems={wishlistItems}
        />

        {/* Collections Section */}
        {
          collections.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Our Collections" />

              <FlatList
                data={collections}
                renderItem={({ item }) => (
                  <CollectionCard
                    collection={item}
                    onPress={handleCollectionPress}
                  />
                )}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                snapToInterval={width * 0.8 + 16} // Card width + margin
                decelerationRate="fast"
              />
            </View>
          )
        }

        {/* Featured Products */}
        <View style={styles.section}>
          <SectionHeader title="Featured Products" />

          <FlatList
            data={featuredProducts}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={handleProductPress}
              />
            )}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Bestsellers */}
        <View style={styles.section}>
          <SectionHeader title="Best Sellers" onSeeAll={() => {}} />

          <FlatList
            data={bestsellerProducts}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={handleProductPress}
              />
            )}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView >
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50], // Creamy white background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.neutral[600],
    fontSize: theme.typography.size.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  heroSection: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.neutral[900], 
    letterSpacing: 0.25,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.semibold,
    marginRight: 2,
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md, // For shadow visibility
  },
});

export default HomeScreen;
