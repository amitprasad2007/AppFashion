import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import { ApiCollection } from '../services/api';
import { getApiBaseUrl } from '../utils/networkConfig';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8; // 80% of screen width for better visibility
const CARD_HEIGHT = 180;

interface CollectionCardProps {
    collection: ApiCollection;
    onPress: (collection: ApiCollection) => void;
    style?: ViewStyle;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onPress, style }) => {

    // Helper to resolve image URL
    const getImageUrl = (path: string) => {
        if (!path) return 'https://via.placeholder.com/600x300';
        if (path.startsWith('http')) return path;
        // Remove /api from base url and append /storage/path
        const baseUrl = getApiBaseUrl().replace('/api', '');
        return `${baseUrl}/storage/${path}`;
    };

    const imageUrl = getImageUrl(collection.banner_image || collection.thumbnail_image);

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={() => onPress(collection)}
            activeOpacity={0.9}
        >
            <ImageBackground
                source={{ uri: imageUrl }}
                style={styles.imageBackground}
                imageStyle={styles.image}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <Text style={styles.subtitle}>COLLECTION</Text>
                        <Text style={styles.title} numberOfLines={1}>
                            {collection.name}
                        </Text>
                        <Text style={styles.description} numberOfLines={2}>
                            {collection.description || 'Discover our exclusive collection of fine textiles.'}
                        </Text>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>EXPLORE</Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: theme.colors.neutral[200],
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    imageBackground: {
        width: '100%',
        height: '100%',
    },
    image: {
        borderRadius: 12,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
    },
    content: {
        width: '100%',
    },
    subtitle: {
        color: theme.colors.gold,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    title: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'serif', // Use serif for elegant feel
    },
    description: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        marginBottom: 12,
        lineHeight: 18,
    },
    button: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        color: theme.colors.primary[900],
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default CollectionCard;
