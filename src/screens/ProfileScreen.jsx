import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../data/brand';
import {
  Mail,
  Shield,
  Moon,
  Sun,
  LogOut,
  ShoppingBag,
  Receipt
} from 'lucide-react-native';

export default function ProfileScreen({ onNavigate }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const handleLogout = () => {
    logout();
    if (onNavigate) {
      onNavigate('Login');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>
              My Profile
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Manage your personal preferences & account
            </Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: user?.role === 'manager' ? colors.primary : (colors.tint || 'rgba(180, 83, 9, 0.1)'),
                borderColor: colors.border
              }
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                { color: user?.role === 'manager' ? (colors.onPrimary || '#FFFFFF') : colors.primary }
              ]}
            >
              {user?.role || 'Guest'}
            </Text>
          </View>
        </View>

        {/* User Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.userRow}>
            {/* Avatar Circle */}
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarInitial, { color: colors.onPrimary || '#FFFFFF' }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user?.name || 'DASTAAN Patron'}
              </Text>

              <View style={styles.infoLine}>
                <Mail size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
                <Text style={[styles.infoText, { color: colors.textMuted }]} numberOfLines={1}>
                  {user?.email || 'patron@dastaan.pk'}
                </Text>
              </View>

              <View style={styles.infoLine}>
                <Shield size={13} color={colors.gold || '#D4AF37'} style={{ marginRight: 5 }} />
                <Text style={[styles.infoText, { color: colors.gold || '#D4AF37', fontWeight: '600' }]}>
                  {user?.role === 'manager' ? 'Restaurant Manager' : 'Verified Diner'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance & Preferences Card (A1 Q6 Requirement 4) */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>
            App Preferences
          </Text>

          {/* Theme Toggle Row */}
          <View style={styles.themeToggleRow}>
            <View style={styles.themeInfoLeft}>
              <View style={[styles.themeIconBox, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)' }]}>
                {isDark ? (
                  <Moon size={18} color={colors.primary} />
                ) : (
                  <Sun size={18} color={colors.primary} />
                )}
              </View>
              <View>
                <Text style={[styles.themeTitle, { color: colors.text }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.themeSubtitle, { color: colors.textMuted }]}>
                  {isDark ? 'Royal Night theme active' : 'Royal Cream theme active'}
                </Text>
              </View>
            </View>

            {/* Native Clean Toggle Switch */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.switchTrack,
                {
                  backgroundColor: isDark ? colors.primary : (colors.border || '#D1D5DB'),
                  justifyContent: isDark ? 'flex-end' : 'flex-start'
                }
              ]}
              activeOpacity={0.8}
              accessibilityLabel="Toggle theme"
            >
              <View style={styles.switchThumb} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Navigation Links */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('Menu')}
            style={[styles.actionLinkItem, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <ShoppingBag size={16} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={[styles.actionTitle, { color: colors.text }]}>Browse Heritage Menu</Text>
            </View>
            <Text style={[styles.arrowText, { color: colors.textMuted }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('OrderHistory')}
            style={[styles.actionLinkItem, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Receipt size={16} color={colors.gold || '#D4AF37'} style={{ marginRight: 10 }} />
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Order History & Receipts</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>View past orders, items, and receipts</Text>
              </View>
            </View>
            <Text style={[styles.arrowText, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>

          {user?.role === 'manager' && (
            <TouchableOpacity
              onPress={() => onNavigate && onNavigate('Dashboard')}
              style={[styles.actionLinkItem, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)', borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <Shield size={16} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={[styles.actionTitle, { color: colors.primary, fontWeight: 'bold' }]}>Manager Dashboard</Text>
              </View>
              <Text style={[styles.arrowText, { color: colors.primary }]}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout Button (A1 Q6 Requirement 3) */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: isDark ? '#3E181A' : '#FDE8E8',
              borderColor: colors.danger || '#EF4444'
            }
          ]}
          activeOpacity={0.8}
        >
          <LogOut size={16} color={colors.danger || '#EF4444'} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: colors.danger || '#EF4444' }]}>
            Sign Out & Reset Stack
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1
  },
  roleBadgeText: { fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    elevation: 2
  },
  avatarInitial: { fontSize: 24, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  infoText: { fontSize: 12 },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  themeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2
  },
  themeInfoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  themeIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  themeTitle: { fontSize: 14, fontWeight: '600' },
  themeSubtitle: { fontSize: 11, marginTop: 2 },
  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center'
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5
  },
  actionLinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  actionTitle: { fontSize: 13, fontWeight: '600' },
  actionSub: { fontSize: 11, marginTop: 2 },
  arrowText: { fontSize: 16, fontWeight: 'bold' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4
  },
  logoutText: { fontSize: 14, fontWeight: 'bold' }
});