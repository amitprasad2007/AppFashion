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
  ScrollView,
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
        //console.log(categoryId);
        const searchType = 'category';
        // Load products for specific category
        productsData = await apiService.getProducts({ categoryId, type: searchType });
        
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
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Just update the search query - filtering happens in filteredProducts
  };

  const filteredProducts = products.filter(product => {
    // Search filtering - check if search query matches product name, category, or description
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof product.category === 'string' && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filtering
    const matchesFilter = selectedFilter === 'all' || 
      (typeof product.category === 'string' && product.category.toLowerCase().includes(selectedFilter.toLowerCase())) ||
      (categories.find(cat => cat.id === Number(product.category))?.slug === selectedFilter) ||
      (categories.find(cat => cat.name.toLowerCase().replace(/\s+/g, '-') === selectedFilter)?.id === Number(product.category));
    
    return matchesSearch && matchesFilter;
  });

  const renderProduct = ({item, index}: {item: ApiProduct; index: number}) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', {productSlug: item.slug || item.id.toString()})}
        style={styles.productCard}
        activeOpacity={0.8}>
        
        <View style={styles.imageContainer}>
          <Image source={{uri: item.images[0]}} style={styles.productImage} />
          {item.isBestseller && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Bestseller</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productCategory}>
            {typeof item.category === 'string' ? item.category : (item.category as any)?.title || 'Category'}
          </Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {item.rating || 4.5}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount || 0} reviews)</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilter = ({item, index}: {item: string; index: number}) => (
    <TouchableOpacity
      key={index}
      style={[styles.filterButton, selectedFilter === item && styles.activeFilter]}
      onPress={() => setSelectedFilter(item)}>
      <Text
        style={[
          styles.filterText,
          selectedFilter === item && styles.activeFilterText,
        ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
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
            <View style={styles.cartIcon}>
              <Text style={styles.cartIconText}>🛒</Text>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search amazing products..."
            placeholderTextColor="rgba(0,0,0,0.5)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterIconContainer}
          onPress={() => {
            // Toggle between 'all' and first category filter
            const nextFilter = selectedFilter === 'all' ? filters[1] || 'all' : 'all';
            setSelectedFilter(nextFilter);
          }}>
          <View style={styles.filterIcon}>
            <Text style={styles.filterIconText}>🎛️</Text>
          </View>
        </TouchableOpacity> 
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScrollView}>
        {filters.map((filter, index) => renderFilter({item: filter, index}))}
      </ScrollView>
   

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
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    position: 'relative',
  },
  cartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartIconText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    ...theme.shadows.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing[2],
    color: theme.colors.neutral[600],
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[800],
  },
  filterIconContainer: {
    marginLeft: theme.spacing[2],
  },
  filterIcon: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    ...theme.shadows.sm,
  
  },
  filterIconText: {
    fontSize: 18,
    color: '#333333',
  },
  filtersScrollView: {
    paddingBottom: theme.spacing[6],
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[2],
  },
  filterButton: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[2],
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    minHeight: 44,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 4,
  },
  activeFilter: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
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
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
  },
  bestsellerText: {
    fontSize: 14,
  },
  newBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
  },
  newText: {
    fontSize: 14,
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