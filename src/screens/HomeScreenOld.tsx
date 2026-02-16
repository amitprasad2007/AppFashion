import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import BannerSlider from '../components/BannerSlider';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import CollectionsSection from '../components/CollectionsSection';
import { apiService, ApiCategory, ApiProduct, ApiCollection } from '../services/api_service';
import type { Product, Category, RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State management for API data
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<ApiCollection[]>([]);

  // Fallback data in case API fails
  const fallbackCategories: Category[] = [
    { id: '1', name: 'Fashion', image: 'https://via.placeholder.com/100' },
    { id: '2', name: 'Electronics', image: 'https://via.placeholder.com/100' },
    { id: '3', name: 'Home & Garden', image: 'https://via.placeholder.com/100' },
    { id: '4', name: 'Sports', image: 'https://via.placeholder.com/100' },
  ];

  const fallbackFeaturedProducts: Product[] = [
    { id: '1', name: 'Summer Dress', price: '₹49.99', image: 'https://via.placeholder.com/150', rating: 4.8 },
    { id: '2', name: 'Wireless Headphones', price: '₹89.99', image: 'https://via.placeholder.com/150', rating: 4.7 },
    { id: '3', name: 'Running Shoes', price: '₹129.99', image: 'https://via.placeholder.com/150', rating: 4.9 },
  ];

  // Load data from API
  const loadData = async () => {
    try {
      setError(null);

      // Fetch data from all endpoints simultaneously
      const [categoriesData, featuredData, bestsellerData] = await Promise.all([
        apiService.getCategories(),
        apiService.getFeaturedProducts(),
        apiService.getBestsellerProducts()
      ]);

      // Update state with API data or fallback to static data
      setCategories(categoriesData.length > 0 ? categoriesData : fallbackCategories as any);
      setFeaturedProducts(featuredData.length > 0 ? featuredData : fallbackFeaturedProducts as any);
      setBestsellerProducts(bestsellerData);

      console.log('Data loaded successfully:', {
        categories: categoriesData.length,
        featured: featuredData.length,
        bestsellers: bestsellerData.length
      });

    } catch (err) {
      console.error('Error loading home screen data:', err);
      setError('Failed to load data. Using offline content.');

      // Use fallback data on error
      setCategories(fallbackCategories as any);
      setFeaturedProducts(fallbackFeaturedProducts as any);
      setBestsellerProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Refresh function
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBannerPress = (banner: any) => {
    console.log('Banner pressed:', banner.title);

    // Handle different banner types based on your API data
    if (banner.path) {
      // If banner has specific path, navigate there
      console.log('Navigate to path:', banner.path);
      // You can add custom navigation logic here based on the path
      // Example: if (banner.path.includes('bridal')) navigation.navigate('BridalCollection')
    }

    // For now, navigate to product list for all banners
    (navigation as any).navigate('ProductList');
  };

  const renderCategory = ({ item, index }: { item: ApiCategory; index: number }) => (
    <AnimatedCard
      style={styles.categoryItem}
      onPress={() => (navigation as any).navigate('Categories', { categoryId: item.id })}
      elevation="md"
      animationType="scale"
      delay={index * 100}>
      <LinearGradient
        colors={theme.colors.gradients.ocean}
        style={styles.categoryGradient}>
        <Image source={{ uri: item.image }} style={styles.categoryImage as any} />
      </LinearGradient>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count} items</Text>
    </AnimatedCard>
  );

  const renderProduct = ({ item, index }: { item: ApiProduct; index: number }) => (
    <AnimatedCard
      style={styles.productItem}
      onPress={() => (navigation as any).navigate('ProductDetails', { productSlug: item.slug })}
      elevation="lg"
      animationType="slide"
      delay={index * 150}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage as any} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.productOverlay}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating || 4.8}</Text>
            <Text style={styles.wishlistIcon}>🤍</Text>
          </View>
          {item.originalPrice && item.originalPrice > item.price && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </AnimatedCard>
  );

  const renderBestsellerProduct = ({ item, index }: { item: ApiProduct; index: number }) => (
    <AnimatedCard
      style={styles.bestsellerItem}
      onPress={() => (navigation as any).navigate('ProductDetails', { productSlug: item.slug })}
      elevation="lg"
      animationType="fade"
      delay={index * 100}>
      <View style={styles.bestsellerBadge}>
        <Text style={styles.bestsellerBadgeText}>🔥 BESTSELLER</Text>
      </View>
      <Image source={{ uri: item.images[0] }} style={styles.bestsellerImage as any} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.bestsellerOverlay}>
        <View style={styles.bestsellerInfo}>
          <Text style={styles.bestsellerName}>{item.name}</Text>
          <Text style={styles.bestsellerPrice}>₹{item.price}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating || 4.9}</Text>
            <Text style={styles.wishlistIcon}>❤️</Text>
          </View>
        </View>
      </LinearGradient>
    </AnimatedCard>
  );

  // Show loading spinner on initial load
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading amazing deals...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerGreeting}>Hello, Fashionista! 👋</Text>
            <Text style={styles.headerTitle}>Discover Amazing Deals</Text>
            {error && (
              <Text style={styles.errorText}>⚠️ {error}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => (navigation as any).navigate('Login')}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => (navigation as any).navigate('Search')}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Dynamic Banner Slider */}
      <BannerSlider
        autoSlide={true}
        slideInterval={4000}
        onBannerPress={handleBannerPress}
      />

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Categories')}>
            <Text style={styles.viewAllText}>View All ({categories.length})</Text>
          </TouchableOpacity>
        </View>
        {categories.length > 0 ? (
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📦 No categories available</Text>
          </View>
        )}
      </View>

      {/* Bestseller Products */}
      {bestsellerProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Bestsellers</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('ProductList', { type: 'bestseller' })}>
              <Text style={styles.viewAllText}>View All ({bestsellerProducts.length})</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={bestsellerProducts}
            renderItem={renderBestsellerProduct}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✨ Featured Products</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('ProductList', { type: 'featured' })}>
            <Text style={styles.viewAllText}>View All ({featuredProducts.length})</Text>
          </TouchableOpacity>
        </View>
        {featuredProducts.length > 0 ? (
          <FlatList
            data={featuredProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>✨ No featured products available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing[3],
    fontWeight: theme.typography.fontWeight.medium,
  },
  header: {
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  headerGreeting: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing[1],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#ffcccb',
    marginTop: theme.spacing[1],
    fontWeight: theme.typography.fontWeight.medium,
  },
  searchButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
  },
  searchIcon: {
    fontSize: 20,
  },
  section: {
    marginVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[800],
  },
  viewAllText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  horizontalList: {
    paddingLeft: theme.spacing[1],
    paddingRight: theme.spacing[1],
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.neutral[200],
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: theme.spacing[4],
    width: 100,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[3],
  },
  categoryGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  categoryName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
    color: theme.colors.neutral[700],
  },
  categoryCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    marginTop: theme.spacing[1],
  },
  productItem: {
    marginRight: theme.spacing[4],
    width: 180,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing[4],
  },
  productInfo: {
    alignItems: 'flex-start',
    position: 'relative',
  },
  productName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
    marginBottom: theme.spacing[1],
  },
  productPrice: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing[2],
  },
  rating: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  wishlistIcon: {
    fontSize: 18,
  },
  discountBadge: {
    position: 'absolute',
    top: -35,
    right: 0,
    backgroundColor: '#ff4757',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.md,
  },
  discountText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  // Bestseller Product Styles
  bestsellerItem: {
    marginRight: theme.spacing[4],
    width: 200,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    left: theme.spacing[3],
    backgroundColor: '#ff4757',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.lg,
    zIndex: 2,
  },
  bestsellerBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  bestsellerImage: {
    width: '100%',
    height: 220,
  },
  bestsellerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing[4],
  },
  bestsellerInfo: {
    alignItems: 'flex-start',
  },
  bestsellerName: {
    fontSize: theme.typography.fontSize.base + 1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing[2],
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bestsellerPrice: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#ffd700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default HomeScreen;