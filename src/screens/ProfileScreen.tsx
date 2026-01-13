import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import ProtectedScreen from '../components/ProtectedScreen';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import { theme } from '../theme';

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
      title: 'Addresses',
      subtitle: 'Manage delivery addresses',
      icon: '📍',
      onPress: () => navigation.navigate('Addresses'),
    },   
    {
      id: '4',
      title: 'Notifications',
      subtitle: 'Manage your preferences',
      icon: '🔔',
      onPress: () => Alert.alert('Notifications', 'Notification preferences coming soon!'),
    },
    {
      id: '5',
      title: 'Help & Support',
      subtitle: 'Get help or contact us',
      icon: '❓',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: '6',
      title: 'Settings',
      subtitle: 'App settings & preferences',
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
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
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  if (isLoading && !userData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
        <EnhancedHeader
          title="👤 Profile"
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.neutral[50]} />
      <EnhancedHeader
        title="👤 Profile"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        }
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

        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: user?.avatar || 'https://via.placeholder.com/100/f43f5e/ffffff?text=' + (user?.name?.charAt(0) || 'U')
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              {user?.phone && <Text style={styles.userPhone}>📱 {user.phone}</Text>}
              <Text style={styles.memberSince}>Member since {memberSince}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>📦 Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.wishlistCount || 0}</Text>
            <Text style={styles.statLabel}>❤️ Wishlist</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₹{stats?.totalSpent?.toLocaleString() || '0'}</Text>
            <Text style={styles.statLabel}>💰 Spent</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => renderMenuItem({ item, index }))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>✨ Samar Silk Palace v1.0.0</Text>
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.linkText}>About Us</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.linkText}>Privacy Policy</Text>
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
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 18,
    color: theme.colors.neutral[900],
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
  },
  errorContainer: {
    backgroundColor: theme.colors.error[50],
    margin: 16,
    padding: 12,
    borderRadius: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: theme.colors.error[700],
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.neutral[200],
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: theme.colors.neutral[600],
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: theme.colors.neutral[400],
    marginTop: 4,
  },
  editButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  editButtonText: {
    color: theme.colors.neutral[900],
    fontWeight: '600',
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary[600],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.neutral[600],
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.neutral[200],
    height: '80%',
    alignSelf: 'center',
  },
  menuSection: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 18,
    color: theme.colors.neutral[400],
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
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
  },
  linkSeparator: {
    marginHorizontal: 8,
    color: theme.colors.neutral[400],
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.colors.error[50],
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error[200],
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