import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';

const SupportScreen = () => {
    const navigation = useNavigation();

    const handleEmail = () => {
        Linking.openURL('mailto:samar@samarsilkpalace.com');
    };

    const handlePhone = () => {
        Linking.openURL('tel:+919305626874');
    };

    const handleWhatsApp = () => {
        Linking.openURL('whatsapp://send?text=Hello&phone=+919305626874');
    };

    const FAQs = [
        {
            question: 'How do I track my order?',
            answer: 'You can track your order status in the "My Orders" section of your profile.',
        },
        {
            question: 'What is the return policy?',
            answer: 'We accept returns within 7 days of delivery for unused items with original tags.',
        },
        {
            question: 'Are the products authentic?',
            answer: 'Yes, all our products are 100% authentic and sourced directly from weavers.',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title="Help & Support" showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Contact Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <View style={styles.contactRow}>
                        <TouchableOpacity style={styles.contactButton} onPress={handlePhone}>
                            <Text style={styles.contactIcon}>📞</Text>
                            <Text style={styles.contactLabel}>Call Us</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                            <Text style={styles.contactIcon}>✉️</Text>
                            <Text style={styles.contactLabel}>Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
                            <Text style={styles.contactIcon}>💬</Text>
                            <Text style={styles.contactLabel}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {FAQs.map((faq, index) => (
                        <View key={index} style={styles.faqItem}>
                            <Text style={styles.question}>{faq.question}</Text>
                            <Text style={styles.answer}>{faq.answer}</Text>
                        </View>
                    ))}
                </View>

                {/* Business Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Store</Text>
                    <Text style={styles.addressName}>Samar Silk Palace</Text>
                    <Text style={styles.addressText}>123, Silk City Road, Varanasi</Text>
                    <Text style={styles.addressText}>Uttar Pradesh, India - 221001</Text>
                    <Text style={[styles.addressText, { marginTop: 8 }]}>Mon - Sat: 10:00 AM - 9:00 PM</Text>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[50],
    },
    content: {
        padding: 16,
        paddingBottom: 30,
    },
    section: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 16,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    contactButton: {
        alignItems: 'center',
        padding: 12,
    },
    contactIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.neutral[700],
    },
    faqItem: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[100],
        paddingBottom: 16,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginBottom: 4,
    },
    answer: {
        fontSize: 14,
        color: theme.colors.neutral[600],
        lineHeight: 20,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: theme.colors.neutral[600],
        lineHeight: 20,
    },
});

export default SupportScreen;
