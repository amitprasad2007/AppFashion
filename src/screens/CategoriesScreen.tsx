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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import AppHeader from '../components/AppHeader';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import AnimatedCard from '../components/AnimatedCard';
import CartIcon from '../components/CartIcon';
import { apiService, ApiCategory } from '../services/api';
import { theme } from '../theme';
import LinearGradient from 'react-native-linear-gradient';

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
        console.log('Categories loaded successfully:', categoriesData.length);
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
    const gradients = [
      theme.glassGradients.aurora,
      theme.glassGradients.sunset,
      theme.glassGradients.emerald,
      theme.glassGradients.purple,
      theme.glassGradients.rose,
      theme.glassGradients.ocean,
    ];

    const gradient = gradients[index % gradients.length];
    const isExpanded = expandedItems.has(String(item.id));
    const description = item.description || 'Explore this amazing category with a wide variety of products. Discover the latest trends and find exactly what you\'re looking for in our carefully curated collection.';
    const shouldShowReadMore = description.length > 120;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductList', { categoryId: String(item.id), categoryName: item.name })}
        activeOpacity={0.9}>
        <GlassCard style={styles.categoryCard} gradientColors={gradient}>
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.categorySubtitle} numberOfLines={isExpanded ? undefined : 3}>
                {description}
              </Text>
              {shouldShowReadMore && (
                <TouchableOpacity
                  onPress={() => toggleExpanded(String(item.id))}
                  style={styles.readMoreButton}
                >
                  <Text style={styles.readMoreText}>
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.itemCount}>
              {(item as any).itemCount ? `${(item as any).itemCount} items` : 'Available items'}
            </Text>
            {(item as any).subcategories && (item as any).subcategories.length > 0 && (
              <View style={styles.subcategoriesContainer}>
                {(item as any).subcategories.slice(0, 3).map((sub: string, index: number) => (
                  <Text key={index} style={styles.subcategory}>
                    {sub}{index < Math.min((item as any).subcategories.length, 3) - 1 ? ' • ' : ''}
                  </Text>
                ))}
                {(item as any).subcategories.length > 3 && (
                  <Text style={styles.subcategory}> +{(item as any).subcategories.length - 3}</Text>
                )}
              </View>
            )}
          </View>
          <Text style={styles.arrow}>→</Text>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  // Show loading spinner on initial load
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.glassGradients.ocean}
          style={styles.backgroundGradient}
        />
        <FloatingElements count={6} />

        <EnhancedHeader
          title="📂 Categories"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightComponent={<CartIcon size="medium" color={theme.colors.white} />}
        />
        <View style={styles.loadingContainer}>
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </GlassCard>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.ocean}
        style={styles.backgroundGradient}
      />
      <FloatingElements count={6} />

      <EnhancedHeader
        title={`📂 Categories ${categories.length > 0 ? `(${categories.length})` : ''}`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<CartIcon size="medium" color={theme.colors.white} />}
      />

      {error && (
        <View style={styles.errorContainer}>
          <GlassCard style={styles.errorCard} variant="light">
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </GlassCard>
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <GlassCard style={styles.emptyCard} gradientColors={theme.glassGradients.sunset}>
            <Text style={styles.emptyText}>📦 No categories available</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    marginTop: theme.spacing[3],
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorCard: {
    padding: theme.spacing[4],
  },
  emptyCard: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: theme.spacing[3],
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#c62828',
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[2],
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[400],
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  searchIconText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
  },
  categoriesList: {
    padding: theme.spacing[4],
  },
  categoryCard: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
    marginHorizontal: theme.spacing[1],
    alignItems: 'flex-start',
    overflow: 'hidden',
    minHeight: 160,
  },
  categoryImage: {
    width: 130,
    height: 160,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: theme.spacing[5],
    paddingVertical: theme.spacing[2],
  },
  categoryName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing[2],
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  descriptionContainer: {
    marginBottom: theme.spacing[2],
  },
  categorySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontWeight: '500',
    opacity: 0.9,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    minHeight: 60,
  },
  readMoreButton: {
    marginTop: theme.spacing[1],
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
  itemCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '600',
    marginBottom: theme.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subcategory: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '500',
    opacity: 0.8,
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.white,
    marginLeft: theme.spacing[4],
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 20,
    lineHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default CategoriesScreen;