import React, { useState, useEffect } from 'react';
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
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import SafeAlert from '../utils/safeAlert';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import apiService, { ApiProduct, ApiCategory } from '../services/api_service';

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

  // Set correct filter when categoryId is provided
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      // Find the category slug or name from the categoryId
      const category = categories.find(cat => cat.id === Number(categoryId));
      if (category) {
        const categorySlug = (category.slug || category.name).toLowerCase().replace(/\s+/g, '-');
        setSelectedFilter(categorySlug);
      }
    } else if (!categoryId) {
      setSelectedFilter('all');
    }
  }, [categoryId, categories]);

  // Refresh function
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Simple search filtering only
  const filteredProducts = products.filter(product => {
    return searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderProduct = ({ item, index }: { item: ApiProduct; index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { productSlug: item.slug || item.id.toString() })}
        style={styles.productCard}
        activeOpacity={0.8}>

        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
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

  // Function to load products by category
  const loadProductsByCategory = async (filterKey: string) => {
    try {
      setLoading(true);

      let productsData: ApiProduct[] = [];

      if (filterKey === 'all') {
        // Load all products (featured + bestsellers like initial load)
        const [featured, bestsellers] = await Promise.all([
          apiService.getFeaturedProducts(),
          apiService.getBestsellerProducts()
        ]);
        productsData = [...featured, ...bestsellers];
      } else {
        // Find the category by filter key
        const selectedCategory = categories.find(cat => {
          const catSlug = (cat.slug || cat.name).toLowerCase().replace(/\s+/g, '-');
          return catSlug === filterKey;
        });

        if (selectedCategory) {
          // Load products for specific category
          productsData = await apiService.getProducts({
            categoryId: selectedCategory.id,
            type: 'category'
          });

        } else {
          // If category not found, load all products
          const [featured, bestsellers] = await Promise.all([
            apiService.getFeaturedProducts(),
            apiService.getBestsellerProducts()
          ]);
          productsData = [...featured, ...bestsellers];
        }
      }

      setProducts(productsData);

    } catch (error) {
      console.error('❌ Error loading products by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFilter = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      key={index}
      style={[styles.filterButton, selectedFilter === item && styles.activeFilter]}
      onPress={() => {
        setSelectedFilter(item);
        loadProductsByCategory(item);
      }}>
      <Text
        style={[
          styles.filterText,
          selectedFilter === item && styles.activeFilterText,
        ]}>
        {item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' ')}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing && products.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
        <EnhancedHeader
          title={`🛍️ Products`}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title={`🛍️ ${categoryName ? categoryName : type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Products` : 'Collection'}`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search our collection..."
            placeholderTextColor={theme.colors.neutral[400]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Filters */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          style={styles.filtersScrollView}>
          {filters.map((filter, index) => renderFilter({ item: filter, index }))}
        </ScrollView>
      </View>


      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Products List */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />
          }
          ListHeaderComponent={() => (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {searchQuery ? `Found ${filteredProducts.length} results for "${searchQuery}"` :
                  `Showing ${filteredProducts.length} products`}
              </Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? `No products found for "${searchQuery}"` : 'No products available'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try adjusting your search terms' : 'Pull down to refresh'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50], // Cream background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    marginTop: 12,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: theme.colors.error[50],
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  errorText: {
    color: theme.colors.error[700],
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: theme.colors.neutral[500],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.neutral[900],
    height: '100%',
  },
  filtersScrollView: {
    maxHeight: 60,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.neutral[700],
  },
  activeFilterText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  productsList: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: theme.colors.neutral[100],
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.accent[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
    lineHeight: 20,
    height: 40,
  },
  productCategory: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  originalPrice: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '700',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: theme.colors.neutral[500],
  },
  resultsHeader: {
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.neutral[600],
  },
});

export default ProductListScreen;