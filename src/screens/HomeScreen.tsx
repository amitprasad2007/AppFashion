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
import FloatingElements from '../components/FloatingElements';
import CartIcon from '../components/CartIcon';
import { apiService, ApiCategory, ApiProduct, ApiCollection } from '../services/api';
import type { Product, Category, RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

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

      // Load data concurrently for better performance
      const [categoriesData, featuredData, bestsellerData, collectionsData] = await Promise.allSettled([
        apiService.getCategories(),
        apiService.getFeaturedProducts(),
        apiService.getBestsellerProducts(),
        apiService.getFeaturedCollections(),
      ]);

      // Handle categories
      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
        console.log('✅ Categories loaded:', categoriesData.value.length);
      } else {
        console.error('❌ Failed to load categories:', categoriesData.reason);
      }

      // Handle featured products
      if (featuredData.status === 'fulfilled') {
        setFeaturedProducts(featuredData.value);
        console.log('✅ Featured products loaded:', featuredData.value.length);
      } else {
        console.error('❌ Failed to load featured products:', featuredData.reason);
      }

      // Handle bestseller products
      if (bestsellerData.status === 'fulfilled') {
        setBestsellerProducts(bestsellerData.value);
        console.log('✅ Bestseller products loaded:', bestsellerData.value.length);
      } else {
        console.error('❌ Failed to load bestseller products:', bestsellerData.reason);
      }

      // Handle collections
      if (collectionsData.status === 'fulfilled') {
        setCollections(collectionsData.value);
        console.log('✅ Collections loaded:', collectionsData.value.length);
      } else {
        console.error('❌ Failed to load collections:', collectionsData.reason);
      }

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
    console.log('Collection pressed:', collection.name);
    // navigation.navigate('ProductList', { collectionSlug: collection.slug });
  };

  const renderCategoryCard = ({ item, index }: { item: ApiCategory; index: number }) => {
    const gradients = [
      theme.glassGradients.aurora,
      theme.glassGradients.sunset,
      theme.glassGradients.ocean,
      theme.glassGradients.emerald,
      theme.glassGradients.purple,
      theme.glassGradients.rose,
    ];

    const gradient = gradients[index % gradients.length];

    return (
      <AnimatedCard delay={index * 100}>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Categories', {})}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.categoryBackground}
            imageStyle={styles.categoryBackgroundImage}
          >
            <LinearGradient
              colors={gradient}
              style={styles.categoryOverlay}
            />
            <GlassCard style={styles.categoryContent} variant="light">
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryCount}>{item.count ? `${item.count} Items` : '0 Items'}</Text>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryIconText}>→</Text>
              </View>
            </GlassCard>
          </ImageBackground>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  const renderProductCard = ({ item, index }: { item: ApiProduct; index: number }) => {
    const imageUrl = item.images && item.images.length > 0
      ? item.images[0]
      : `https://picsum.photos/300/300?random=${item.id}`;

    return (
      <AnimatedCard delay={index * 150}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
          activeOpacity={0.9}
        >
          <GlassCard style={styles.productGlassCard} variant="base">
            <ImageBackground
              source={{ uri: imageUrl }}
              style={styles.productImage}
              imageStyle={styles.productImageStyle}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.productImageOverlay}
              />

              {item.discountPercentage > 0 && (
                <View style={styles.discountBadge}>
                  <LinearGradient
                    colors={['#ff6b6b', '#ff5252']}
                    style={styles.discountBadgeGradient}
                  >
                    <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                  </LinearGradient>
                </View>
              )}
            </ImageBackground>

            <View style={styles.productContent}>
              <Text style={styles.productName} numberOfLines={2}>{item.name || 'Product Name'}</Text>
              <Text style={styles.productCategory}>{item.category?.title || 'Category'}</Text>

              <View style={styles.productPricing}>
                <Text style={styles.productPrice}>₹{item.price || 0}</Text>
                {(item.originalPrice || 0) > (item.price || 0) && (
                  <Text style={styles.productOriginalPrice}>₹{item.originalPrice}</Text>
                )}
              </View>

              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {item.rating || 4.5}</Text>
                </View>
              )}
            </View>
          </GlassCard>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={theme.glassGradients.aurora}
        style={styles.loadingContainer}
      >
        <GlassCard style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colors.white} />
          <Text style={styles.loadingText}>Loading magical experience...</Text>
        </GlassCard>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.aurora}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={8} />

      <EnhancedHeader
        title="✨ Samar Silk Palace"
        rightComponent={<CartIcon size="medium" color={theme.colors.white} />}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.white}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {/* Hero Banner Section */}
        <View style={styles.heroSection}>
          <BannerSlider />
        </View>

        {/* Collections Section */}
        <CollectionsSection onCollectionPress={handleCollectionPress} />

        {/* Categories Section */}
        <View style={styles.section}>
          <GlassCard style={styles.sectionHeader} variant="light">
            <Text style={styles.sectionTitle}>🛍️ Shop by Category</Text>
            <Text style={styles.sectionSubtitle}>Explore our curated categories</Text>
          </GlassCard>

          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <GlassCard style={styles.sectionHeader} variant="light">
            <Text style={styles.sectionTitle}>⭐ Featured Products</Text>
            <Text style={styles.sectionSubtitle}>Handpicked just for you</Text>
          </GlassCard>

          <FlatList
            data={featuredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Bestseller Products Section */}
        <View style={styles.section}>
          <GlassCard style={styles.sectionHeader} variant="light">
            <Text style={styles.sectionTitle}>🔥 Bestsellers</Text>
            <Text style={styles.sectionSubtitle}>What everyone's buying</Text>
          </GlassCard>

          <FlatList
            data={bestsellerProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <GlassCard style={styles.ctaCard} gradientColors={theme.glassGradients.sunset}>
            <Text style={styles.ctaTitle}>Ready to Shop?</Text>
            <Text style={styles.ctaSubtitle}>Explore our complete collection</Text>
            <GradientButton
              title="Browse All Products"
              onPress={() => navigation.navigate('ProductList', {})}
              style={styles.ctaButton}
            />
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.background,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
    paddingHorizontal: theme.spacing[6],
  },
  loadingText: {
    fontSize: theme.typography.body.large.fontSize,
    color: theme.colors.white,
    marginTop: theme.spacing[4],
    fontWeight: '600',
  },
  searchButton: {
    marginRight: theme.spacing[2],
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing[10],
  },
  heroSection: {
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[2],
  },
  section: {
    marginBottom: theme.spacing[8],
    paddingHorizontal: theme.spacing[2],
  },
  sectionHeader: {
    marginHorizontal: theme.spacing[2],
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.heading.h2.fontSize,
    fontWeight: theme.typography.heading.h2.fontWeight as any,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing[1],
  },
  sectionSubtitle: {
    fontSize: theme.typography.body.medium.fontSize,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
  categoryCard: {
    width: 140,
    height: 130,
    marginRight: theme.spacing[4],
    marginVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryBackground: {
    flex: 1,
  },
  categoryBackgroundImage: {
    borderRadius: theme.borderRadius.xl,
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[3],
  },
  categoryName: {
    fontSize: theme.typography.body.medium.fontSize,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing[1],
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing[2],
    fontWeight: '500',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  categoryIconText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  productsList: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
  productCard: {
    width: 180,
    marginRight: theme.spacing[4],
    marginVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  productGlassCard: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xl,
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  productImageStyle: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  productImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    right: theme.spacing[3],
  },
  discountBadgeGradient: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    color: theme.colors.white,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
  productContent: {
    padding: theme.spacing[4],
    backgroundColor: theme.light.background,
  },
  productName: {
    fontSize: theme.typography.body.medium.fontSize,
    fontWeight: '600',
    color: theme.light.onSurface,
    marginBottom: theme.spacing[1],
    lineHeight: 20,
  },
  productCategory: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.light.tertiary,
    marginBottom: theme.spacing[2],
    fontWeight: '500',
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  productPrice: {
    fontSize: theme.typography.body.large.fontSize,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
    marginRight: theme.spacing[2],
  },
  productOriginalPrice: {
    fontSize: theme.typography.body.small.fontSize,
    color: theme.light.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.light.onSurface,
    fontWeight: '500',
  },
  ctaSection: {
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
  },
  ctaCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
  },
  ctaTitle: {
    fontSize: theme.typography.heading.h2.fontSize,
    fontWeight: theme.typography.heading.h2.fontWeight as any,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  ctaSubtitle: {
    fontSize: theme.typography.body.large.fontSize,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: theme.spacing[6],
  },
  ctaButton: {
    paddingHorizontal: theme.spacing[8],
  },
});

export default HomeScreen;
