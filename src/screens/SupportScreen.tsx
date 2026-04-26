import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';

const SupportScreen = () => {
    const navigation = useNavigation();

    const handleEmail = () => Linking.openURL('mailto:samar@samarsilkpalace.com');
    const handlePhone = () => Linking.openURL('tel:+919305626874');
    const handleWhatsApp = () => Linking.openURL('whatsapp://send?text=Hello&phone=+919305626874');

    const FAQs = [
        { question: 'How do I track my order?', answer: 'You can track your order status in the "My Orders" section of your profile.', icon: '📦' },
        { question: 'What is the return policy?', answer: 'We accept returns within 7 days of delivery for unused items with original tags.', icon: '🔄' },
        { question: 'Are the products authentic?', answer: 'Yes, all our products are 100% authentic and sourced directly from weavers.', icon: '✅' },
        { question: 'How long does delivery take?', answer: 'Standard delivery takes 5-7 business days. Express delivery is available for metro cities.', icon: '🚚' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title="Help & Support" showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Contact Hero */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroEmoji}>🤝</Text>
                    <Text style={styles.heroTitle}>How can we help?</Text>
                    <Text style={styles.heroSubtitle}>Our team is ready to assist you</Text>
                </View>

                {/* Contact Options */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>💬</Text>
                        <Text style={styles.cardTitle}>Get in Touch</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <TouchableOpacity style={styles.contactButton} onPress={handlePhone} activeOpacity={0.7}>
                            <View style={[styles.contactIconBg, { backgroundColor: '#EEF7EE' }]}>
                                <Text style={styles.contactIcon}>📞</Text>
                            </View>
                            <Text style={styles.contactLabel}>Call Us</Text>
                            <Text style={styles.contactValue}>Available 10am-8pm</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButton} onPress={handleEmail} activeOpacity={0.7}>
                            <View style={[styles.contactIconBg, { backgroundColor: '#EEF0F7' }]}>
                                <Text style={styles.contactIcon}>✉️</Text>
                            </View>
                            <Text style={styles.contactLabel}>Email</Text>
                            <Text style={styles.contactValue}>24hr response</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp} activeOpacity={0.7}>
                            <View style={[styles.contactIconBg, { backgroundColor: '#EEF7F0' }]}>
                                <Text style={styles.contactIcon}>💬</Text>
                            </View>
                            <Text style={styles.contactLabel}>WhatsApp</Text>
                            <Text style={styles.contactValue}>Instant chat</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQs */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>❓</Text>
                        <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
                    </View>
                    {FAQs.map((faq, index) => (
                        <View key={index} style={[styles.faqItem, index === FAQs.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.faqHeader}>
                                <View style={styles.faqIconBg}>
                                    <Text style={styles.faqIcon}>{faq.icon}</Text>
                                </View>
                                <Text style={styles.question}>{faq.question}</Text>
                            </View>
                            <Text style={styles.answer}>{faq.answer}</Text>
                        </View>
                    ))}
                </View>

                {/* Store Info */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>🏪</Text>
                        <Text style={styles.cardTitle}>Visit Our Store</Text>
                    </View>
                    <View style={styles.storeInfo}>
                        <Text style={styles.storeName}>Samar Silk Palace</Text>
                        <View style={styles.storeRow}>
                            <Text style={styles.storeIcon}>📍</Text>
                            <Text style={styles.storeText}>CK 10/44, Brahmanand Chauraha, Chowk, Varanasi - 221001</Text>
                        </View>
                        <View style={styles.storeRow}>
                            <Text style={styles.storeIcon}>🕐</Text>
                            <Text style={styles.storeText}>Mon - Sat: 10:30 AM - 8:30 PM</Text>
                        </View>
                        <View style={styles.storeRow}>
                            <Text style={styles.storeIcon}>📱</Text>
                            <Text style={styles.storeText}>+91 93056 26874</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
    content: { padding: 16, paddingBottom: 40 },
    heroCard: {
        alignItems: 'center', backgroundColor: theme.colors.primary[50], borderRadius: 16,
        paddingVertical: 28, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.primary[100],
    },
    heroEmoji: { fontSize: 40, marginBottom: 12 },
    heroTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.primary[800], marginBottom: 4 },
    heroSubtitle: { fontSize: 14, color: theme.colors.primary[600] },
    card: {
        backgroundColor: theme.colors.white, borderRadius: 16, marginBottom: 16, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
        shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.colors.neutral[100],
    },
    cardHeader: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
        borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[100],
    },
    cardIcon: { fontSize: 18, marginRight: 10 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.neutral[800], letterSpacing: 0.3 },
    contactRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 8 },
    contactButton: { alignItems: 'center', flex: 1, paddingHorizontal: 4 },
    contactIconBg: {
        width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    contactIcon: { fontSize: 24 },
    contactLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.neutral[800], marginBottom: 2 },
    contactValue: { fontSize: 11, color: theme.colors.neutral[500] },
    faqItem: {
        paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[50],
    },
    faqHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    faqIconBg: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.neutral[50],
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    faqIcon: { fontSize: 14 },
    question: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.neutral[900] },
    answer: { fontSize: 14, color: theme.colors.neutral[600], lineHeight: 21, paddingLeft: 44 },
    storeInfo: { padding: 20 },
    storeName: { fontSize: 18, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 14 },
    storeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    storeIcon: { fontSize: 16, marginRight: 10, marginTop: 1 },
    storeText: { flex: 1, fontSize: 14, color: theme.colors.neutral[600], lineHeight: 20 },
});

export default SupportScreen;
