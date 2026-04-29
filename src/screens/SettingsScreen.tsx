import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, StatusBar, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import SafeAlert from '../utils/safeAlert';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

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
        { title: 'Privacy Policy', icon: 'shield', type: 'privacy', navTitle: 'Privacy Policy', colors: ['#FDF2F8', '#FCE7F3'], iconColor: theme.colors.primary[600] },
        { title: 'Terms of Service', icon: 'file-text', type: 'terms', navTitle: 'Terms of Service', colors: ['#FEF3C7', '#FDE68A'], iconColor: '#D97706' },
        { title: 'Refund Policy', icon: 'refresh-ccw', type: 'refund', navTitle: 'Refund Policy', colors: ['#ECFDF5', '#D1FAE5'], iconColor: '#059669' },
        { title: 'Shipping Policy', icon: 'truck', type: 'shipping', navTitle: 'Shipping Policy', colors: ['#FFF7ED', '#FFEDD5'], iconColor: '#EA580C' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF5F5" />
            <LinearGradient colors={['#FFF5F5', '#F8F9FA']} style={StyleSheet.absoluteFillObject} />
            
            <EnhancedHeader title="Settings" showBackButton={true} onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile / Greeting Card (Optional beautiful addition) */}
                <LinearGradient 
                    colors={[theme.colors.primary[50], '#FFF']} 
                    style={styles.greetingCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.greetingIconContainer}>
                        <Icon name="settings" size={24} color={theme.colors.primary[600]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greetingTitle}>App Preferences</Text>
                        <Text style={styles.greetingSubtitle}>Customize your Samar Silk Palace experience</Text>
                    </View>
                </LinearGradient>

                {/* Notifications Section */}
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <LinearGradient colors={['#F3E8FF', '#E9D5FF']} style={styles.linkIconBg}>
                            <Icon name="bell" size={20} color="#7E22CE" />
                        </LinearGradient>
                        <View style={styles.rowInfo}>
                            <Text style={styles.rowTitle}>Push Notifications</Text>
                            <Text style={styles.rowSubtitle}>Order updates & offers</Text>
                        </View>
                        <Switch
                            trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[500] }}
                            thumbColor={theme.colors.white}
                            ios_backgroundColor={theme.colors.neutral[200]}
                            onValueChange={() => setPushEnabled(prev => !prev)}
                            value={pushEnabled}
                            style={styles.switchStyle}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={[styles.row, styles.lastRow]}>
                        <LinearGradient colors={['#E0F2FE', '#BAE6FD']} style={styles.linkIconBg}>
                            <Icon name="mail" size={20} color="#0369A1" />
                        </LinearGradient>
                        <View style={styles.rowInfo}>
                            <Text style={styles.rowTitle}>Email Notifications</Text>
                            <Text style={styles.rowSubtitle}>Invoices & newsletters</Text>
                        </View>
                        <Switch
                            trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[500] }}
                            thumbColor={theme.colors.white}
                            ios_backgroundColor={theme.colors.neutral[200]}
                            onValueChange={() => setEmailEnabled(prev => !prev)}
                            value={emailEnabled}
                            style={styles.switchStyle}
                        />
                    </View>
                </View>

                {/* Legal & Privacy */}
                <Text style={styles.sectionTitle}>Legal & Privacy</Text>
                <View style={styles.card}>
                    {policyItems.map((item, index) => (
                        <React.Fragment key={item.type}>
                            <TouchableOpacity
                                style={[styles.linkRow, index === policyItems.length - 1 && styles.lastRow]}
                                onPress={() => navigation.navigate('Policy', { type: item.type, title: item.navTitle })}
                                activeOpacity={0.7}
                            >
                                <LinearGradient colors={item.colors} style={styles.linkIconBg}>
                                    <Icon name={item.icon} size={20} color={item.iconColor} />
                                </LinearGradient>
                                <Text style={styles.linkText}>{item.title}</Text>
                                <Icon name="chevron-right" size={20} color={theme.colors.neutral[300]} style={styles.arrowIcon} />
                            </TouchableOpacity>
                            {index !== policyItems.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </View>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.linkRow}
                        onPress={() => SafeAlert.show('Change Password', 'This feature is coming soon!')}
                        activeOpacity={0.7}
                    >
                        <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.linkIconBg}>
                            <Icon name="key" size={20} color="#B91C1C" />
                        </LinearGradient>
                        <Text style={styles.linkText}>Change Password</Text>
                        <Icon name="chevron-right" size={20} color={theme.colors.neutral[300]} style={styles.arrowIcon} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={[styles.linkRow, styles.lastRow]}
                        onPress={() => navigation.navigate('Policy' as any, { type: 'about_us', title: 'About Us' })}
                        activeOpacity={0.7}
                    >
                        <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.linkIconBg}>
                            <Icon name="info" size={20} color="#15803D" />
                        </LinearGradient>
                        <Text style={styles.linkText}>About Us</Text>
                        <Icon name="chevron-right" size={20} color={theme.colors.neutral[300]} style={styles.arrowIcon} />
                    </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <Text style={[styles.sectionTitle, { color: theme.colors.error[600] }]}>Danger Zone</Text>
                <View style={[styles.card, { borderColor: theme.colors.error[200], backgroundColor: '#FEF2F2', borderWidth: 1 }]}>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.7}>
                        <View style={[styles.linkIconBg, { backgroundColor: theme.colors.error[100] }]}>
                            <Icon name="trash-2" size={20} color={theme.colors.error[600]} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.deleteText}>Delete Account</Text>
                            <Text style={styles.deleteSubtext}>Permanently delete your account and data</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={theme.colors.error[400]} style={styles.arrowIcon} />
                    </TouchableOpacity>
                </View>

                {/* Log Out */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                        style={styles.logoutGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Icon name="log-out" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                        <Text style={styles.logoutButtonText}>Log Out</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Icon name="heart" size={20} color={theme.colors.primary[500]} />
                    </View>
                    <Text style={styles.versionText}>App Version 1.0.0</Text>
                    <Text style={styles.madeWithLove}>Crafted with elegance for Samar Silk Palace</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    content: { padding: 20, paddingBottom: 50 },
    
    greetingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 32, 0.05)',
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    greetingIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    greetingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary[900],
        marginBottom: 4,
    },
    greetingSubtitle: {
        fontSize: 13,
        color: theme.colors.primary[600],
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginTop: 24,
        marginBottom: 10,
        marginLeft: 12,
    },
    
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
        overflow: 'hidden',
    },
    
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    
    lastRow: {
        borderBottomWidth: 0,
    },
    
    divider: {
        height: 1,
        backgroundColor: theme.colors.neutral[100],
        marginLeft: 68, // Aligns with text
        marginRight: 16,
    },

    linkIconBg: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    
    rowInfo: {
        flex: 1,
        marginRight: 16,
        justifyContent: 'center',
    },
    
    rowTitle: {
        fontSize: 16,
        color: theme.colors.neutral[900],
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    
    rowSubtitle: {
        fontSize: 13,
        color: theme.colors.neutral[500],
        marginTop: 4,
    },
    
    linkText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.neutral[900],
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    
    arrowIcon: {
        opacity: 0.5,
    },
    
    switchStyle: {
        transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }],
    },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    
    deleteText: {
        color: theme.colors.error[700],
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.2,
    },
    
    deleteSubtext: {
        color: theme.colors.error[500],
        fontSize: 13,
        marginTop: 4,
    },
    
    logoutButton: {
        marginTop: 30,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    logoutButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    footerContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    
    logoPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FDF2F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    
    versionText: {
        color: theme.colors.neutral[700],
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    
    madeWithLove: {
        color: theme.colors.neutral[400],
        fontSize: 12,
    },
});

export default SettingsScreen;
