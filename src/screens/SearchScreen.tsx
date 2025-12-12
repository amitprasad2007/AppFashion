import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedImage from '../components/EnhancedImage';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';

type SearchResult = {
  id: string;
  name: string;
  slug?: string;
  type: 'category' | 'product';
  image: string;
  price?: string;
};

const SearchScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState(['Banarasi Saree', 'Silk', 'Wedding Collection', 'Gold Jewelry']);
  const [popularSearches] = useState(['Bridal', 'Katan Silk', 'Georgette', 'Offer']);

  const searchResults: SearchResult[] = [
    { id: '1', name: 'Summer Wedding Collection', type: 'category' as const, image: 'https://via.placeholder.com/60' },
    { id: '2', name: 'Premium Silk Saree', type: 'product' as const, price: '₹8999', image: 'https://via.placeholder.com/60' },
    { id: '3', name: 'Banarasi Dupatta', type: 'product' as const, price: '₹2499', image: 'https://via.placeholder.com/60' },
    { id: '4', name: 'Gold Plated Necklace', type: 'product' as const, price: '₹4999', image: 'https://via.placeholder.com/60' },
    { id: '5', name: 'Accessories', type: 'category' as const, image: 'https://via.placeholder.com/60' },
  ];

  const filteredResults = searchResults.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you would make an API call here
  };

  const renderSearchResult = ({ item, index }: { item: SearchResult; index: number }) => (
    <TouchableOpacity
      key={index}
      style={styles.resultItem}
      onPress={() => {
        if (item.type === 'product') {
          navigation.navigate('ProductDetails', { productSlug: item.slug || item.id.toString() });
        } else {
          navigation.navigate('ProductList', { categoryName: item.name });
        }
      }}
      activeOpacity={0.7}>
      <EnhancedImage
        source={{ uri: item.image }}
        style={styles.resultImage}
        borderRadius={8}
        placeholder={item.name}
        fallbackIcon={item.type === 'product' ? '👗' : '📂'}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={[
          styles.resultType,
          {
            backgroundColor: item.type === 'product' ? theme.colors.primary[50] : theme.colors.secondary[50],
            color: item.type === 'product' ? theme.colors.primary[700] : theme.colors.secondary[700]
          }
        ]}>{item.type === 'product' ? 'Product' : 'Category'}</Text>
        {item.price && <Text style={styles.resultPrice}>{item.price}</Text>}
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  const renderSearchTag = (text: string, onPress: (text: string) => void) => (
    <TouchableOpacity
      key={text}
      style={styles.searchTag}
      onPress={() => onPress(text)}>
      <Text style={styles.searchTagText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title="🔍 Search"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, categories..."
            placeholderTextColor={theme.colors.neutral[400]}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length === 0 ? (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Recent Searches</Text>
            <View style={styles.tagsContainer}>
              {recentSearches.map((search) => renderSearchTag(search, handleSearch))}
            </View>
          </View>

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Popular Searches</Text>
            <View style={styles.tagsContainer}>
              {popularSearches.map((search) => renderSearchTag(search, handleSearch))}
            </View>
          </View>

          {/* Quick Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📂 Shop by Category</Text>
            <View style={styles.quickCategories}>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigation.navigate('ProductList', { categoryName: 'Fashion' })}>
                <Text style={styles.categoryEmoji}>👗</Text>
                <Text style={styles.categoryName}>Fashion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigation.navigate('ProductList', { categoryName: 'Sarees' })}>
                <Text style={styles.categoryEmoji}>👘</Text>
                <Text style={styles.categoryName}>Sarees</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigation.navigate('ProductList', { categoryName: 'Jewelry' })}>
                <Text style={styles.categoryEmoji}>💍</Text>
                <Text style={styles.categoryName}>Jewelry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigation.navigate('ProductList', { categoryName: 'Home' })}>
                <Text style={styles.categoryEmoji}>🏠</Text>
                <Text style={styles.categoryName}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.searchResults}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsHeaderText}>
              Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
          </View>
          <FlatList
            data={filteredResults}
            renderItem={renderSearchResult}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
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
  clearButton: {
    fontSize: 18,
    color: theme.colors.neutral[500],
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchTag: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  searchTagText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
  },
  quickCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  searchResults: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  resultsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  resultsHeaderText: {
    fontSize: 14,
    color: theme.colors.neutral[600],
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 4,
  },
  resultType: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
    fontWeight: '500',
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  arrow: {
    fontSize: 18,
    color: theme.colors.neutral[400],
    marginLeft: 12,
  },
});

export default SearchScreen;