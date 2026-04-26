import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar, TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { apiService, ApiPolicy, DeliveryArea } from '../services/api_service';

const getTypeConfig = (type: string) => {
    switch (type) {
        case 'about_us': return { icon: '🏪', color: theme.colors.primary[50], accent: theme.colors.primary[600] };
        case 'privacy': return { icon: '🔒', color: '#EEF0F7', accent: '#4F46E5' };
        case 'terms': return { icon: '📋', color: '#FEF3C7', accent: '#D97706' };
        case 'refund': return { icon: '💸', color: '#ECFDF5', accent: '#059669' };
        case 'shipping': return { icon: '🚚', color: '#FFF7ED', accent: '#EA580C' };
        default: return { icon: '📄', color: theme.colors.neutral[50], accent: theme.colors.neutral[600] };
    }
};

const PolicyScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type, title } = route.params as { type: string; title: string };

    const [policy, setPolicy] = useState<ApiPolicy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const config = getTypeConfig(type);

    useEffect(() => { loadPolicy(); }, [type]);

    const loadPolicy = async () => {
        try {
            setLoading(true); setError(null);
            const data = await apiService.getPolicy(type);
            setPolicy(data);
        } catch (err) {
            console.error(`Error loading ${type} policy:`, err);
            setError('Failed to load content. Please try again later.');
        } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
                <EnhancedHeader title={title} showBackButton={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title={title} showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Type Hero */}
                <View style={[styles.heroCard, { backgroundColor: config.color }]}>
                    <Text style={styles.heroEmoji}>{config.icon}</Text>
                    <Text style={styles.heroTitle}>{title}</Text>
                </View>

                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={loadPolicy} activeOpacity={0.7}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
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
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionDot, { backgroundColor: config.accent }]} />
                                            <Text style={[styles.sectionTitle, { color: config.accent }]}>{section.title}</Text>
                                        </View>
                                        <View style={styles.listContainer}>
                                            {section.items && section.items.map((item, itemIndex) => (
                                                <View key={itemIndex} style={styles.listItem}>
                                                    <View style={styles.bulletDot} />
                                                    <Text style={styles.listItemText}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}

                                {/* Shipping: Note */}
                                {policy.metadata.note && (
                                    <View style={styles.noteContainer}>
                                        <Text style={styles.noteIcon}>📌</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.noteTitle}>Important Note</Text>
                                            <Text style={styles.noteText}>{policy.metadata.note}</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Shipping: Tracking */}
                                {policy.metadata.tracking && (
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionDot, { backgroundColor: config.accent }]} />
                                            <Text style={[styles.sectionTitle, { color: config.accent }]}>{policy.metadata.tracking.title}</Text>
                                        </View>
                                        <Text style={styles.text}>{policy.metadata.tracking.content}</Text>
                                    </View>
                                )}

                                {/* Shipping: Delivery Areas */}
                                {policy.metadata.delivery_areas && policy.metadata.delivery_areas.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionDot, { backgroundColor: config.accent }]} />
                                            <Text style={[styles.sectionTitle, { color: config.accent }]}>Delivery Areas & Timelines</Text>
                                        </View>
                                        {policy.metadata.delivery_areas.map((area, index) => (
                                            <View key={`area-${index}`} style={styles.rowItem}>
                                                <Text style={styles.rowLabel}>📍 {area.area}</Text>
                                                <Text style={styles.rowValue}>{area.time}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Shipping: Methods */}
                                {policy.metadata.shipping_methods && policy.metadata.shipping_methods.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionDot, { backgroundColor: config.accent }]} />
                                            <Text style={[styles.sectionTitle, { color: config.accent }]}>Shipping Methods</Text>
                                        </View>
                                        {policy.metadata.shipping_methods.map((method, index) => (
                                            <View key={`method-${index}`} style={styles.methodCard}>
                                                <View style={styles.methodHeader}>
                                                    <Text style={styles.methodName}>{method.name}</Text>
                                                    <View style={styles.methodPriceBadge}>
                                                        <Text style={styles.methodPrice}>{method.price}</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.methodTime}>⏱ {method.time}</Text>
                                                <Text style={styles.methodDetails}>{method.details}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Refund Timelines */}
                                {policy.metadata.refund_timelines && policy.metadata.refund_timelines.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionDot, { backgroundColor: config.accent }]} />
                                            <Text style={[styles.sectionTitle, { color: config.accent }]}>Refund Timelines</Text>
                                        </View>
                                        {policy.metadata.refund_timelines.map((timeline: any, index: number) => (
                                            <View key={`timeline-${index}`} style={styles.rowItem}>
                                                <Text style={styles.rowLabel}>💳 {timeline.method || timeline.area}</Text>
                                                <Text style={styles.rowValue}>{timeline.time}</Text>
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
    container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: theme.colors.neutral[500], fontSize: 14 },
    content: { padding: 16, paddingBottom: 40 },

    // Hero
    heroCard: {
        alignItems: 'center', borderRadius: 16, paddingVertical: 24, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    },
    heroEmoji: { fontSize: 40, marginBottom: 10 },
    heroTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 4 },
    heroDate: { fontSize: 12, color: theme.colors.neutral[500] },

    // Error
    errorCard: {
        backgroundColor: theme.colors.white, borderRadius: 16, padding: 32, alignItems: 'center',
        borderWidth: 1, borderColor: theme.colors.error[100],
    },
    errorIcon: { fontSize: 40, marginBottom: 12 },
    errorText: { color: theme.colors.error[600], fontSize: 15, textAlign: 'center', marginBottom: 16 },
    retryBtn: {
        backgroundColor: theme.colors.primary[600], paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: 10,
    },
    retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Main Card
    card: {
        backgroundColor: theme.colors.white, borderRadius: 16, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
        shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.colors.neutral[100],
    },
    policyText: { fontSize: 15, lineHeight: 24, color: theme.colors.neutral[700] },
    introduction: {
        fontSize: 15, lineHeight: 26, color: theme.colors.neutral[600],
        marginBottom: 24, textAlign: 'justify',
    },

    // Sections
    sectionContainer: {
        marginBottom: 20, backgroundColor: theme.colors.neutral[50], padding: 18,
        borderRadius: 14, borderWidth: 1, borderColor: theme.colors.neutral[100],
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    sectionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
    listContainer: { paddingLeft: 4 },
    listItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
    bulletDot: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.neutral[400],
        marginRight: 12, marginTop: 8,
    },
    listItemText: { fontSize: 14, lineHeight: 22, color: theme.colors.neutral[600], flex: 1 },
    text: { fontSize: 14, lineHeight: 22, color: theme.colors.neutral[600] },

    // Note
    noteContainer: {
        backgroundColor: theme.colors.primary[50], padding: 16, borderRadius: 14,
        marginBottom: 20, borderLeftWidth: 4, borderLeftColor: theme.colors.primary[500],
        flexDirection: 'row', alignItems: 'flex-start',
    },
    noteIcon: { fontSize: 20, marginRight: 12, marginTop: 2 },
    noteTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.primary[700], marginBottom: 6 },
    noteText: { fontSize: 13, lineHeight: 20, color: theme.colors.primary[800] },

    // Row items (delivery/refund)
    rowItem: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[100],
    },
    rowLabel: { fontSize: 14, color: theme.colors.neutral[800], fontWeight: '500', flex: 1 },
    rowValue: { fontSize: 14, color: theme.colors.neutral[600], textAlign: 'right', flex: 1 },

    // Method cards
    methodCard: {
        backgroundColor: theme.colors.white, padding: 16, borderRadius: 12,
        marginBottom: 10, borderWidth: 1, borderColor: theme.colors.neutral[200],
    },
    methodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    methodName: { fontSize: 15, fontWeight: '700', color: theme.colors.neutral[900] },
    methodPriceBadge: {
        backgroundColor: theme.colors.primary[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    },
    methodPrice: { fontSize: 14, fontWeight: '700', color: theme.colors.primary[700] },
    methodTime: { fontSize: 13, color: theme.colors.neutral[600], marginBottom: 4 },
    methodDetails: { fontSize: 12, color: theme.colors.neutral[500], lineHeight: 18 },
});

export default PolicyScreen;
