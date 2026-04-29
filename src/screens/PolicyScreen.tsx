import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar, TouchableOpacity, Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { apiService, ApiPolicy } from '../services/api_service';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const getTypeConfig = (type: string) => {
    switch (type) {
        case 'about_us': return { icon: 'info', color: theme.colors.primary[600], bgColors: [theme.colors.primary[50], theme.colors.primary[100]] as [string, string] };
        case 'privacy': return { icon: 'shield', color: '#4F46E5', bgColors: ['#EEF0F7', '#E0E7FF'] as [string, string] };
        case 'terms': return { icon: 'file-text', color: '#D97706', bgColors: ['#FEF3C7', '#FDE68A'] as [string, string] };
        case 'refund': return { icon: 'refresh-ccw', color: '#059669', bgColors: ['#ECFDF5', '#D1FAE5'] as [string, string] };
        case 'shipping': return { icon: 'truck', color: '#EA580C', bgColors: ['#FFF7ED', '#FFEDD5'] as [string, string] };
        default: return { icon: 'file', color: theme.colors.neutral[600], bgColors: [theme.colors.neutral[50], theme.colors.neutral[100]] as [string, string] };
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
    const metadata = policy?.metadata;

    useEffect(() => { loadPolicy(); }, [type]);

    const loadPolicy = async () => {
        try {
            setLoading(true); setError(null);
            const data = await apiService.getPolicy(type);
            setPolicy(data);
        } catch (err) {
            console.error(`Error loading ${type} policy:`, err);
            setError('Failed to load content. Please check your connection and try again.');
        } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
                <EnhancedHeader title={title} showBackButton={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                    <Text style={styles.loadingText}>Fetching details...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title={title} showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Elegant Hero Section */}
                <LinearGradient colors={config.bgColors} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={[styles.heroIconContainer, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                        <Feather name={config.icon} size={36} color={config.color} />
                    </View>
                    <Text style={styles.heroTitle}>{title}</Text>
                    <View style={styles.heroLine} />
                </LinearGradient>

                {error ? (
                    <View style={styles.errorCard}>
                        <View style={styles.errorIconContainer}>
                            <Feather name="alert-circle" size={32} color={theme.colors.error[500]} />
                        </View>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={loadPolicy} activeOpacity={0.8}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.mainContent}>
                        {metadata && metadata.sections ? (
                            <>
                                {metadata.introduction && (
                                    <View style={styles.introCard}>
                                        <Text style={styles.introduction}>{metadata.introduction}</Text>
                                    </View>
                                )}

                                {/* Standard Sections */}
                                {metadata.sections && metadata.sections.map((section, index) => (
                                    <View key={`section-${index}`} style={styles.sectionCard}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionIconBg, { backgroundColor: config.bgColors[0] }]}>
                                                <Feather name={section.icon || "check-circle"} size={16} color={config.color} />
                                            </View>
                                            <Text style={styles.sectionTitle}>{section.title}</Text>
                                        </View>
                                        
                                        <View style={styles.sectionBody}>
                                            {section.content && (
                                                <Text style={[styles.text, section.items ? { marginBottom: 16 } : undefined]}>
                                                    {section.content}
                                                </Text>
                                            )}
                                            {section.items && section.items.map((item, itemIndex) => (
                                                <View key={itemIndex} style={styles.listItem}>
                                                    <View style={[styles.bulletDot, { backgroundColor: config.color }]} />
                                                    <Text style={styles.listItemText}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}

                                {/* Important Note (e.g. for Shipping) */}
                                {metadata.note && (
                                    <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.noteContainer}>
                                        <View style={styles.noteHeader}>
                                            <Feather name="info" size={20} color={theme.colors.primary[700]} style={styles.noteIcon} />
                                            <Text style={styles.noteTitle}>Important Note</Text>
                                        </View>
                                        <Text style={styles.noteText}>{metadata.note}</Text>
                                    </LinearGradient>
                                )}

                                {/* Tracking Info */}
                                {metadata.tracking && (
                                    <View style={styles.sectionCard}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionIconBg, { backgroundColor: config.bgColors[0] }]}>
                                                <Feather name="map-pin" size={16} color={config.color} />
                                            </View>
                                            <Text style={styles.sectionTitle}>{metadata.tracking.title}</Text>
                                        </View>
                                        <View style={styles.sectionBody}>
                                            <Text style={styles.text}>{metadata.tracking.content}</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Delivery Areas */}
                                {metadata.delivery_areas && metadata.delivery_areas.length > 0 && (
                                    <View style={styles.sectionCard}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionIconBg, { backgroundColor: config.bgColors[0] }]}>
                                                <Feather name="globe" size={16} color={config.color} />
                                            </View>
                                            <Text style={styles.sectionTitle}>Delivery Areas & Timelines</Text>
                                        </View>
                                        <View style={styles.tableContainer}>
                                            {metadata.delivery_areas.map((area, index, arr) => (
                                                <View key={`area-${index}`} style={[styles.rowItem, index === arr.length - 1 && styles.lastRow]}>
                                                    <View style={styles.rowLabelContainer}>
                                                        <Feather name="map" size={14} color={theme.colors.neutral[400]} style={{ marginRight: 8 }} />
                                                        <Text style={styles.rowLabel}>{area.area}</Text>
                                                    </View>
                                                    <Text style={styles.rowValue}>{area.time}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Shipping Methods */}
                                {metadata.shipping_methods && metadata.shipping_methods.length > 0 && (
                                    <View style={styles.sectionCard}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionIconBg, { backgroundColor: config.bgColors[0] }]}>
                                                <Feather name="package" size={16} color={config.color} />
                                            </View>
                                            <Text style={styles.sectionTitle}>Shipping Methods</Text>
                                        </View>
                                        <View style={styles.sectionBody}>
                                            {metadata.shipping_methods.map((method, index) => (
                                                <View key={`method-${index}`} style={styles.methodCard}>
                                                    <View style={styles.methodHeader}>
                                                        <Text style={styles.methodName}>{method.name}</Text>
                                                        <View style={[styles.methodPriceBadge, { backgroundColor: config.bgColors[0] }]}>
                                                            <Text style={[styles.methodPrice, { color: config.color }]}>{method.price}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.methodDetailRow}>
                                                        <Feather name="clock" size={12} color={theme.colors.neutral[500]} />
                                                        <Text style={styles.methodTime}>{method.time}</Text>
                                                    </View>
                                                    <Text style={styles.methodDetails}>{method.details}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Refund Timelines */}
                                {metadata.refund_timelines && metadata.refund_timelines.length > 0 && (
                                    <View style={styles.sectionCard}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionIconBg, { backgroundColor: config.bgColors[0] }]}>
                                                <Feather name="clock" size={16} color={config.color} />
                                            </View>
                                            <Text style={styles.sectionTitle}>Refund Timelines</Text>
                                        </View>
                                        <View style={styles.tableContainer}>
                                            {metadata.refund_timelines.map((timeline: any, index: number, arr: any[]) => (
                                                <View key={`timeline-${index}`} style={[styles.rowItem, index === arr.length - 1 && styles.lastRow]}>
                                                    <View style={styles.rowLabelContainer}>
                                                        <Feather name="credit-card" size={14} color={theme.colors.neutral[400]} style={{ marginRight: 8 }} />
                                                        <Text style={styles.rowLabel}>{timeline.method || timeline.area}</Text>
                                                    </View>
                                                    <Text style={styles.rowValue}>{timeline.time}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.fallbackCard}>
                                <Text style={styles.policyText}>
                                    {policy?.content?.replace(/<[^>]*>?/gm, '\n').replace(/&nbsp;/g, ' ') || 'No content available.'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
                
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, color: theme.colors.neutral[500], fontSize: 14, fontWeight: '500', letterSpacing: 0.5 },
    content: { padding: 20 },
    bottomSpacer: { height: 40 },

    // Hero Section
    heroCard: {
        alignItems: 'center',
        borderRadius: 24,
        paddingVertical: 32,
        paddingHorizontal: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 2,
    },
    heroIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },
    heroTitle: { 
        fontSize: 26, 
        fontWeight: '800', 
        color: theme.colors.neutral[900], 
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    heroLine: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
        marginTop: 16,
    },

    // Error State
    errorCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        shadowColor: theme.colors.error[200],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.error[50],
    },
    errorIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.error[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    errorText: { color: theme.colors.error[700], fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    retryBtn: {
        backgroundColor: theme.colors.error[600],
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: theme.colors.error[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    retryText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

    // Main Content
    mainContent: {
        gap: 20,
    },
    introCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    introduction: {
        fontSize: 16,
        lineHeight: 26,
        color: theme.colors.neutral[700],
        textAlign: 'justify',
        letterSpacing: 0.2,
    },

    // Section Cards
    sectionCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
        overflow: 'hidden',
    },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[50],
        backgroundColor: '#FAFAFA',
    },
    sectionIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: { 
        fontSize: 17, 
        fontWeight: '700', 
        color: theme.colors.neutral[900],
        letterSpacing: 0.3 
    },
    sectionBody: {
        padding: 20,
    },
    text: { 
        fontSize: 15, 
        lineHeight: 24, 
        color: theme.colors.neutral[600] 
    },
    
    // Lists
    listItem: { 
        flexDirection: 'row', 
        marginBottom: 12, 
        alignItems: 'flex-start' 
    },
    bulletDot: {
        width: 6, 
        height: 6, 
        borderRadius: 3, 
        marginRight: 12, 
        marginTop: 9,
    },
    listItemText: { 
        fontSize: 15, 
        lineHeight: 24, 
        color: theme.colors.neutral[700], 
        flex: 1 
    },

    // Important Note Banner
    noteContainer: {
        padding: 20, 
        borderRadius: 20,
        shadowColor: theme.colors.primary[200],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 2,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteIcon: { marginRight: 8 },
    noteTitle: { 
        fontSize: 16, 
        fontWeight: '700', 
        color: theme.colors.primary[800],
    },
    noteText: { 
        fontSize: 14, 
        lineHeight: 22, 
        color: theme.colors.primary[900],
        opacity: 0.9,
    },

    // Tables / Rows
    tableContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    rowItem: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1, 
        borderBottomColor: theme.colors.neutral[100],
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    rowLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rowLabel: { 
        fontSize: 15, 
        color: theme.colors.neutral[800], 
        fontWeight: '600'
    },
    rowValue: { 
        fontSize: 14, 
        color: theme.colors.neutral[500], 
        textAlign: 'right', 
        flex: 1,
        fontWeight: '500'
    },

    // Method Cards
    methodCard: {
        backgroundColor: '#FAFAFA', 
        padding: 16, 
        borderRadius: 16,
        marginBottom: 12, 
        borderWidth: 1, 
        borderColor: theme.colors.neutral[100],
    },
    methodHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 6 
    },
    methodName: { 
        fontSize: 16, 
        fontWeight: '700', 
        color: theme.colors.neutral[900] 
    },
    methodPriceBadge: {
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8,
    },
    methodPrice: { 
        fontSize: 14, 
        fontWeight: '700', 
    },
    methodDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    methodTime: { 
        fontSize: 13, 
        color: theme.colors.neutral[500], 
        marginLeft: 6,
        fontWeight: '500'
    },
    methodDetails: { 
        fontSize: 14, 
        color: theme.colors.neutral[600], 
        lineHeight: 20 
    },

    // Fallback Card
    fallbackCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
    },
    policyText: { 
        fontSize: 15, 
        lineHeight: 26, 
        color: theme.colors.neutral[700] 
    },
});

export default PolicyScreen;
