import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import ProtectedScreen from '../components/ProtectedScreen';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';
import SafeAlert from '../utils/safeAlert';

const ProfileScreenContent = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state: authState, logout } = useAuth();
  const {
    userData,
    userStatistics,
    isLoading,
    error,
    refreshUserData
  } = useUserProfile();

  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUserData();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const menuItems = [
    {
      id: '1',
      title: 'My Orders',
      subtitle: 'Track your orders',
      icon: '📦',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      id: '2',
      title: 'Wishlist',
      subtitle: 'Your saved items',
      icon: '❤️',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      id: '3',
      title: 'Recently Viewed',
      subtitle: 'Products you browsed',
      icon: '👁️',
      onPress: () => navigation.navigate('RecentlyViewed' as any),
    },
    {
      id: '4',
      title: 'Addresses',
      subtitle: 'Manage delivery addresses',
      icon: '📍',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      id: '5',
      title: 'Notifications',
      subtitle: 'Manage your preferences',
      icon: '🔔',
      onPress: () => SafeAlert.show('Notifications', 'Notification preferences coming soon!'),
    },
    {
      id: '6',
      title: 'Help & Support',
      subtitle: 'Get help or contact us',
      icon: '❓',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: '7',
      title: 'Settings',
      subtitle: 'App settings & preferences',
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const handleLogout = () => {
    SafeAlert.show(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = ({ item, index }: { item: typeof menuItems[0]; index: number }) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        <Text style={styles.menuIconText}>{item.icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  if (isLoading && !userData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
        <EnhancedHeader
          title="Profile"
          showBackButton={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  const user = userData?.user || authState.user;
  const stats = userStatistics;

  // Format member since date
  const memberSince = user?.created_at ?
    new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    }) : 'Recently';

  // Get initials for avatar fallback
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary[800]} />
      <EnhancedHeader
        title="My Profile"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary[600]]} />
        }>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={refreshUserData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Premium Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardHeader}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Welcome!'}</Text>
              <Text style={styles.userEmail}>{
                user?.email?.includes('@varanasisaree.placeholder.com')
                  ? '📧 Add your email'
                  : user?.email || 'No email'
              }</Text>
              {user?.phone && <Text style={styles.userPhone}>📱 {user.phone}</Text>}
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info Row */}
          <View style={styles.profileInfoRow}>
            <View style={styles.profileInfoItem}>
              <Text style={styles.profileInfoLabel}>Member Since</Text>
              <Text style={styles.profileInfoValue}>{memberSince}</Text>
            </View>
            {user?.gstin && (
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>GSTIN</Text>
                <Text style={styles.profileInfoValue}>{user.gstin}</Text>
              </View>
            )}
          </View>

          {/* Address Display */}
          {user?.address && (
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>🏠</Text>
              <Text style={styles.addressText} numberOfLines={2}>{user.address}</Text>
            </View>
          )}
        </View>

        {/* Stats Dashboard */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: theme.colors.primary[50] }]}>
              <Text style={styles.statEmoji}>📦</Text>
            </View>
            <Text style={styles.statNumber}>{stats?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#FFF0F0' }]}>
              <Text style={styles.statEmoji}>❤️</Text>
            </View>
            <Text style={styles.statNumber}>{stats?.wishlistCount || 0}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#F0FFF4' }]}>
              <Text style={styles.statEmoji}>💰</Text>
            </View>
            <Text style={styles.statNumber}>₹{stats?.totalSpent?.toLocaleString() || '0'}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Quick Action - Edit Profile */}
        <TouchableOpacity
          style={styles.editProfileBanner}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}>
          <View style={styles.editProfileBannerContent}>
            <Text style={styles.editProfileBannerTitle}>Complete Your Profile</Text>
            <Text style={styles.editProfileBannerSubtitle}>Add GSTIN, address & more for a smoother experience</Text>
          </View>
          <Text style={styles.editProfileBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          {menuItems.slice(0, 4).map((item, index) => renderMenuItem({ item, index }))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>More</Text>
          {menuItems.slice(4).map((item, index) => renderMenuItem({ item, index: index + 4 }))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>✨ Samar Silk Palace v1.0.0</Text>
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Policy' as any, { type: 'about_us', title: 'About Us' })}>
              <Text style={styles.linkText}>About Us</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Policy' as any, { type: 'privacy_policy', title: 'Privacy Policy' })}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Policy' as any, { type: 'terms', title: 'Terms of Service' })}>
              <Text style={styles.linkText}>Terms</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.neutral[600],
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  errorContainer: {
    backgroundColor: theme.colors.error[50],
    margin: 16,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error[500],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.error[700],
  },
  retryButton: {
    backgroundColor: theme.colors.error[100],
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    color: theme.colors.error[700],
    fontSize: 13,
    fontWeight: '600',
  },

  // Premium Profile Card
  profileCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary[50],
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: theme.colors.primary[100],
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary[200],
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.primary[700],
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: theme.colors.neutral[500],
  },
  editIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  editIcon: {
    fontSize: 18,
  },
  profileInfoRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
    gap: 16,
  },
  profileInfoItem: {
    flex: 1,
  },
  profileInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  profileInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral[800],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.neutral[600],
    lineHeight: 19,
  },

  // Stats Dashboard
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statEmoji: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.neutral[500],
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Edit Profile Banner
  editProfileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  editProfileBannerContent: {
    flex: 1,
  },
  editProfileBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary[800],
    marginBottom: 2,
  },
  editProfileBannerSubtitle: {
    fontSize: 12,
    color: theme.colors.primary[600],
  },
  editProfileBannerArrow: {
    fontSize: 22,
    color: theme.colors.primary[600],
    fontWeight: '700',
    marginLeft: 12,
  },

  // Menu Section
  menuSection: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[50],
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: theme.colors.neutral[500],
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.neutral[300],
    fontWeight: '300',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: theme.colors.neutral[100],
    marginHorizontal: 16,
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  appVersion: {
    fontSize: 12,
    color: theme.colors.neutral[400],
    marginBottom: 8,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    color: theme.colors.primary[600],
    fontWeight: '500',
  },
  linkSeparator: {
    marginHorizontal: 8,
    color: theme.colors.neutral[300],
  },

  // Logout Button
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.colors.error[50],
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error[100],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error[600],
  },
});

const ProfileScreen = () => {
  return (
    <ProtectedScreen fallbackMessage="Please sign in to view and manage your profile, orders, and account settings.">
      <ProfileScreenContent />
    </ProtectedScreen>
  );
};

export default ProfileScreen;