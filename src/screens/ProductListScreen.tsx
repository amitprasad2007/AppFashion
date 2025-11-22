import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import { theme } from '../theme';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import GlassInput from '../components/GlassInput';
import {StackNavigationProp} from '@react-navigation/stack';
import {Product, RootStackParamList} from '../types/navigation';
import { apiService, ApiProduct, ApiCategory } from '../services/api';

const ProductListScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // API state management
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get route parameters
  const { categoryId, categoryName, type } = route.params as any || {};
  
  // Dynamic filters based on available categories
  const [filters, setFilters] = useState(['all']);

  // Load products and categories
  const loadData = async () => {
    try {
      setError(null);
      
      // Load categories for filters
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
      
      // Create dynamic filters from categories
      const categoryFilters = ['all', ...categoriesData.map(cat => (cat.slug || cat.name).toLowerCase().replace(/\s+/g, '-'))];
      setFilters(categoryFilters);
      
      // Load products based on route parameters
      let productsData: ApiProduct[] = [];
      
      if (categoryId) {
        // Load products for specific category
        productsData = await apiService.getProducts({ categoryId });
      } else if (type) {
        // Load products by type (featured, bestseller, etc.)
        productsData = await apiService.getProducts({ type: type as any });
      } else {
        // Load all products (featured + bestseller)
        const [featured, bestsellers] = await Promise.all([
          apiService.getFeaturedProducts(),
          apiService.getBestsellerProducts()
        ]);
        productsData = [...featured, ...bestsellers];
      }
      
      setProducts(productsData);
      console.log('Products loaded:', productsData.length);
      
    } catch (err) {
      console.error('Error loading product list data:', err);
      setError('Failed to load products. Using offline content.');
      
      // Fallback to static data on error
      setProducts([
        {
          id: 1,
          name: 'Premium Banarasi Saree',
          slug: 'premium-banarasi-saree',
          images: ['https://via.placeholder.com/300x400/ff6b6b/ffffff?text=Saree+1'],
          price: 2499,
          originalPrice: 3999,
          rating: 4.8,
          reviewCount: 12,
          category: 'Silk Saree\'s',
          isNew: false,
          isBestseller: true,
        }
      ] as any);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, [categoryId, type]);

  // Refresh function
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Handle add to cart from product list
  const handleAddToCartFromList = async (product: ApiProduct) => {
    try {
      await apiService.addToCart(product.id, 1);
      
      Alert.alert(
        'Added to Cart', 
        `${product.name} has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      try {
        const searchResults = await apiService.searchProducts(query, {
          category: selectedFilter !== 'all' ? selectedFilter : undefined
        });
        setProducts(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else if (query.trim().length === 0) {
      // Reload original data when search is cleared
      loadData();
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (categories.find(cat => cat.id === Number(product.category))?.slug === selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const renderProduct = ({item, index}: {item: ApiProduct; index: number}) => {
    const gradients = [
      theme.glassGradients.aurora,
      theme.glassGradients.sunset,
      theme.glassGradients.emerald,
      theme.glassGradients.purple,
      theme.glassGradients.rose,
      theme.glassGradients.ocean,
    ];
    
    const gradient = gradients[index % gradients.length];

    return (
      <AnimatedCard delay={index * 100}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', {productSlug: item.slug || item.id.toString()})}
          activeOpacity={0.9}>
          <GlassCard style={styles.productCard} gradientColors={gradient}>
            <Image source={{uri: item.images[0]}} style={styles.productImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.productOverlay}>
              <TouchableOpacity style={styles.wishlistBtn}>
                <GlassCard style={styles.wishlistIcon} variant="light">
                  <Text style={styles.wishlistIconText}>🤍</Text>
                </GlassCard>
              </TouchableOpacity>
              {item.isBestseller && (
                <GlassCard style={styles.bestsellerBadge} variant="light">
                  <Text style={styles.bestsellerText}>🔥 BESTSELLER</Text>
                </GlassCard>
              )}
              {item.isNew && (
                <GlassCard style={styles.newBadge} variant="light">
                  <Text style={styles.newText}>✨ NEW</Text>
                </GlassCard>
              )}
            </LinearGradient>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productCategory} numberOfLines={1}>
                {typeof item.category === 'string' ? item.category : (item.category as any)?.title || 'Unknown'}
              </Text>
              <View style={styles.priceRatingRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <>
                      <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                      <GlassCard style={styles.discountBadge} variant="light">
                        <Text style={styles.discountText}>
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </Text>
                      </GlassCard>
                    </>
                  )}
                </View>
                <GlassCard style={styles.ratingBadge} variant="light">
                  <Text style={styles.rating}>⭐ {item.rating || 4.5}</Text>
                  <Text style={styles.reviewCount}>({item.reviewCount || 0})</Text>
                </GlassCard>
              </View>
              <GradientButton
                title="Add to Cart"
                onPress={() => handleAddToCartFromList(item)}
                gradient={theme.colors.gradients.primary}
                size="small"
                style={styles.addToCartBtn}
              />
            </View>
          </GlassCard>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  const renderFilter = ({item, index}: {item: string; index: number}) => (
    <AnimatedCard key={index} delay={index * 50}>
      <TouchableOpacity
        style={styles.filterButtonContainer}
        onPress={() => setSelectedFilter(item)}>
        <GlassCard 
          style={[styles.filterButton, selectedFilter === item && styles.activeFilter]} 
          variant={selectedFilter === item ? 'base' : 'light'}>
          <Text
            style={[
              styles.filterText,
              selectedFilter === item && styles.activeFilterText,
            ]}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </Text>
        </GlassCard>
      </TouchableOpacity>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.emerald}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={8} />
      
      <EnhancedHeader 
        title={`🛍️ ${categoryName ? categoryName : type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Products` : 'All Products'}`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}>
            <GlassCard style={styles.cartIcon} variant="light">
              <Text style={styles.cartIconText}>🛒</Text>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>3</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <GlassCard style={styles.searchInputContainer} variant="light">
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search amazing products..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </GlassCard>
        <TouchableOpacity style={styles.filterIconContainer}>
          <GlassCard style={styles.filterIcon} variant="light">
            <Text style={styles.filterIconText}>🎛️</Text>
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter, index) => renderFilter({item: filter, index}))}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <GlassCard style={styles.errorCard} variant="light">
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </GlassCard>
        </View>
      )}

      {/* Products List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>Loading amazing products...</Text>
          </GlassCard>
        </View>
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={() => (
            <View style={styles.resultsHeader}>
              <GlassCard style={styles.resultsCard} variant="light">
                <Text style={styles.resultsText}>
                  {searchQuery ? `🔍 Found ${filteredProducts.length} results for "${searchQuery}"` : 
                   `📦 Showing ${filteredProducts.length} products`}
                </Text>
              </GlassCard>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <GlassCard style={styles.emptyCard} gradientColors={theme.glassGradients.sunset}>
            <Text style={styles.emptyText}>
              {searchQuery ? `🔍 No products found for "${searchQuery}"` : '📦 No products available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search terms' : 'Pull down to refresh'}
            </Text>
          </GlassCard>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
  },
  backIcon: {
    fontSize: 20,
    color: theme.colors.white,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  cartButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
    color: theme.colors.white,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error[500],
    borderRadius: theme.borderRadius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: theme.spacing[5],
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing[4],
    ...theme.shadows.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing[2],
    color: theme.colors.neutral[400],
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[800],
  },
  filterIcon: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    ...theme.shadows.sm,
  },
  filterIconText: {
    fontSize: 18,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  activeFilter: {
    backgroundColor: theme.colors.primary[500],
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[600],
  },
  activeFilterText: {
    color: theme.colors.white,
  },
  productsList: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[10],
  },
  productCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing[2],
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  productOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: theme.spacing[3],
  },
  wishlistBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: theme.borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: {
    fontSize: 16,
  },
  productInfo: {
    padding: theme.spacing[3],
  },
  productName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing[2],
    lineHeight: 18,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  productPrice: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.bold,
  },
  ratingBadge: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
  },
  rating: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  addToCartBtn: {
    alignSelf: 'stretch',
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error?.[50] || '#fef2f2',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.error?.[200] || '#fecaca',
  },
  errorText: {
    color: theme.colors.error?.[700] || '#b91c1c',
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.size.lg,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
  
  // Enhanced product card styles
  productCategory: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.neutral[500],
    marginBottom: theme.spacing.xs,
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.neutral[500],
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  discountBadge: {
    backgroundColor: theme.colors.success?.[500] || '#10b981',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.spacing.xs,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
  },
  reviewCount: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.neutral[500],
    marginLeft: theme.spacing.xs,
  },
  bestsellerBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.error?.[500] || '#ef4444',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.spacing.xs,
  },
  bestsellerText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
  },
  newBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.spacing.xs,
  },
  newText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weight.bold,
  },
  resultsHeader: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral?.[50] || '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  resultsText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
});

export default ProductListScreen;