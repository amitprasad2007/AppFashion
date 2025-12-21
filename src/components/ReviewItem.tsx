import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ApiProductReview } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ReviewItemProps {
    review: ApiProductReview;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
    const { state } = useAuth();
    const { user, isAuthenticated, token } = state;
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Recently'; // Fallback for invalid dates

        // Simple "time ago" logic or just date format
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Icon
                key={index}
                name={index < rating ? 'star' : 'star-border'}
                size={16}
                color={index < rating ? '#FFD700' : '#CCCCCC'}
            />
        ));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.stars}>{renderStars(review.rating)}</View>
                <Text style={styles.date}>{formatDate(review.created_at)}</Text>
            </View>
            <Text style={styles.userName}>{(user?.name==review.user_name)?"Given by You":review.user_name || `User ${review.user_id}`}</Text>
            <Text style={styles.reviewText}>{review.review_text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    stars: {
        flexDirection: 'row',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
});

export default ReviewItem;
