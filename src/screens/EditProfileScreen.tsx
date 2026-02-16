import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api_service';

const EditProfileScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { userData, refreshUserData } = useUserProfile();
    const { state: authState } = useAuth();

    const user = userData?.user || authState.user;

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.updateProfile({
                name,
                phone,
            });

            if (response.success) {
                await refreshUserData();
                Alert.alert('Success', 'Profile updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <EnhancedHeader
                title="Edit Profile"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formSection}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={theme.colors.neutral[400]}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.input, styles.disabledInput]}>
                        <Text style={styles.disabledText}>{user?.email}</Text>
                    </View>
                    <Text style={styles.helperText}>Email cannot be changed</Text>

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        placeholderTextColor={theme.colors.neutral[400]}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[50],
    },
    content: {
        padding: 20,
    },
    formSection: {
        backgroundColor: theme.colors.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.neutral[700],
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: theme.colors.neutral[900],
        backgroundColor: theme.colors.white,
    },
    disabledInput: {
        backgroundColor: theme.colors.neutral[100],
        borderColor: theme.colors.neutral[200],
        justifyContent: 'center',
    },
    disabledText: {
        color: theme.colors.neutral[500],
    },
    helperText: {
        fontSize: 12,
        color: theme.colors.neutral[500],
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: theme.colors.primary[600],
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: theme.colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: theme.colors.neutral[400],
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default EditProfileScreen;
