import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, KeyboardAvoidingView, Platform, Modal, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api_service';
import SafeAlert from '../utils/safeAlert';

const EditProfileScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { userData, refreshUserData } = useUserProfile();
    const { state: authState } = useAuth();
    const user = userData?.user || authState.user;

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [gstin, setGstin] = useState(user?.gstin || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);

    const isPlaceholderEmail = user?.email?.includes('@varanasisaree.placeholder.com');
    const initials = user?.name ? user.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U';

    const handleSave = async () => {
        if (!name.trim()) { SafeAlert.show('Error', 'Name cannot be empty'); return; }
        setIsSubmitting(true);
        try {
            const updateData: any = { name, address, gstin };
            if (isPlaceholderEmail && email.trim() && !email.includes('@varanasisaree.placeholder.com')) {
                updateData.email = email;
            }
            const response = await api.updateProfile(updateData);
            if (response.success) {
                await refreshUserData();
                SafeAlert.show('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } else {
                SafeAlert.show('Error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            SafeAlert.show('Error', 'An unexpected error occurred. Please try again.');
        } finally { setIsSubmitting(false); }
    };

    const handleRequestPhoneOtp = async () => {
        if (!newPhone.trim() || newPhone.length < 10) { SafeAlert.show('Error', 'Please enter a valid phone number'); return; }
        setOtpSending(true);
        try {
            const response = await api.requestPhoneUpdate(newPhone);
            if (response.success) { SafeAlert.show('OTP Sent', 'An OTP has been sent to your new phone number'); }
            else { SafeAlert.show('Error', response.message || 'Failed to send OTP'); }
        } catch (error: any) { SafeAlert.show('Error', error.message || 'Failed to send OTP'); }
        finally { setOtpSending(false); }
    };

    const handleVerifyPhoneOtp = async () => {
        if (!otp.trim() || otp.length !== 6) { SafeAlert.show('Error', 'Please enter a valid 6-digit OTP'); return; }
        setOtpVerifying(true);
        try {
            const response = await api.verifyPhoneUpdate(newPhone, otp);
            if (response.success) {
                await refreshUserData();
                setShowOtpModal(false); setNewPhone(''); setOtp(''); setPhone(newPhone);
                SafeAlert.show('Success', 'Phone number updated successfully');
            } else { SafeAlert.show('Error', response.message || 'Invalid OTP'); }
        } catch (error: any) { SafeAlert.show('Error', error.message || 'Failed to verify OTP'); }
        finally { setOtpVerifying(false); }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
            <EnhancedHeader title="Edit Profile" showBackButton={true} onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Header */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                    <Text style={styles.avatarName}>{user?.name || 'Your Name'}</Text>
                    <Text style={styles.avatarSub}>Update your personal information below</Text>
                </View>

                {/* Personal Info Card */}
                <View style={styles.formCard}>
                    <View style={styles.cardHeader}><Text style={styles.cardIcon}>👤</Text><Text style={styles.cardTitle}>Personal Information</Text></View>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor={theme.colors.neutral[400]} />
                    <Text style={styles.label}>Email Address</Text>
                    {isPlaceholderEmail ? (
                        <>
                            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.colors.neutral[400]} />
                            <Text style={styles.helper}>📧 Add your email to receive order updates</Text>
                        </>
                    ) : (
                        <>
                            <View style={[styles.input, styles.disabledInput]}><Text style={styles.disabledText}>{user?.email}</Text></View>
                            <Text style={styles.helper}>🔒 Email cannot be changed</Text>
                        </>
                    )}
                </View>

                {/* Contact Card */}
                <View style={styles.formCard}>
                    <View style={styles.cardHeader}><Text style={styles.cardIcon}>📱</Text><Text style={styles.cardTitle}>Contact</Text></View>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.phoneRow}>
                        <View style={[styles.input, styles.disabledInput, { flex: 1 }]}><Text style={styles.disabledText}>{phone || 'No phone number'}</Text></View>
                        <TouchableOpacity style={styles.changeBtn} onPress={() => { setNewPhone(''); setOtp(''); setShowOtpModal(true); }}>
                            <Text style={styles.changeBtnText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.helper}>🔐 Phone change requires OTP verification</Text>
                </View>

                {/* Address & Business Card */}
                <View style={styles.formCard}>
                    <View style={styles.cardHeader}><Text style={styles.cardIcon}>🏠</Text><Text style={styles.cardTitle}>Address & Business</Text></View>
                    <Text style={styles.label}>Address</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={address} onChangeText={setAddress} placeholder="Enter your address" multiline numberOfLines={3} placeholderTextColor={theme.colors.neutral[400]} />
                    <Text style={styles.label}>GSTIN (Optional)</Text>
                    <TextInput style={styles.input} value={gstin} onChangeText={setGstin} placeholder="e.g., 09AAKCS1234F1Z1" autoCapitalize="characters" placeholderTextColor={theme.colors.neutral[400]} />
                    <Text style={styles.helper}>🧾 Required for GST invoices on business orders</Text>
                </View>

                {/* Save */}
                <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.saveDisabled]} onPress={handleSave} disabled={isSubmitting} activeOpacity={0.8}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>💾  Save Changes</Text>}
                </TouchableOpacity>
            </ScrollView>

            {/* OTP Modal */}
            <Modal visible={showOtpModal} transparent animationType="slide" onRequestClose={() => setShowOtpModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalTop}>
                            <View style={styles.modalIconBg}><Text style={{ fontSize: 28 }}>📱</Text></View>
                            <Text style={styles.modalTitle}>Change Phone Number</Text>
                            <Text style={styles.modalSub}>Enter your new phone number and verify with OTP</Text>
                        </View>
                        <Text style={styles.label}>New Phone Number</Text>
                        <View style={styles.otpRow}>
                            <TextInput style={[styles.input, { flex: 1 }]} value={newPhone} onChangeText={setNewPhone} placeholder="Enter new phone" keyboardType="phone-pad" maxLength={15} placeholderTextColor={theme.colors.neutral[400]} />
                            <TouchableOpacity style={[styles.otpBtn, otpSending && styles.otpBtnOff]} onPress={handleRequestPhoneOtp} disabled={otpSending}>
                                {otpSending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.otpBtnText}>Send OTP</Text>}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.label, { marginTop: 16 }]}>Enter OTP</Text>
                        <TextInput style={styles.input} value={otp} onChangeText={setOtp} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} placeholderTextColor={theme.colors.neutral[400]} />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowOtpModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.verifyBtn, otpVerifying && styles.saveDisabled]} onPress={handleVerifyPhoneOtp} disabled={otpVerifying}>
                                {otpVerifying ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.verifyBtnText}>Verify & Update</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.neutral[50] },
    content: { padding: 16, paddingBottom: 40 },
    avatarSection: { alignItems: 'center', paddingVertical: 24, marginBottom: 8 },
    avatarFallback: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary[100], alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: theme.colors.primary[200], marginBottom: 12 },
    avatarInitials: { fontSize: 28, fontWeight: '700', color: theme.colors.primary[700] },
    avatarName: { fontSize: 20, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 4 },
    avatarSub: { fontSize: 14, color: theme.colors.neutral[500] },
    formCard: { backgroundColor: theme.colors.white, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.colors.neutral[100] },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[100] },
    cardIcon: { fontSize: 20, marginRight: 10 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.neutral[800], letterSpacing: 0.3 },
    label: { fontSize: 13, fontWeight: '600', color: theme.colors.neutral[500], marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { borderWidth: 1, borderColor: theme.colors.neutral[200], borderRadius: 12, padding: 14, fontSize: 15, color: theme.colors.neutral[900], backgroundColor: theme.colors.neutral[50] },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    disabledInput: { backgroundColor: theme.colors.neutral[100], borderColor: theme.colors.neutral[200], justifyContent: 'center' },
    disabledText: { color: theme.colors.neutral[500], fontSize: 15 },
    helper: { fontSize: 12, color: theme.colors.neutral[400], marginTop: 6 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    changeBtn: { backgroundColor: theme.colors.primary[50], paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.primary[200] },
    changeBtnText: { color: theme.colors.primary[700], fontWeight: '700', fontSize: 14 },
    saveButton: { backgroundColor: theme.colors.primary[600], padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, shadowColor: theme.colors.primary[600], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
    saveDisabled: { backgroundColor: theme.colors.neutral[400], shadowOpacity: 0, elevation: 0 },
    saveText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.neutral[300], alignSelf: 'center', marginBottom: 20 },
    modalTop: { alignItems: 'center', marginBottom: 20 },
    modalIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary[50], alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.neutral[900], marginBottom: 6 },
    modalSub: { fontSize: 14, color: theme.colors.neutral[500], textAlign: 'center' },
    otpRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    otpBtn: { backgroundColor: theme.colors.primary[600], paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12 },
    otpBtnOff: { backgroundColor: theme.colors.neutral[400] },
    otpBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 28 },
    cancelBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.neutral[50], borderWidth: 1, borderColor: theme.colors.neutral[200] },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: theme.colors.neutral[600] },
    verifyBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.primary[600] },
    verifyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default EditProfileScreen;
