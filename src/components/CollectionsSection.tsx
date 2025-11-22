import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import GlassCard from './GlassCard';
import { apiService, ApiCollection } from '../services/api';
import AnimatedCard from './AnimatedCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface CollectionsSectionProps {
  onCollectionPress?: (collection: ApiCollection) => void;
}

const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  onCollectionPress,
}) => {
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const featuredCollections = await apiService.getFeaturedCollections();
      const allCollections = await apiService.getAllCollections();

      // Combine and deduplicate collections
      const combinedCollections = [...featuredCollections, ...allCollections];
      const uniqueCollections = combinedCollections.filter(
        (collection, index, self) =>
          index === self.findIndex((c) => c.id === collection.id)
      );

      setCollections(uniqueCollections.slice(0, 6)); // Show max 6 collections
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUri = (imagePath: string | null | undefined) => {
    // Handle local file paths and convert to placeholder
    if (!imagePath || imagePath.includes('C:\\') || imagePath.includes('tmp')) {
      return `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
    }
    return imagePath;
  };

  const renderCollectionCard = ({ item, index }: { item: ApiCollection; index: number }) => {
    const gradientColors = [
      theme.glassGradients.aurora,
      theme.glassGradients.sunset,
      theme.glassGradients.ocean,
      theme.glassGradients.emerald,
      theme.glassGradients.purple,
      theme.glassGradients.rose,
    ];

    const cardGradient = gradientColors[index % gradientColors.length];

    return (
      <AnimatedCard delay={index * 200}>
        <TouchableOpacity
          style={styles.collectionCard}
          onPress={() => onCollectionPress?.(item)}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: getImageUri(item.banner_image) }}
            style={styles.imageBackground}
            imageStyle={styles.backgroundImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            <GlassCard
              style={styles.contentCard}
              gradientColors={cardGradient}
              borderRadius={theme.borderRadius.xl}
            >
              <View style={styles.collectionContent}>
                <View style={styles.collectionHeader}>
                  <View style={styles.typeContainer}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                      style={styles.typeBadge}
                    >
                      <Text style={styles.typeText}>
                        {item.collection_type?.name ? item.collection_type.name : 'Collection'}
                      </Text>
                    </LinearGradient>
                  </View>

                  <Text style={styles.collectionName} numberOfLines={2}>
                    {item.name ? item.name : 'Untitled Collection'}
                  </Text>

                  <Text style={styles.collectionDescription} numberOfLines={3}>
                    {item.description ? item.description : 'A beautiful collection of premium items'}
                  </Text>
                </View>

                <View style={styles.actionContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.exploreButton}
                  >
                    <Text style={styles.exploreButtonText}>Explore Collection</Text>
                  </LinearGradient>
                </View>
              </View>
            </GlassCard>
          </ImageBackground>
        </TouchableOpacity>
      </AnimatedCard >
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <GlassCard style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading Collections...</Text>
        </GlassCard>
      </View>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <GlassCard style={styles.headerCard} variant="light">
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={theme.glassGradients.aurora}
              style={styles.titleGradient}
            >
              <Text style={styles.sectionTitle}>✨ Curated Collections</Text>
            </LinearGradient>
            <Text style={styles.sectionSubtitle}>
              Discover our handpicked seasonal and themed collections
            </Text>
          </View>
        </GlassCard>
      </View>

      <FlatList
        data={collections}
        renderItem={renderCollectionCard}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + theme.spacing[4]}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[2],
  },
  sectionHeader: {
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[2],
  },
  headerCard: {
    marginBottom: theme.spacing[2],
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleGradient: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.typography.heading.h2.fontSize,
    fontWeight: theme.typography.heading.h2.fontWeight as any,
    color: theme.colors.white,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: theme.typography.body.large.fontSize,
    color: theme.light.onSurface,
    textAlign: 'center',
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
  collectionCard: {
    width: CARD_WIDTH * 0.85,
    height: 280,
    marginRight: theme.spacing[4],
    marginVertical: theme.spacing[2],
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    borderRadius: theme.borderRadius['2xl'],
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentCard: {
    margin: theme.spacing[3],
    flex: 1,
  },
  collectionContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  collectionHeader: {
    flex: 1,
  },
  typeContainer: {
    marginBottom: theme.spacing[3],
  },
  typeBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collectionName: {
    fontSize: theme.typography.heading.h3.fontSize,
    fontWeight: theme.typography.heading.h3.fontWeight as any,
    color: theme.colors.white,
    marginBottom: theme.spacing[2],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  collectionDescription: {
    fontSize: theme.typography.body.small.fontSize,
    color: theme.colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: theme.spacing[4],
  },
  exploreButton: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: theme.typography.body.medium.fontSize,
    fontWeight: '600',
    color: theme.colors.white,
  },
  loadingContainer: {
    marginVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
  },
  loadingText: {
    fontSize: theme.typography.body.large.fontSize,
    color: theme.light.onSurface,
    marginTop: theme.spacing[4],
  },
});

export default CollectionsSection;
