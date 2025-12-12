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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import FloatingActionButton from '../components/FloatingActionButton'; // If exists, or remove
import { apiService, ApiCategory, ApiProduct, ApiCollection } from '../services/api';
import type { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State management for API data
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<ApiProduct[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading home screen data...');

      const [categoriesData, featuredData, bestsellerData, collectionsData] = await Promise.allSettled([
        apiService.getCategories(),
        apiService.getFeaturedProducts(),
        apiService.getBestsellerProducts(),
        apiService.getFeaturedCollections(),
      ]);

      if (categoriesData.status === 'fulfilled') setCategories(categoriesData.value);
      if (featuredData.status === 'fulfilled') setFeaturedProducts(featuredData.value);
      if (bestsellerData.status === 'fulfilled') setBestsellerProducts(bestsellerData.value);
      if (collectionsData.status === 'fulfilled') setCollections(collectionsData.value);

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

  const handleProductPress = (product: ApiProduct) => {
    navigation.navigate('ProductDetails', { product });
  };

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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <Text
              style={styles.seeAllText}
              onPress={() => navigation.navigate('Categories', {})}
            >
              See All
            </Text>
          </View>

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

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Collections</Text>
          </View>

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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <Text style={styles.seeAllText}>View All</Text>
          </View>

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
      </ScrollView>
    </View>
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
    marginTop: 12,
    color: theme.colors.neutral[600],
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    marginBottom: 24,
  },
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
    color: theme.colors.primary[900], // Dark Maroon title
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 8, // For shadow visibility
  },
});

export default HomeScreen;
