import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { theme } from '../theme';
import { apiService, AddressInput, ApiAddress } from '../services/api';

interface AddAddressModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editAddress?: ApiAddress | null;
}

const AddAddressModal: React.FC<AddAddressModalProps> = ({
    visible,
    onClose,
    onSuccess,
    editAddress,
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<AddressInput>({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: '',
        address_type: 'home',
        is_default: false,
    });

    useEffect(() => {
        if (visible) {
            if (editAddress) {
                setFormData({
                    full_name: editAddress.name || editAddress.full_name || '',
                    phone: editAddress.phone || '',
                    address_line1: editAddress.address || editAddress.address_line1 || '',
                    address_line2: editAddress.address_line2 || '',
                    city: editAddress.city || '',
                    state: editAddress.state || '',
                    country: editAddress.country || 'India',
                    postal_code: editAddress.postal || editAddress.postal_code || '',
                    address_type: (editAddress.type?.toLowerCase() as any) || (editAddress.address_type as any) || 'home',
                    is_default: editAddress.isDefault || editAddress.is_default || false,
                });
            } else {
                setFormData({
                    full_name: '',
                    phone: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state: '',
                    country: 'India',
                    postal_code: '',
                    address_type: 'home',
                    is_default: false,
                });
            }
        }
    }, [visible, editAddress]);

    const handleSubmit = async () => {
        // Validation
        if (!formData.full_name || !formData.phone || !formData.address_line1 || !formData.city || !formData.state || !formData.postal_code) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            if (editAddress) {
                await apiService.updateAddress(editAddress.id, formData);
                Alert.alert('Success', 'Address updated successfully');
            } else {
                await apiService.addAddress(formData);
                Alert.alert('Success', 'Address added successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        label: string,
        field: keyof AddressInput,
        placeholder: string,
        keyboardType: 'default' | 'number-pad' | 'phone-pad' = 'default',
        required: boolean = true
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
                style={styles.input}
                value={String(formData[field])}
                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                placeholder={placeholder}
                keyboardType={keyboardType}
                placeholderTextColor={theme.colors.neutral[400]}
            />
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{editAddress ? 'Edit Address' : 'Add New Address'}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                        {renderInput('Full Name', 'full_name', 'Enter full name')}
                        {renderInput('Phone Number', 'phone', 'Enter phone number', 'phone-pad')}
                        {renderInput('Address Line 1', 'address_line1', 'House no., Building, Street')}
                        {renderInput('Address Line 2', 'address_line2', 'Area, Landmark', 'default', false)}

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                {renderInput('City', 'city', 'Enter city')}
                            </View>
                            <View style={styles.halfWidth}>
                                {renderInput('State', 'state', 'Enter state')}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                {renderInput('Country', 'country', 'Enter country')}
                            </View>
                            <View style={styles.halfWidth}>
                                {renderInput('Pincode', 'postal_code', 'Enter pincode', 'number-pad')}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Address Type</Text>
                            <View style={styles.typeContainer}>
                                {['home', 'work', 'other'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeButton,
                                            formData.address_type === type && styles.typeButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, address_type: type as any })}
                                    >
                                        <Text
                                            style={[
                                                styles.typeText,
                                                formData.address_type === type && styles.typeTextActive,
                                            ]}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Set as Default Address</Text>
                            <Switch
                                value={formData.is_default}
                                onValueChange={(value) => setFormData({ ...formData, is_default: value })}
                                trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[600] }}
                                thumbColor={theme.colors.white}
                            />
                        </View>

                        <View style={styles.spacer} />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Address</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[200],
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.neutral[900],
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 20,
        color: theme.colors.neutral[500],
    },
    formContainer: {
        padding: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: theme.colors.neutral[700],
        marginBottom: 8,
        fontWeight: '500',
    },
    required: {
        color: theme.colors.error[500],
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: theme.colors.neutral[900],
        backgroundColor: theme.colors.neutral[50],
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        backgroundColor: theme.colors.white,
    },
    typeButtonActive: {
        borderColor: theme.colors.primary[600],
        backgroundColor: theme.colors.primary[50],
    },
    typeText: {
        fontSize: 14,
        color: theme.colors.neutral[600],
    },
    typeTextActive: {
        color: theme.colors.primary[600],
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        paddingVertical: 8,
    },
    switchLabel: {
        fontSize: 16,
        color: theme.colors.neutral[900],
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[200],
        backgroundColor: theme.colors.white,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        marginRight: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.neutral[700],
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: theme.colors.primary[600],
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: theme.colors.neutral[400],
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.white,
    },
    spacer: {
        height: 30,
    },
});

export default AddAddressModal;
