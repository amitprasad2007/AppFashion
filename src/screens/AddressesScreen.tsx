import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme';
import EnhancedHeader from '../components/EnhancedHeader';
import { apiService, ApiAddress } from '../services/api';
import AddAddressModal from '../components/AddAddressModal';
import { useUserProfile } from '../contexts/UserProfileContext';

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
            Alert.alert('Error', 'Failed to load addresses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAddresses();
    };

    const handleAddAddress = () => {
        setSelectedAddress(null);
        setModalVisible(true);
    };

    const handleEditAddress = (address: ApiAddress) => {
        setSelectedAddress(address);
        setModalVisible(true);
    };

    const handleDeleteAddress = (id: number) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await apiService.deleteAddress(id);
                            await fetchAddresses();
                            await refreshUserData(); // Sync profile context
                            Alert.alert('Success', 'Address deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete address');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleModalSuccess = async () => {
        setLoading(true);
        await fetchAddresses();
        await refreshUserData();
    };

    const renderAddressItem = (address: ApiAddress) => (
        <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{address.type || address.address_type || 'Home'}</Text>
                </View>
                {address.isDefault && (
                    <View style={styles.defaultTag}>
                        <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                )}
            </View>

            <Text style={styles.name}>{address.name || address.full_name}</Text>
            <Text style={styles.addressText}>{address.address || address.address_line1}</Text>
            {address.address_line2 ? <Text style={styles.addressText}>{address.address_line2}</Text> : null}
            <Text style={styles.addressText}>
                {address.city}, {address.state} - {address.postal || address.postal_code}
            </Text>
            <Text style={styles.phoneText}>Phone: {address.phone}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditAddress(address)}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteAddress(address.id)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title="My Addresses" showBackButton={true} onBackPress={() => navigation.goBack()}/>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary[600]]} />
                    }
                >
                    {addresses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No addresses found</Text>
                            <Text style={styles.emptySubtext}>Add a new address to get started</Text>
                        </View>
                    ) : (
                        addresses.map(renderAddressItem)
                    )}
                </ScrollView>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                <Text style={styles.addButtonText}>+ Add New Address</Text>
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
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[50],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.neutral[900],
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.neutral[500],
    },
    addressCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: theme.colors.neutral[100],
        borderRadius: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.neutral[700],
        textTransform: 'uppercase',
    },
    defaultTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: theme.colors.primary[50],
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary[600],
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.neutral[900],
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: theme.colors.neutral[600],
        marginBottom: 2,
        lineHeight: 20,
    },
    phoneText: {
        fontSize: 14,
        color: theme.colors.neutral[800],
        marginTop: 8,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[100],
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary[600],
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.error[600],
    },
    addButton: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: theme.colors.primary[600],
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: theme.colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.white,
    },
});

export default AddressesScreen;
