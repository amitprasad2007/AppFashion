import React, { useState, useEffect } from 'react';
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
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import ProtectedScreen from '../components/ProtectedScreen';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import EnhancedHeader from '../components/EnhancedHeader';
import GlassCard from '../components/GlassCard';
import FloatingElements from '../components/FloatingElements';
import { theme } from '../theme';
import LinearGradient from 'react-native-linear-gradient';

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
      title: 'Payment Methods',
      subtitle: 'Cards & payment options',
      icon: '💳',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: '5',
      title: 'Notifications',
      subtitle: 'Manage your preferences',
      icon: '🔔',
      onPress: () => navigation.navigate('Notifications'),
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
              navigation.navigate('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = ({ item, index }: { item: typeof menuItems[0]; index: number }) => (
    <AnimatedCard key={index} delay={300 + index * 50}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={item.onPress}
        activeOpacity={0.9}>
        <GlassCard style={styles.menuItem} variant="light">
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>{item.icon}</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </AnimatedCard>
  );

  if (!authState.isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.glassGradients.sunset}
          style={styles.backgroundGradient as ViewStyle}

        />
        <FloatingElements count={6} />

        <EnhancedHeader
          title="👤 Profile"
          showBackButton={false}
        />

        <View style={styles.loginPrompt}>
          <GlassCard gradientColors={theme.glassGradients.aurora}>
            <Text style={styles.loginTitle}>✨ Welcome to Samar Silk Palace</Text>
            <Text style={styles.loginSubtitle}>Sign in to access your profile and orders</Text>
            <GradientButton
              title="🔐 Sign In"
              onPress={() => navigation.navigate('Login')}
              gradient={theme.colors.gradients.primary}
              style={styles.loginButton}
            />
            <GradientButton
              title="📝 Create Account"
              onPress={() => navigation.navigate('Register')}
              gradient={theme.colors.gradients.secondary}
              style={styles.signupButton}
            />
          </GlassCard>
        </View>
      </View>
    );
  }

  if (isLoading && !userData) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.glassGradients.sunset}
          style={styles.backgroundGradient}
        />
        <FloatingElements count={6} />

        <EnhancedHeader
          title="👤 Profile"
          showBackButton={false}
        />

        <View style={styles.loadingContainer}>
          <GlassCard>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </GlassCard>
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
      <LinearGradient
        colors={theme.glassGradients.sunset}
        style={styles.backgroundGradient as any}
      />
      <FloatingElements count={8} />

      <EnhancedHeader
        title="👤 Profile"
        showBackButton={false}
        rightComponent={
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <GlassCard style={styles.refreshButton} variant="light">
              <Text style={styles.refreshText}>🔄</Text>
            </GlassCard>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <GlassCard style={styles.errorContainer} variant="light">
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <TouchableOpacity onPress={refreshUserData} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}

        {/* User Info */}
        <AnimatedCard delay={100}>
          <GlassCard style={styles.userSection} gradientColors={theme.glassGradients.aurora}>
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
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}>
                <GlassCard style={styles.editButton} variant="light">
                  <Text style={styles.editButtonText}>✏️ Edit</Text>
                </GlassCard>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </AnimatedCard>

        {/* Stats */}
        <AnimatedCard delay={200}>
          <GlassCard style={styles.statsSection} gradientColors={theme.glassGradients.emerald}>
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
              <Text style={styles.statLabel}>💰 Total Spent</Text>
            </View>
          </GlassCard>
        </AnimatedCard>

        {/* Additional Stats Row */}
        <AnimatedCard delay={250}>
          <GlassCard style={styles.statsSection} gradientColors={theme.glassGradients.purple}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.pendingOrders || 0}</Text>
              <Text style={styles.statLabel}>⏳ Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.cartItemsCount || 0}</Text>
              <Text style={styles.statLabel}>🛒 Cart Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.addressCount || 0}</Text>
              <Text style={styles.statLabel}>📍 Addresses</Text>
            </View>
          </GlassCard>
        </AnimatedCard>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => renderMenuItem({ item, index }))}
        </View>

        {/* App Info */}
        <AnimatedCard delay={650}>
          <GlassCard style={styles.appInfo} gradientColors={theme.glassGradients.ocean}>
            <Text style={styles.appVersion}>✨ Samar Silk Palace v1.0.0</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.aboutLink}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.privacyLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </GlassCard>
        </AnimatedCard>

        {/* Logout Button */}
        <AnimatedCard delay={700}>
          <TouchableOpacity onPress={handleLogout}>
            <GlassCard style={styles.logoutButton} variant="light">
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </GlassCard>
          </TouchableOpacity>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    padding: 15,
    backgroundColor: '#f43f5e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  refreshText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userDetails: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },
  menuSection: {
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  aboutLink: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 5,
  },
  privacyLink: {
    fontSize: 14,
    color: '#007bff',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  signupButton: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
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