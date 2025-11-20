import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import EnhancedImage from '../components/EnhancedImage';
import BeautifulBackButton from '../components/BeautifulBackButton';
import AnimatedCard from '../components/AnimatedCard';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import { theme } from '../theme';
import LinearGradient from 'react-native-linear-gradient';

type SearchScreenRouteProp = RouteProp<RootStackParamList, 'Search'>;

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
  const [recentSearches] = useState(['dress', 'headphones', 'shoes', 'watch']);
  const [popularSearches] = useState(['summer sale', 'wireless', 'nike', 'apple']);

  const searchResults: SearchResult[] = [
    {id: '1', name: 'Summer Dress Collection', type: 'category' as const, image: 'https://via.placeholder.com/60'},
    {id: '2', name: 'Wireless Headphones Pro', type: 'product' as const, price: '₹89.99', image: 'https://via.placeholder.com/60'},
    {id: '3', name: 'Running Shoes Nike', type: 'product' as const, price: '₹129.99', image: 'https://via.placeholder.com/60'},
    {id: '4', name: 'Smart Watch Series 5', type: 'product' as const, price: '₹299.99', image: 'https://via.placeholder.com/60'},
    {id: '5', name: 'Fashion Accessories', type: 'category' as const, image: 'https://via.placeholder.com/60'},
  ];

  const filteredResults = searchResults.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you would make an API call here
  };

  const renderSearchResult = ({item, index}: {item: SearchResult; index: number}) => (
    <AnimatedCard delay={index * 50}>
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          if (item.type === 'product') {
            navigation.navigate('ProductDetails', {productSlug: item.slug || item.id.toString()});
          } else {
            navigation.navigate('ProductList', {categoryName: item.name});
          }
        }}
        activeOpacity={0.9}>
        <GlassCard style={styles.resultItem} variant="light">
          <EnhancedImage 
            source={{uri: item.image}} 
            style={styles.resultImage}
            width={60}
            height={60}
            borderRadius={theme.borderRadius.lg}
            placeholder={item.name}
            fallbackIcon={item.type === 'product' ? '👗' : '📂'}
          />
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultType}>{item.type === 'product' ? 'Product' : 'Category'}</Text>
            {item.price && <Text style={styles.resultPrice}>{item.price}</Text>}
          </View>
          <View style={styles.arrow}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const renderSearchTag = (text: string, onPress: (text: string) => void, index: number) => (
    <TouchableOpacity
      key={text}
      style={styles.searchTag}
      onPress={() => onPress(text)}>
      <GlassCard style={styles.searchTag} variant="light">
        <Text style={styles.searchTagText}>{text}</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.glassGradients.emerald}
        style={StyleSheet.absoluteFillObject}
      />
      <FloatingElements count={8} />
      
      <EnhancedHeader 
        title="🔍 Search"
        showBackButton={true}
      />

      {/* Search Input */}
      <View>
        <GlassCard style={styles.searchInput} variant="light">
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, categories..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <GlassCard style={styles.clearButton} variant="light">
                <Text style={styles.clearButton}>✕</Text>
              </GlassCard>
            </TouchableOpacity>
          )}
        </GlassCard>
      </View>

      {searchQuery.length === 0 ? (
        <View style={styles.emptySearch}>
          {/* Recent Searches */}
          <AnimatedCard delay={100}>
            <GlassCard style={styles.section} gradientColors={theme.glassGradients.aurora}>
              <Text style={styles.sectionTitle}>⏰ Recent Searches</Text>
              <View style={styles.tagsContainer}>
                {recentSearches.map((search, index) =>
                  renderSearchTag(search, handleSearch, index)
                )}
              </View>
            </GlassCard>
          </AnimatedCard>

          {/* Popular Searches */}
          <AnimatedCard delay={200}>
            <GlassCard style={styles.section} gradientColors={theme.glassGradients.sunset}>
              <Text style={styles.sectionTitle}>🔥 Popular Searches</Text>
              <View style={styles.tagsContainer}>
                {popularSearches.map((search, index) =>
                  renderSearchTag(search, handleSearch, index)
                )}
              </View>
            </GlassCard>
          </AnimatedCard>

          {/* Quick Categories */}
          <AnimatedCard delay={300}>
            <GlassCard style={styles.section} gradientColors={theme.glassGradients.purple}>
              <Text style={styles.sectionTitle}>📂 Shop by Category</Text>
              <View style={styles.quickCategories}>
                <TouchableOpacity
                  style={{ marginBottom: 15 }}
                  onPress={() => navigation.navigate('ProductList', {categoryName: 'Fashion'})}>
                  <GlassCard style={styles.categoryButton} variant="light">
                    <Text style={styles.categoryEmoji}>👗</Text>
                    <Text style={styles.categoryName}>Fashion</Text>
                  </GlassCard>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginBottom: 15 }}
                  onPress={() => navigation.navigate('ProductList', {categoryName: 'Electronics'})}>
                  <GlassCard style={styles.categoryButton} variant="light">
                    <Text style={styles.categoryEmoji}>📱</Text>
                    <Text style={styles.categoryName}>Electronics</Text>
                  </GlassCard>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginBottom: 15 }}
                  onPress={() => navigation.navigate('ProductList', {categoryName: 'Sports'})}>
                  <GlassCard style={styles.categoryButton} variant="light">
                    <Text style={styles.categoryEmoji}>⚽</Text>
                    <Text style={styles.categoryName}>Sports</Text>
                  </GlassCard>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginBottom: 15 }}
                  onPress={() => navigation.navigate('ProductList', {categoryName: 'Home'})}>
                  <GlassCard style={styles.categoryButton} variant="light">
                    <Text style={styles.categoryEmoji}>🏠</Text>
                    <Text style={styles.categoryName}>Home</Text>
                  </GlassCard>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </AnimatedCard>
        </View>
      ) : (
        <View style={styles.searchResults}>
          <AnimatedCard delay={50}>
            <GlassCard style={styles.resultsHeader} variant="light">
              <Text style={styles.resultsHeader}>
                🔍 {filteredResults.length} results for "{searchQuery}"
              </Text>
            </GlassCard>
          </AnimatedCard>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  clearButton: {
    fontSize: 18,
    color: '#666',
    marginLeft: 10,
    padding: 5,
  },
  emptySearch: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  searchTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  searchTagText: {
    fontSize: 14,
    color: '#333',
  },
  quickCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchResults: {
    flex: 1,
    padding: 15,
  },
  resultsHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultType: {
    fontSize: 12,
    color: '#007bff',
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
    marginLeft: 10,
  },
});

export default SearchScreen;