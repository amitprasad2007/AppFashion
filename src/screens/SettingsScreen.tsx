import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import SafeAlert from '../utils/safeAlert';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { logout } = useAuth();

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);

    const handleDeleteAccount = () => {
        SafeAlert.show(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => SafeAlert.show('Request Sent', 'Your account deletion request has been submitted.')
                }
            ]
        );
    };

    const policyItems = [
        { title: 'Privacy Policy', icon: '🔒', type: 'privacy', navTitle: 'Privacy Policy' },
        { title: 'Terms of Service', icon: '📋', type: 'terms', navTitle: 'Terms of Service' },
        { title: 'Refund Policy', icon: '💸', type: 'refund', navTitle: 'Refund Policy' },
        { title: 'Shipping Policy', icon: '🚚', type: 'shipping', navTitle: 'Shipping Policy' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title="Settings" showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Notifications Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>🔔</Text>
                        <Text style={styles.cardTitle}>Notifications</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowInfo}>
                            <Text style={styles.rowTitle}>Push Notifications</Text>
                            <Text style={styles.rowSubtitle}>Order updates & offers</Text>
                        </View>
                        <Switch
                            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[400] }}
                            thumbColor={pushEnabled ? theme.colors.white : '#f4f3f4'}
                            onValueChange={() => setPushEnabled(prev => !prev)}
                            value={pushEnabled}
                        />
                    </View>

                    <View style={[styles.row, styles.lastRow]}>
                        <View style={styles.rowInfo}>
                            <Text style={styles.rowTitle}>Email Notifications</Text>
                            <Text style={styles.rowSubtitle}>Invoices & newsletters</Text>
                        </View>
                        <Switch
                            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[400] }}
                            thumbColor={emailEnabled ? theme.colors.white : '#f4f3f4'}
                            onValueChange={() => setEmailEnabled(prev => !prev)}
                            value={emailEnabled}
                        />
                    </View>
                </View>

                {/* Legal & Privacy */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>⚖️</Text>
                        <Text style={styles.cardTitle}>Legal & Privacy</Text>
                    </View>
                    {policyItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.type}
                            style={[styles.linkRow, index === policyItems.length - 1 && styles.lastRow]}
                            onPress={() => navigation.navigate('Policy', { type: item.type, title: item.navTitle })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.linkIconBg}>
                                <Text style={styles.linkIcon}>{item.icon}</Text>
                            </View>
                            <Text style={styles.linkText}>{item.title}</Text>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Account Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>👤</Text>
                        <Text style={styles.cardTitle}>Account</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.linkRow}
                        onPress={() => SafeAlert.show('Change Password', 'This feature is coming soon!')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.linkIconBg}>
                            <Text style={styles.linkIcon}>🔑</Text>
                        </View>
                        <Text style={styles.linkText}>Change Password</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.linkRow, styles.lastRow]}
                        onPress={() => navigation.navigate('Policy' as any, { type: 'about_us', title: 'About Us' })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.linkIconBg}>
                            <Text style={styles.linkIcon}>ℹ️</Text>
                        </View>
                        <Text style={styles.linkText}>About Us</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <View style={styles.dangerCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>⚠️</Text>
                        <Text style={[styles.cardTitle, { color: theme.colors.error[700] }]}>Danger Zone</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.7}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.deleteText}>Delete Account</Text>
                            <Text style={styles.deleteSubtext}>Permanently delete your account and data</Text>
                        </View>
                        <Text style={[styles.arrow, { color: theme.colors.error[400] }]}>›</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionText}>App Version 1.0.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
    content: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: theme.colors.white, borderRadius: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
        shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.colors.neutral[100],
        overflow: 'hidden',
    },
    dangerCard: {
        backgroundColor: theme.colors.white, borderRadius: 16, marginBottom: 16,
        borderWidth: 1, borderColor: theme.colors.error[100], overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
        borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[100],
    },
    cardIcon: { fontSize: 18, marginRight: 10 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.neutral[800], letterSpacing: 0.3 },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[50],
    },
    lastRow: { borderBottomWidth: 0 },
    rowInfo: { flex: 1, marginRight: 16 },
    rowTitle: { fontSize: 15, color: theme.colors.neutral[900], fontWeight: '600' },
    rowSubtitle: { fontSize: 12, color: theme.colors.neutral[500], marginTop: 2 },
    linkRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[50],
    },
    linkIconBg: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.neutral[50],
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    linkIcon: { fontSize: 16 },
    linkText: { flex: 1, fontSize: 15, color: theme.colors.neutral[900], fontWeight: '500' },
    arrow: { fontSize: 24, color: theme.colors.neutral[300], fontWeight: '300' },
    deleteButton: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    },
    deleteIcon: { fontSize: 20, marginRight: 14 },
    deleteText: { color: theme.colors.error[600], fontWeight: '600', fontSize: 15 },
    deleteSubtext: { color: theme.colors.error[400], fontSize: 12, marginTop: 2 },
    versionText: { textAlign: 'center', color: theme.colors.neutral[400], marginTop: 16, fontSize: 12 },
});

export default SettingsScreen;
