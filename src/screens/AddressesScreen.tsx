import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme';
import EnhancedHeader from '../components/EnhancedHeader';
import { apiService, ApiAddress } from '../services/api_service';
import AddAddressModal from '../components/AddAddressModal';
import { useUserProfile } from '../contexts/UserProfileContext';
import SafeAlert from '../utils/safeAlert';

const AddressesScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { refreshUserData } = useUserProfile();
    const [addresses, setAddresses] = useState<ApiAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);

    const fetchAddresses = async () => {
        try {
            const data = await apiService.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            SafeAlert.show('Error', 'Failed to load addresses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchAddresses(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchAddresses(); };
    const handleAddAddress = () => { setSelectedAddress(null); setModalVisible(true); };
    const handleEditAddress = (address: ApiAddress) => { setSelectedAddress(address); setModalVisible(true); };

    const handleDeleteAddress = (id: number) => {
        SafeAlert.show('Delete Address', 'Are you sure you want to delete this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        setLoading(true);
                        await apiService.deleteAddress(id);
                        await fetchAddresses();
                        await refreshUserData();
                        SafeAlert.show('Success', 'Address deleted successfully');
                    } catch (error) {
                        SafeAlert.show('Error', 'Failed to delete address');
                    } finally { setLoading(false); }
                },
            },
        ]);
    };

    const handleModalSuccess = async () => { setLoading(true); await fetchAddresses(); await refreshUserData(); };

    const getTypeIcon = (type?: string) => {
        switch ((type || '').toLowerCase()) {
            case 'office': case 'work': return '🏢';
            case 'other': return '📍';
            default: return '🏠';
        }
    };

    const renderAddressItem = (address: ApiAddress) => (
        <View key={address.id} style={[styles.addressCard, address.isDefault && styles.defaultCard]}>
            <View style={styles.addressHeader}>
                <View style={styles.typeRow}>
                    <View style={styles.typeIconBg}>
                        <Text style={styles.typeIcon}>{getTypeIcon(address.type || address.address_type)}</Text>
                    </View>
                    <View>
                        <Text style={styles.typeLabel}>{address.type || address.address_type || 'Home'}</Text>
                        {address.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>✓ DEFAULT</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.addressBody}>
                <Text style={styles.name}>{address.name || address.full_name}</Text>
                <Text style={styles.addressText}>{address.address || address.address_line1}</Text>
                {address.address_line2 ? <Text style={styles.addressText}>{address.address_line2}</Text> : null}
                <Text style={styles.addressText}>
                    {address.city}, {address.state} - {address.postal || address.postal_code}
                </Text>
                <View style={styles.phoneRow}>
                    <Text style={styles.phoneIcon}>📱</Text>
                    <Text style={styles.phoneText}>{address.phone}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEditAddress(address)} activeOpacity={0.7}>
                    <Text style={styles.editBtnIcon}>✏️</Text>
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteAddress(address.id)} activeOpacity={0.7}>
                    <Text style={styles.deleteBtnIcon}>🗑️</Text>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title="My Addresses" showBackButton={true} onBackPress={() => navigation.goBack()} />

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary[600]]} />}
                >
                    {/* Count Header */}
                    {addresses.length > 0 && (
                        <View style={styles.countHeader}>
                            <Text style={styles.countText}>{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</Text>
                        </View>
                    )}

                    {addresses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>📍</Text>
                            <Text style={styles.emptyTitle}>No addresses yet</Text>
                            <Text style={styles.emptySubtext}>Add a delivery address to get started with your orders</Text>
                        </View>
                    ) : (
                        addresses.map(renderAddressItem)
                    )}
                </ScrollView>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress} activeOpacity={0.8}>
                <Text style={styles.addButtonIcon}>➕</Text>
                <Text style={styles.addButtonText}>Add New Address</Text>
            </TouchableOpacity>

            <AddAddressModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleModalSuccess}
                editAddress={selectedAddress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: theme.colors.neutral[500], fontSize: 14 },
    scrollContent: { padding: 16, paddingBottom: 100 },
    countHeader: { marginBottom: 12 },
    countText: { fontSize: 13, fontWeight: '600', color: theme.colors.neutral[400], textTransform: 'uppercase', letterSpacing: 0.8 },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 8 },
    emptySubtext: { fontSize: 15, color: theme.colors.neutral[500], textAlign: 'center', lineHeight: 22 },
    addressCard: {
        backgroundColor: theme.colors.white, borderRadius: 16, marginBottom: 14, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
        shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.colors.neutral[100],
    },
    defaultCard: { borderColor: theme.colors.primary[200], borderWidth: 1.5 },
    addressHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
    typeRow: { flexDirection: 'row', alignItems: 'center' },
    typeIconBg: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.neutral[50],
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    typeIcon: { fontSize: 18 },
    typeLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.neutral[800], textTransform: 'uppercase', letterSpacing: 0.5 },
    defaultBadge: {
        backgroundColor: theme.colors.primary[50], paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 4, marginTop: 3,
    },
    defaultBadgeText: { fontSize: 10, fontWeight: '700', color: theme.colors.primary[600], letterSpacing: 0.5 },
    addressBody: { paddingHorizontal: 20, paddingBottom: 16, borderTopWidth: 1, borderTopColor: theme.colors.neutral[50], paddingTop: 12 },
    name: { fontSize: 16, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 6 },
    addressText: { fontSize: 14, color: theme.colors.neutral[600], marginBottom: 2, lineHeight: 20 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    phoneIcon: { fontSize: 14, marginRight: 6 },
    phoneText: { fontSize: 14, color: theme.colors.neutral[800], fontWeight: '500' },
    actions: {
        flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
    },
    editBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
    },
    editBtnIcon: { fontSize: 14, marginRight: 6 },
    editBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary[600] },
    actionDivider: { width: 1, backgroundColor: theme.colors.neutral[100] },
    deleteBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
    },
    deleteBtnIcon: { fontSize: 14, marginRight: 6 },
    deleteBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.error[600] },
    addButton: {
        position: 'absolute', bottom: 24, left: 16, right: 16,
        backgroundColor: theme.colors.primary[600], padding: 16, borderRadius: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: theme.colors.primary[600], shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    addButtonIcon: { fontSize: 16, marginRight: 8 },
    addButtonText: { fontSize: 16, fontWeight: '700', color: theme.colors.white, letterSpacing: 0.3 },
});

export default AddressesScreen;
