import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { apiService, ApiPolicy } from '../services/api';
import FloatingElements from '../components/FloatingElements';
import LinearGradient from 'react-native-linear-gradient';

const PolicyScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type, title } = route.params as { type: string; title: string };
    const { width } = useWindowDimensions();

    const [policy, setPolicy] = useState<ApiPolicy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPolicy();
    }, [type]);

    const loadPolicy = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getPolicy(type);
            setPolicy(data);
        } catch (err) {
            console.error(`Error loading ${type} policy:`, err);
            setError('Failed to load policy content. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <EnhancedHeader title={title} showBackButton={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.glassGradients.purple}
                style={styles.backgroundGradient}
            />
            <FloatingElements count={5} />

            <EnhancedHeader title={title} showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <View style={styles.card}>
                        {policy?.metadata && policy.metadata.sections ? (
                            <>
                                {policy.metadata.introduction && (
                                    <Text style={styles.introduction}>{policy.metadata.introduction}</Text>
                                )}

                                {/* Standard Sections */}
                                {policy.metadata.sections && policy.metadata.sections.map((section, index) => (
                                    <View key={`section-${index}`} style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>{section.title}</Text>
                                        <View style={styles.listContainer}>
                                            {section.items && section.items.map((item, itemIndex) => (
                                                <View key={itemIndex} style={styles.listItem}>
                                                    <Text style={styles.bulletPoint}>•</Text>
                                                    <Text style={styles.listItemText}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}

                                {/* Shipping: Note */}
                                {policy.metadata.note && (
                                    <View style={styles.noteContainer}>
                                        <Text style={styles.noteTitle}>Note</Text>
                                        <Text style={styles.noteText}>{policy.metadata.note}</Text>
                                    </View>
                                )}

                                {/* Shipping: Tracking */}
                                {policy.metadata.tracking && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>{policy.metadata.tracking.title}</Text>
                                        <Text style={styles.text}>{policy.metadata.tracking.content}</Text>
                                    </View>
                                )}

                                {/* Shipping: Delivery Areas */}
                                {policy.metadata.delivery_areas && policy.metadata.delivery_areas.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>Delivery Areas & Timelines</Text>
                                        {policy.metadata.delivery_areas.map((area, index) => (
                                            <View key={`area-${index}`} style={styles.rowItem}>
                                                <Text style={styles.rowLabel}>{area.area}</Text>
                                                <Text style={styles.rowValue}>{area.time}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Shipping: Shipping Methods */}
                                {policy.metadata.shipping_methods && policy.metadata.shipping_methods.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>Shipping Methods</Text>
                                        {policy.metadata.shipping_methods.map((method, index) => (
                                            <View key={`method-${index}`} style={styles.methodCard}>
                                                <View style={styles.methodHeader}>
                                                    <Text style={styles.methodName}>{method.name}</Text>
                                                    <Text style={styles.methodPrice}>{method.price}</Text>
                                                </View>
                                                <Text style={styles.methodTime}>{method.time}</Text>
                                                <Text style={styles.methodDetails}>{method.details}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text style={styles.policyText}>
                                {policy?.content?.replace(/<[^>]*>?/gm, '\n').replace(/&nbsp;/g, ' ') || 'No content available.'}
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[50],
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    policyText: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.neutral[800],
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        color: theme.colors.error[600],
        fontSize: 16,
        textAlign: 'center',
    },
    introduction: {
        fontSize: 16,
        lineHeight: 26,
        color: theme.colors.neutral[700],
        marginBottom: 32,
        fontFamily: theme.typography.fontFamily.medium,
        textAlign: 'justify',
    },
    sectionContainer: {
        marginBottom: 28,
        backgroundColor: theme.colors.white,
        padding: 20,
        borderRadius: 16,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.neutral[100],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary[600],
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 0.5,
    },
    listContainer: {
        paddingLeft: 4,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        fontSize: 20,
        color: theme.colors.secondary[500],
        marginRight: 12,
        marginTop: -4,
        fontWeight: 'bold',
    },
    listItemText: {
        fontSize: 15,
        lineHeight: 24,
        color: theme.colors.neutral[600],
        flex: 1,
        fontFamily: theme.typography.fontFamily.regular,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: theme.colors.neutral[700],
        fontFamily: theme.typography.fontFamily.regular,
    },
    noteContainer: {
        backgroundColor: theme.colors.primary[50],
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary[500],
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary[700],
        marginBottom: 8,
        fontFamily: theme.typography.fontFamily.bold,
    },
    noteText: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.primary[800],
        fontFamily: theme.typography.fontFamily.regular,
    },
    rowItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[100],
    },
    rowLabel: {
        fontSize: 15,
        color: theme.colors.neutral[800],
        fontFamily: theme.typography.fontFamily.medium,
        flex: 1,
    },
    rowValue: {
        fontSize: 15,
        color: theme.colors.neutral[600],
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'right',
        flex: 1,
    },
    methodCard: {
        backgroundColor: theme.colors.neutral[50],
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
    },
    methodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        fontFamily: theme.typography.fontFamily.bold,
    },
    methodPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary[600],
        fontFamily: theme.typography.fontFamily.bold,
    },
    methodTime: {
        fontSize: 14,
        color: theme.colors.neutral[600],
        marginBottom: 4,
        fontFamily: theme.typography.fontFamily.medium,
    },
    methodDetails: {
        fontSize: 13,
        color: theme.colors.neutral[500],
        fontFamily: theme.typography.fontFamily.regular,
    },
});

export default PolicyScreen;
