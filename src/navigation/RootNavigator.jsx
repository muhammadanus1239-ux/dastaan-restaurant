import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { apiClient } from '../api/client';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import ReservationScreen from '../screens/ReservationScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import {
  Utensils,
  ShoppingBag,
  Calendar,
  Clock,
  User,
  LayoutDashboard,
  Server
} from 'lucide-react-native';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const { itemCount } = useCart();

  // Navigation state (simulating bottom tabs and screens)
  const [currentScreen, setCurrentScreen] = useState('Menu');
  const [trackedOrderId, setTrackedOrderId] = useState(null);

  // Live Server Health State (Task 2 Requirement)
  const [serverHealth, setServerHealth] = useState({
    status: 'checking',
    mongoStatus: 'checking',
    port: 5000
  });

  // Check health periodically
  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await apiClient.get('/api/health');
        if (isMounted && res) {
          setServerHealth({
            status: 'connected',
            mongoStatus: res.mongoStatus || (res.mongoConnected ? 'connected' : 'disconnected'),
            port: res.port || 5000
          });
        }
      } catch (e) {
        if (isMounted) {
          setServerHealth({
            status: 'disconnected',
            mongoStatus: 'disconnected',
            port: 5000
          });
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navigateTo = (screen, orderId = null) => {
    if (orderId) setTrackedOrderId(orderId);
    setCurrentScreen(screen);
  };

  // Loading screen during initial startup
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.splashTitle, { color: colors.primary }]}>
          DASTAAN
        </Text>
        <Text style={[styles.splashSubtitle, { color: colors.textMuted }]}>
          Loading Heritage Dining Experience...
        </Text>
      </SafeAreaView>
    );
  }

  // If no user is logged in, show AuthStack (LoginScreen)
  if (!user) {
    return <LoginScreen onNavigate={(screen) => navigateTo(screen)} />;
  }

  // Navigation tabs configuration based on user role
  const isManager = user?.role === 'manager';

  const tabs = isManager
    ? [
        { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'Menu', label: 'Menu', icon: Utensils },
        { key: 'Profile', label: 'Profile', icon: User },
      ]
    : [
        { key: 'Menu', label: 'Menu', icon: Utensils },
        { key: 'Cart', label: 'Cart', icon: ShoppingBag, badge: itemCount },
        { key: 'Reservations', label: 'Reserve', icon: Calendar },
        { key: 'Orders', label: 'Orders', icon: Clock },
        { key: 'Profile', label: 'Profile', icon: User },
      ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={navigateTo} />;
      case 'Menu':
        return <MenuScreen onNavigate={navigateTo} />;
      case 'Cart':
        return <CartScreen onNavigate={navigateTo} />;
      case 'OrderSummary':
        return <OrderSummaryScreen onNavigate={navigateTo} />;
      case 'Reservations':
        return <ReservationScreen onNavigate={navigateTo} />;
      case 'Orders':
        return <OrderTrackingScreen orderId={trackedOrderId} onNavigate={navigateTo} />;
      case 'OrderHistory':
        return <OrderHistoryScreen onNavigate={navigateTo} />;
      case 'Profile':
        return <ProfileScreen onNavigate={navigateTo} />;
      default:
        return (
          <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
            <View style={[styles.fallbackCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.fallbackTitle, { color: colors.primary }]}>
                {currentScreen} Screen
              </Text>
              <Text style={[styles.fallbackSubtitle, { color: colors.textMuted }]}>
                DASTAAN Heritage Navigation
              </Text>
              <TouchableOpacity
                onPress={() => navigateTo('Menu')}
                style={[styles.fallbackBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                  Back to Menu
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Live Server Status Bar (Task 2 Requirement) */}
      <View
        style={[
          styles.statusBar,
          {
            backgroundColor: isDark ? '#201317' : '#F5ECE0',
            borderColor: colors.border
          }
        ]}
      >
        <View style={styles.statusBarLeft}>
          <Server size={13} color={colors.gold || '#D4AF37'} style={{ marginRight: 5 }} />
          <Text style={[styles.apiTitle, { color: colors.primary }]}>
            DASTAAN API
          </Text>
        </View>

        {/* Live Connectivity Badge */}
        <View>
          {serverHealth.status === 'connected' ? (
            <View
              style={[
                styles.healthBadge,
                {
                  backgroundColor: serverHealth.mongoStatus === 'connected' ? '#DCFCE7' : '#FEF3C7'
                }
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: serverHealth.mongoStatus === 'connected' ? '#16A34A' : '#D97706'
                  }
                ]}
              />
              <Text
                style={[
                  styles.healthText,
                  {
                    color: serverHealth.mongoStatus === 'connected' ? '#16A34A' : '#B45309'
                  }
                ]}
              >
                {serverHealth.mongoStatus === 'connected'
                  ? `Connected (Port ${serverHealth.port})`
                  : `Server Online • Mongo Offline`}
              </Text>
            </View>
          ) : (
            <View style={[styles.healthBadge, { backgroundColor: '#FEE2E2' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#DC2626' }]} />
              <Text style={[styles.healthText, { color: '#DC2626' }]}>
                Offline (Server Unreachable)
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Active Screen View */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Role-Restricted Bottom Navigation Bar (A1 Q6 Requirement 6) */}
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: colors.tabBarBg || colors.surface,
            borderColor: colors.border
          }
        ]}
      >
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.key || (tab.key === 'Orders' && currentScreen === 'OrderHistory');

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setCurrentScreen(tab.key)}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                {/* Active Indicator Line on top of tab icon */}
                {isActive && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: colors.gold || '#D4AF37' }
                    ]}
                  />
                )}

                <View style={styles.iconWrapper}>
                  <Icon
                    size={20}
                    color={isActive ? colors.primary : colors.textMuted}
                  />

                  {/* Cart Notification Badge */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <View
                      style={[
                        styles.cartBadge,
                        { backgroundColor: colors.primary }
                      ]}
                    >
                      <Text style={styles.cartBadgeText}>
                        {tab.badge}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors.primary : colors.textMuted,
                      fontWeight: isActive ? 'bold' : '500'
                    }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    zIndex: 10
  },
  statusBarLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  apiTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'serif'
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  healthText: {
    fontSize: 10,
    fontWeight: '600'
  },
  screenContainer: {
    flex: 1
  },
  tabBarContainer: {
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 58,
    paddingHorizontal: 8
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative'
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginTop: 14,
    letterSpacing: 1.5
  },
  splashSubtitle: {
    fontSize: 12,
    marginTop: 4
  },
  fallbackCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 300
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  fallbackSubtitle: {
    fontSize: 12,
    marginVertical: 8
  },
  fallbackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6
  }
});