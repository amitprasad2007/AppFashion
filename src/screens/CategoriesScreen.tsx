import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedHeader from '../components/EnhancedHeader';
import CartIcon from '../components/CartIcon';
import apiService, { ApiCategory } from '../services/api_service';
import { theme } from '../theme';

type Category = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  itemCount: number;
  subcategories: string[];
};

const CategoriesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State management for API data
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback categories in case API fails
  const fallbackCategories = [
    {
      id: '1',
      name: 'Fashion',
      description: 'Clothing & Accessories',
      image: 'https://via.placeholder.com/150',
      itemCount: 124,
      subcategories: ['Men\'s Fashion', 'Women\'s Fashion', 'Kids Fashion', 'Accessories'],
    },
    {
      id: '2',
      name: 'Electronics',
      description: 'Gadgets & Technology',
      image: 'https://via.placeholder.com/150',
      itemCount: 89,
      subcategories: ['Smartphones', 'Laptops', 'Audio', 'Gaming'],
    },
    {
      id: '3',
      name: 'Home & Garden',
      description: 'Home Improvement',
      image: 'https://via.placeholder.com/150',
      itemCount: 156,
      subcategories: ['Furniture', 'Decor', 'Kitchen', 'Garden'],
    },
    {
      id: '4',
      name: 'Sports & Fitness',
      description: 'Athletic Gear',
      image: 'https://via.placeholder.com/150',
      itemCount: 78,
      subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports'],
    },
    {
      id: '5',
      name: 'Health & Beauty',
      description: 'Personal Care',
      image: 'https://via.placeholder.com/150',
      itemCount: 203,
      subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Wellness'],
    },
    {
      id: '6',
      name: 'Books & Media',
      description: 'Entertainment',
      image: 'https://via.placeholder.com/150',
      itemCount: 91,
      subcategories: ['Books', 'Movies', 'Music', 'Games'],
    },
  ];

  // Load categories from API
  const loadCategories = async () => {
    try {
      setError(null);
      const categoriesData = await apiService.getCategories();

      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        console.log('No categories from API, using fallback data');
        setCategories(fallbackCategories as any);
      }

    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Using offline content.');
      setCategories(fallbackCategories as any);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadCategories();
  }, []);

  // Refresh function
  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderCategory = ({ item, index }: { item: ApiCategory; index: number }) => {
    const isExpanded = expandedItems.has(String(item.id));
    const description = item.description || 'Explore this amazing category with a wide variety of products.';
    const shouldShowReadMore = description.length > 80;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductList', { categoryId: String(item.id), categoryName: item.name })}
        activeOpacity={0.9}
        style={styles.categoryCardWrapper}
      >
        <View style={styles.categoryCard}>
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          <View style={styles.categoryInfo}>
            <View style={styles.headerRow}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.itemCount}>
                {(item as any).itemCount ? `${(item as any).itemCount}` : '0'} items
              </Text>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.categorySubtitle} numberOfLines={isExpanded ? undefined : 2}>
                {description}
              </Text>
              {shouldShowReadMore && (
                <TouchableOpacity
                  onPress={() => toggleExpanded(String(item.id))}
                  style={styles.readMoreButton}
                >
                  <Text style={styles.readMoreText}>
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {(item as any).subcategories && (item as any).subcategories.length > 0 && (
              <View style={styles.subcategoriesContainer}>
                {(item as any).subcategories.slice(0, 3).map((sub: string, index: number) => (
                  <View key={index} style={styles.subcategoryBadge}>
                    <Text style={styles.subcategoryText}>{sub}</Text>
                  </View>
                ))}
                {(item as any).subcategories.length > 3 && (
                  <View style={styles.subcategoryBadge}>
                    <Text style={styles.subcategoryText}>+{(item as any).subcategories.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading spinner on initial load
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
        <EnhancedHeader
          title="Categories"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title={`Categories ${categories.length > 0 ? `(${categories.length})` : ''}`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<CartIcon size="medium" color={theme.colors.neutral[900]} />}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Categories List */}
      {categories.length > 0 ? (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[600]]} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📦 No categories available</Text>
          <Text style={styles.emptySubtext}>Pull down to refresh</Text>
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
    backgroundColor: theme.colors.error[50],
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error[500],
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error[700],
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
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.neutral[500],
  },
  categoriesList: {
    padding: 16,
  },
  categoryCardWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
  },
  categoryCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  categoryImage: {
    width: 100,
    height: '100%',
    backgroundColor: theme.colors.neutral[100],
  },
  categoryInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    flex: 1,
    marginRight: 8,
  },
  itemCount: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  categorySubtitle: {
    fontSize: 13,
    color: theme.colors.neutral[600],
    marginBottom: 4,
    lineHeight: 18,
  },
  readMoreButton: {
    marginTop: 2,
  },
  readMoreText: {
    fontSize: 12,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  subcategoryBadge: {
    backgroundColor: theme.colors.neutral[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  subcategoryText: {
    fontSize: 11,
    color: theme.colors.neutral[700],
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingRight: 12,
    paddingLeft: 4,
  },
  arrow: {
    fontSize: 18,
    color: theme.colors.neutral[400],
    fontWeight: 'bold',
  },
});

export default CategoriesScreen;