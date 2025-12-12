import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { theme } from '../theme';
import { ApiCategory } from '../services/api';

interface CategoryCardProps {
    category: ApiCategory;
    onPress: () => void;
    style?: ViewStyle;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: category.image || 'https://via.placeholder.com/100' }}
                    style={styles.image}
                />
                <View style={styles.overlay} />
            </View>
            <Text style={styles.title} numberOfLines={1}>{category.name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: 16,
        width: 80,
    },
    imageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35, // Perfectly rounded
        overflow: 'hidden',
        backgroundColor: theme.colors.neutral[200],
        marginBottom: 8,
        borderWidth: 2,
        borderColor: theme.colors.gold, // Gold border for 'Royal' feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)', // Subtle darkening
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.neutral[800],
        textAlign: 'center',
        width: '100%',
    },
});

export default CategoryCard;
