import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { apiService, ApiProductReview } from '../services/api';
import ReviewItem from './ReviewItem';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface ProductReviewsProps {
    productSlug: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productSlug }) => {
    const [reviews, setReviews] = useState<ApiProductReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [averageRating, setAverageRating] = useState(0);

    // Form state
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { state } = useAuth();
    const { user, isAuthenticated } = state;
    const navigation = useNavigation<any>();

    const fetchReviews = useCallback(async () => {
        if (!productSlug) return;

        setLoading(true);
        try {
            const data = await apiService.getProductReviews(productSlug);
            setReviews(data);

            // Calculate average rating
            if (data.length > 0) {
                const sum = data.reduce((acc, review) => acc + review.rating, 0);
                setAverageRating(sum / data.length);
            } else {
                setAverageRating(0);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [productSlug]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmitReview = async () => {
        if (!isAuthenticated || !user) {
            Alert.alert(
                'Login Required',
                'Please log in to submit a review.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') },
                ]
            );
            return;
        }

        if (!reviewText.trim()) {
            Alert.alert('Error', 'Please enter a review text.');
            return;
        }

        setSubmitting(true);
        try {
            await apiService.addProductReview({
                productSlug,
                rating,
                reviewText,
                userId: String(user.id),
            });

            Alert.alert('Success', 'Your review has been submitted!');
            setReviewText('');
            setRating(5);
            fetchReviews(); // Refresh reviews
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderRatingInput = () => {
        return (
            <View style={styles.ratingInput}>
                <Text style={styles.label}>Your Rating:</Text>
                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Icon
                                name={star <= rating ? 'star' : 'star-border'}
                                size={32}
                                color={star <= rating ? '#FFD700' : '#CCCCCC'}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    if (loading && reviews.length === 0) {
        return <ActivityIndicator size="small" color="#000" style={{ marginVertical: 20 }} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>

            <View style={styles.summaryContainer}>
                <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                            key={star}
                            name={star <= Math.round(averageRating) ? 'star' : 'star-border'}
                            size={20}
                            color={star <= Math.round(averageRating) ? '#FFD700' : '#CCCCCC'}
                        />
                    ))}
                </View>
                <Text style={styles.totalReviews}>({reviews.length} reviews)</Text>
            </View>

            <View style={styles.reviewsList}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))
                ) : (
                    <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
                )}
            </View>

            <View style={styles.addReviewContainer}>
                <Text style={styles.subTitle}>Write a Review</Text>
                {renderRatingInput()}
                <TextInput
                    style={styles.textInput}
                    placeholder="Share your thoughts..."
                    multiline
                    numberOfLines={4}
                    value={reviewText}
                    onChangeText={setReviewText}
                    editable={!submitting}
                />
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmitReview}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Review</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    summaryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
    },
    averageRating: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 8,
        color: '#333',
    },
    starsRow: {
        flexDirection: 'row',
        marginRight: 8,
    },
    totalReviews: {
        fontSize: 14,
        color: '#666',
    },
    reviewsList: {
        marginBottom: 24,
    },
    noReviewsText: {
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
        marginVertical: 10,
    },
    addReviewContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    ratingInput: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#555',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
        fontSize: 14,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#666',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProductReviews;
