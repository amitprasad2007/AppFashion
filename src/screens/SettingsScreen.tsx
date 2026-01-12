import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { logout } = useAuth();

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);

    const toggleSwitch = () => setPushEnabled(previousState => !previousState);
    const toggleEmail = () => setEmailEnabled(previousState => !previousState);

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => Alert.alert('Request Sent', 'Your account deletion request has been submitted.')
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title="Settings" showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.rowTitle}>Push Notifications</Text>
                            <Text style={styles.rowSubtitle}>Receive updates on your orders and offers</Text>
                        </View>
                        <Switch
                            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] }}
                            thumbColor={pushEnabled ? theme.colors.primary[50] : '#f4f3f4'}
                            onValueChange={toggleSwitch}
                            value={pushEnabled}
                        />
                    </View>

                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <View>
                            <Text style={styles.rowTitle}>Email Notifications</Text>
                            <Text style={styles.rowSubtitle}>Receive invoices and newsletters</Text>
                        </View>
                        <Switch
                            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] }}
                            thumbColor={emailEnabled ? theme.colors.primary[50] : '#f4f3f4'}
                            onValueChange={toggleEmail}
                            value={emailEnabled}
                        />
                    </View>
                </View>

                {/* Legal */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal & Privacy</Text>

                    <TouchableOpacity style={styles.linkRow}>
                        <Text style={styles.linkText}>Privacy Policy</Text>
                        <Text style={styles.arrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkRow}>
                        <Text style={styles.linkText}>Terms of Service</Text>
                        <Text style={styles.arrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkRow}>
                        <Text style={styles.linkText}>Refund Policy</Text>
                        <Text style={styles.arrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Change Password', 'This feature is coming soon!')}>
                        <Text style={styles.linkText}>Change Password</Text>
                        <Text style={styles.arrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionText}>App Version 1.0.0</Text>

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
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        padding: 16,
        paddingBottom: 8,
        backgroundColor: theme.colors.neutral[50],
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[100],
    },
    rowTitle: {
        fontSize: 16,
        color: theme.colors.neutral[900],
        fontWeight: '500',
    },
    rowSubtitle: {
        fontSize: 12,
        color: theme.colors.neutral[500],
        marginTop: 2,
        maxWidth: 200,
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[100],
    },
    linkText: {
        fontSize: 16,
        color: theme.colors.neutral[900],
    },
    arrow: {
        fontSize: 18,
        color: theme.colors.neutral[400],
    },
    deleteButton: {
        padding: 16,
        alignItems: 'center',
    },
    deleteText: {
        color: theme.colors.error[600],
        fontWeight: '600',
        fontSize: 16,
    },
    versionText: {
        textAlign: 'center',
        color: theme.colors.neutral[400],
        marginTop: 16,
        fontSize: 12,
    },
});

export default SettingsScreen;
