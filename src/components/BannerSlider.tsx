import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import AnimatedCard from './AnimatedCard';
import GradientButton from './GradientButton';
import { apiService, ApiBannerData } from '../services/api';
import { testApiConnection, getDeviceNetworkInfo } from '../utils/debugNetwork';

const { width } = Dimensions.get('window');

interface BannerData {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  gradient: string[];
  emoji: string;
  buttonText: string;
  onPress: () => void;
}

interface BannerSliderProps {
  banners?: BannerData[];
  autoSlide?: boolean;
  slideInterval?: number;
  onBannerPress?: (banner: ApiBannerData) => void;
}

const BannerSlider: React.FC<BannerSliderProps> = ({
  banners: propBanners,
  autoSlide = true,
  slideInterval = 4000,
  onBannerPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<BannerData[]>(propBanners || []);
  const [loading, setLoading] = useState(!propBanners);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<BannerData>>(null);

  // Luxury gradient themes inspired by Manyavar's elegant style
  const gradientThemes = [
    ['#8B4513', '#DAA520', '#FFD700'], // Rich Brown to Gold - Traditional Elegance
    ['#4A0E0E', '#8B1538', '#DC143C'], // Deep Maroon to Red - Royal Luxury  
    ['#1A1A1A', '#2F2F2F', '#4A4A4A'], // Sophisticated Black/Grey
    ['#8B008B', '#DA70D6', '#DDA0DD'], // Royal Purple - Majestic
    ['#006400', '#32CD32', '#90EE90'], // Emerald Green - Fresh Elegance
    ['#191970', '#4169E1', '#87CEEB'], // Navy to Blue - Classic Sophistication
  ];

  // Emoji themes for fallback
  const emojiThemes = ['🛍️', '👗', '👑', '✨', '🔥', '💎', '🌟', '🎉'];

  // Convert API banner to component banner
  const convertApiBannerToComponentBanner = (apiBanner: ApiBannerData, index: number): BannerData => {
    // Truncate long subtitle for better display
    const truncatedSubtitle = apiBanner.subtitle.length > 100
      ? apiBanner.subtitle.substring(0, 100) + '...'
      : apiBanner.subtitle;

    // Extract call-to-action text or use default
    const buttonText = apiBanner.cta || 'Explore Collection';

    return {
      id: apiBanner.id.toString(),
      title: apiBanner.title,
      subtitle: truncatedSubtitle,
      description: apiBanner.description,
      image: apiBanner.image,
      gradient: gradientThemes[index % gradientThemes.length],
      emoji: emojiThemes[index % emojiThemes.length],
      buttonText: buttonText,
      onPress: () => {
        if (onBannerPress) {
          onBannerPress(apiBanner);
        } else if (apiBanner.path) {
          console.log('Navigate to path:', apiBanner.path);
          // Handle navigation to specific path
        } else {
          console.log('Banner pressed:', apiBanner.title);
        }
      },
    };
  };

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug network connectivity
      getDeviceNetworkInfo();
      console.log('🚀 Attempting to fetch banners...');

      const apiBanners = await apiService.getBanners();

      if (apiBanners && apiBanners.length > 0) {
        const convertedBanners = apiBanners.map((banner, index) =>
          convertApiBannerToComponentBanner(banner, index)
        );
        setBanners(convertedBanners);
      } else {
        // Fallback banners if API returns empty
        setBanners([
          {
            id: 'luxury-1',
            title: 'ROYAL COLLECTION',
            subtitle: 'Exquisite Ethnic Wear',
            description: 'Discover handcrafted premium clothing with traditional artistry and modern elegance',
            gradient: gradientThemes[0],
            emoji: '👑',
            buttonText: 'Explore Collection',
            onPress: () => console.log('Royal Collection pressed'),
          },
          {
            id: 'luxury-2',
            title: 'WEDDING SPECIAL',
            subtitle: 'Bridal & Groom Essentials',
            description: 'Make your special day unforgettable with our curated wedding collection',
            gradient: gradientThemes[1],
            emoji: '💒',
            buttonText: 'Shop Wedding',
            onPress: () => console.log('Wedding Special pressed'),
          },
          {
            id: 'luxury-3',
            title: 'FESTIVE ELEGANCE',
            subtitle: 'Celebration Ready',
            description: 'Traditional meets contemporary in our exclusive festive wear range',
            gradient: gradientThemes[2],
            emoji: '✨',
            buttonText: 'Browse Festive',
            onPress: () => console.log('Festive Elegance pressed'),
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);

      // Test alternative connections
      console.log('🔧 Testing alternative API connections...');
      const testResult = await testApiConnection();

      if (testResult) {
        console.log('✅ Found working connection:', testResult.url);
        // You can update the API config here if needed
      }

      setError('Failed to load banners - Check network connection');
      // Set fallback banners on error
      setBanners([
        {
          id: 'error-luxury-1',
          title: 'PREMIUM FASHION',
          subtitle: 'Offline Collection',
          description: 'Browse our curated selection of premium ethnic and contemporary wear',
          gradient: gradientThemes[3],
          emoji: '🌟',
          buttonText: 'Explore Now',
          onPress: () => console.log('Offline Collection pressed'),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propBanners) {
      fetchBanners();
    }
  }, [propBanners]);

  useEffect(() => {
    if (autoSlide && banners.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * width,
          animated: true,
        });
      }, slideInterval);

      return () => clearInterval(interval);
    }
  }, [currentIndex, autoSlide, banners.length, slideInterval]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const renderBanner = ({ item, index }: { item: BannerData; index: number }) => (
    <View style={styles.bannerContainer}>
      <AnimatedCard
        style={styles.bannerCard}
        elevation="xl"
        animationType="fade"
        delay={index * 200}>
        <LinearGradient
          colors={item.gradient}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>

          {/* Luxury Overlay Pattern */}
          <View style={styles.luxuryOverlay} />

          {/* Main Content */}
          <View style={styles.bannerContent}>
            {/* Premium Badge */}
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>✨ PREMIUM</Text>
            </View>

            {/* Title with Elegant Typography */}
            <Text style={styles.bannerTitle}>{item.title}</Text>

            {/* Subtitle with Gold Accent */}
            {item.subtitle && (
              <View style={styles.subtitleContainer}>
                <View style={styles.goldAccent} />
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                <View style={styles.goldAccent} />
              </View>
            )}

            {/* Description */}
            <Text style={styles.bannerDescription} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Luxury CTA Button */}
            <TouchableOpacity style={styles.luxuryButton} onPress={item.onPress}>
              <LinearGradient
                colors={['#DAA520', '#FFD700', '#FFF8DC']}
                style={styles.luxuryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.luxuryButtonText}>{item.buttonText}</Text>
                <Text style={styles.luxuryButtonIcon}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Enhanced Image/Visual Section */}
          <View style={styles.bannerImageContainer}>
            {item.image ? (
              <View style={styles.imageWrapper}>
                <View style={styles.imageFrame}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                </View>
                {/* Decorative Elements */}
                <View style={styles.decorativeElement1} />
                <View style={styles.decorativeElement2} />
              </View>
            ) : (
              <View style={styles.emojiWrapper}>
                <View style={styles.emojiBackground}>
                  <Text style={styles.bannerEmoji}>{item.emoji}</Text>
                </View>
                {/* Decorative Ring */}
                <View style={styles.decorativeRing} />
              </View>
            )}
          </View>
        </LinearGradient>
      </AnimatedCard>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading amazing deals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Oops! Unable to load banners</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBanners}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderDot = (index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.dot,
        currentIndex === index ? styles.activeDot : styles.inactiveDot,
      ]}
      onPress={() => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToOffset({
          offset: index * width,
          animated: true
        });
      }}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        snapToInterval={width}
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {banners.length > 1 ? (
        <View style={styles.pagination}>
          {banners.map((_, index) => renderDot(index))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing[3],
  },
  bannerContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  bannerCard: {
    width: width - theme.spacing[8],
    marginBottom: theme.spacing[2],
    overflow: 'hidden',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  banner: {
    padding: theme.spacing[6],
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  // Luxury Overlay for Pattern/Texture
  luxuryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  bannerContent: {
    flex: 1.3,
    zIndex: 2,
    paddingRight: theme.spacing[4],
  },
  // Premium Badge
  premiumBadge: {
    backgroundColor: 'rgba(218, 165, 32, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing[2],
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: theme.typography.fontSize['3xl'] + 2,
    fontWeight: '800',
    color: theme.colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    lineHeight: 36,
    marginBottom: theme.spacing[2],
  },
  // Subtitle with Gold Accents
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  goldAccent: {
    width: 20,
    height: 2,
    backgroundColor: '#FFD700',
    marginHorizontal: 8,
    borderRadius: 1,
  },
  bannerSubtitle: {
    fontSize: theme.typography.fontSize.lg + 2,
    fontWeight: '600',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  bannerDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: theme.spacing[4],
    lineHeight: 20,
    fontWeight: '400',
  },
  // Luxury CTA Button
  luxuryButton: {
    alignSelf: 'flex-start',
    borderRadius: 30,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  luxuryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  luxuryButtonText: {
    color: '#000',
    fontSize: theme.typography.fontSize.sm + 1,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  luxuryButtonIcon: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  // Enhanced Image Styling
  imageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,215,0,0.6)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  // Decorative Elements
  decorativeElement1: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,215,0,0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  decorativeElement2: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  // Enhanced Emoji Styling
  emojiWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  bannerEmoji: {
    fontSize: 64,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  decorativeRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
    borderStyle: 'dashed',
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing[5],
    marginTop: theme.spacing[3],
  },
  loadingText: {
    marginTop: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing[5],
    marginTop: theme.spacing[3],
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.error[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[3],
  },
  retryButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
  },
  retryText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    paddingVertical: theme.spacing[2],
    alignSelf: 'center',
    marginHorizontal: theme.spacing[8],
  },
  dot: {
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing[1],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeDot: {
    width: 28,
    height: 10,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  inactiveDot: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

export default BannerSlider;