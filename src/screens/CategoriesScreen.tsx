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
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import AppHeader from '../components/AppHeader';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import AnimatedCard from '../components/AnimatedCard';
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

  const renderCategory = ({item, index}: {item: ApiCategory; index: number}) => {
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
          style={styles.categoryCard}
          onPress={() => navigation.navigate('ProductList', {categoryId: String(item.id), categoryName: item.name})}
          activeOpacity={0.9}>
          <GlassCard style={styles.categoryGlassCard} gradientColors={gradient}>
            <Image source={{uri: item.image}} style={styles.categoryImage} />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categorySubtitle}>{item.description || 'Explore this category'}</Text>
              <Text style={styles.itemCount}>
                {(item as any).itemCount ? `${(item as any).itemCount} items` : 'Available items'}
              </Text>
              {(item as any).subcategories && (item as any).subcategories.length > 0 && (
                <View style={styles.subcategoriesContainer}>
                  {(item as any).subcategories.slice(0, 4).map((sub: string, index: number) => (
                    <Text key={index} style={styles.subcategory}>
                      {sub}{index < Math.min((item as any).subcategories.length, 4) - 1 ? ' • ' : ''}
                    </Text>
                  ))}
                  {(item as any).subcategories.length > 4 && (
                    <Text style={styles.subcategory}> +{(item as any).subcategories.length - 4} more</Text>
                  )}
                </View>
              )}
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </AnimatedCard>
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
          rightComponent={
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => navigation.navigate('Search')}>
              <Text style={styles.searchIconText}>🔍</Text>
            </TouchableOpacity>
          }
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
        rightComponent={
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}>
            <Text style={styles.searchIconText}>🔍</Text>
          </TouchableOpacity>
        }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing[3],
    fontWeight: theme.typography.fontWeight.medium,
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
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: theme.spacing[4],
  },
  categoryName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing[1],
  },
  categorySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing[1],
  },
  itemCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subcategory: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.neutral[400],
    marginLeft: theme.spacing[3],
  },
});

export default CategoriesScreen;