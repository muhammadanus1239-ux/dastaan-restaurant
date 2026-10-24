import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { CURRENCY_SYMBOL } from '../data/brand';
import {
  ShieldCheck,
  ClipboardList,
  Calendar,
  UtensilsCrossed,
  RefreshCw,
  CheckCircle2,
  ChefHat,
  Sparkles,
  Phone,
  Users,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react-native';

const NEXT_STATUS = {
  Pending: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Served'
};

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks'];

export default function DashboardScreen({ onNavigate }) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'reservations', 'menu'

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Reservations State
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);
  const [updatingResId, setUpdatingResId] = useState(null);

  // Menu State
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [newPriceValue, setNewPriceValue] = useState('');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);

  // Add Dish Form State
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    isSpecial: false,
    isAvailable: true
  });

  // Safety check: only manager can access this screen
  if (user?.role !== 'manager') {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.deniedCard, { backgroundColor: colors.surface, borderColor: colors.danger || '#ef4444' }]}>
          <Text style={[styles.deniedTitle, { color: colors.danger || '#ef4444' }]}>
            Access Denied (403)
          </Text>
          <Text style={[styles.deniedSubtitle, { color: colors.textMuted }]}>
            The Manager Dashboard is restricted to management personnel only.
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate('Menu')}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
              Return to Menu
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Load Orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await apiClient.get('/api/orders');
      const ordersList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null);
      if (ordersList) {
        setOrders(ordersList);
      } else {
        throw new Error('No data received');
      }
    } catch (e) {
      setOrdersError('Server Connection Failed: Could not retrieve orders from MongoDB.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load Reservations
  const loadReservations = async () => {
    setReservationsLoading(true);
    setReservationsError(null);
    try {
      const res = await apiClient.get('/api/reservations');
      const resList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null);
      if (resList) {
        setReservations(resList);
      } else {
        throw new Error('No data received');
      }
    } catch (e) {
      setReservationsError('Server Connection Failed: Could not retrieve bookings from MongoDB.');
    } finally {
      setReservationsLoading(false);
    }
  };

  // Load Menu Items
  const loadMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await apiClient.get('/api/menu');
      const menuList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null);
      if (menuList) {
        setMenuItems(menuList);
      }
    } catch (e) {
      // Keep existing menu if already loaded
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
    else if (activeTab === 'reservations') loadReservations();
    else if (activeTab === 'menu') loadMenu();
  }, [activeTab]);

  // Advance Order Status
  const handleAdvanceOrderStatus = async (order) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    const id = order._id || order.id;
    setUpdatingOrderId(id);

    try {
      const res = await apiClient.patch(`/api/orders/${id}/status`, { status: nextStatus });
      if (res && (res.data || res.success || res._id || res.id || res.status)) {
        setOrders(prev =>
          prev.map(o => (o._id === id || o.id === id ? { ...o, status: nextStatus } : o))
        );
        setFeedbackBanner(`Order status advanced to ${nextStatus}`);
        setTimeout(() => setFeedbackBanner(null), 3000);
      } else {
        throw new Error('Server returned unverified status');
      }
    } catch (err) {
      Alert.alert('Status Update Failed', 'Server Connection Failed: Could not update MongoDB.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Update Reservation Status
  const handleReservationAction = async (res, newStatus) => {
    const id = res._id || res.id;
    setUpdatingResId(id);

    try {
      const response = await apiClient.patch(`/api/reservations/${id}/status`, { status: newStatus });
      if (response && (response.data || response.success || response._id || response.id || response.status)) {
        setReservations(prev =>
          prev.map(r => (r._id === id || r.id === id ? { ...r, status: newStatus } : r))
        );
        setFeedbackBanner(`Reservation ${newStatus.toLowerCase()} successfully`);
        setTimeout(() => setFeedbackBanner(null), 3000);
      } else {
        throw new Error('Server rejected reservation update');
      }
    } catch (e) {
      Alert.alert('Reservation Update Failed', 'Server Connection Failed: Could not update MongoDB.');
    } finally {
      setUpdatingResId(null);
    }
  };

  // Toggle Menu Item Availability
  const handleToggleAvailability = async (item) => {
    const id = item._id || item.id;
    const newStatus = !(item.isAvailable !== false);
    try {
      await apiClient.put(`/api/menu/${id}`, { isAvailable: newStatus });
      setFeedbackBanner(`Availability updated for "${item.name}"`);
      setTimeout(() => setFeedbackBanner(null), 3000);
      loadMenu();
    } catch (e) {
      Alert.alert('Availability Update Failed', 'Server Connection Failed: Could not update MongoDB.');
    }
  };

  // Save Edited Price
  const handleSavePrice = async (item) => {
    const id = item._id || item.id;
    const numPrice = Number(newPriceValue);
    if (isNaN(numPrice) || numPrice < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid positive price');
      return;
    }

    try {
      await apiClient.put(`/api/menu/${id}`, { price: numPrice });
      setEditingPriceId(null);
      setNewPriceValue('');
      setFeedbackBanner(`Price for "${item.name}" updated to ${CURRENCY_SYMBOL} ${numPrice.toLocaleString()}`);
      setTimeout(() => setFeedbackBanner(null), 3000);
      loadMenu();
    } catch (e) {
      Alert.alert('Price Update Failed', 'Server Connection Failed: Could not update MongoDB.');
    }
  };

  // Add New Dish
  const handleCreateDish = async () => {
    if (!newDish.name.trim() || !newDish.price) {
      Alert.alert('Missing Required Fields', 'Please enter both dish name and price');
      return;
    }

    try {
      await apiClient.post('/api/menu', {
        ...newDish,
        price: Number(newDish.price)
      });
      setShowAddDishModal(false);
      const dishName = newDish.name;
      setNewDish({
        name: '',
        description: '',
        price: '',
        category: 'Mains',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
        isSpecial: false,
        isAvailable: true
      });
      setFeedbackBanner(`Dish "${dishName}" added to menu!`);
      setTimeout(() => setFeedbackBanner(null), 3000);
      loadMenu();
    } catch (err) {
      Alert.alert('Failed to Create Dish', 'Server Connection Failed: Could not update MongoDB.');
    }
  };

  // Delete Dish
  const handleDeleteDish = (item) => {
    const id = item._id || item.id;
    Alert.alert(
      'Remove Dish',
      `Are you sure you want to remove "${item.name}" from the menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/menu/${id}`);
              setFeedbackBanner(`Dish "${item.name}" removed from menu.`);
              setTimeout(() => setFeedbackBanner(null), 3000);
              loadMenu();
            } catch (e) {
              Alert.alert('Delete Failed', 'Server Connection Failed: Could not update MongoDB.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>
              Manager Control Center
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Logged in as {user.name} ({user.email})
            </Text>
          </View>
          <View style={[styles.verifiedBadge, { backgroundColor: colors.primary, borderColor: colors.gold || '#D4AF37' }]}>
            <ShieldCheck size={14} color={colors.gold || '#D4AF37'} />
            <Text style={[styles.verifiedText, { color: colors.onPrimary || '#FFFFFF' }]}>
              Manager
            </Text>
          </View>
        </View>

        {/* Feedback Banner */}
        {feedbackBanner && (
          <View style={[styles.feedbackBanner, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)', borderColor: colors.gold || '#D4AF37' }]}>
            <Sparkles size={16} color={colors.gold || '#D4AF37'} />
            <Text style={[styles.feedbackText, { color: colors.primary }]}>
              {feedbackBanner}
            </Text>
          </View>
        )}

        {/* 3 Dashboard Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('orders')}
            style={[styles.tabButton, { backgroundColor: activeTab === 'orders' ? colors.primary : 'transparent' }]}
          >
            <ClipboardList size={14} color={activeTab === 'orders' ? (colors.onPrimary || '#FFFFFF') : colors.text} />
            <Text style={[styles.tabText, { color: activeTab === 'orders' ? (colors.onPrimary || '#FFFFFF') : colors.text }]}>
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('reservations')}
            style={[styles.tabButton, { backgroundColor: activeTab === 'reservations' ? colors.primary : 'transparent' }]}
          >
            <Calendar size={14} color={activeTab === 'reservations' ? (colors.onPrimary || '#FFFFFF') : colors.text} />
            <Text style={[styles.tabText, { color: activeTab === 'reservations' ? (colors.onPrimary || '#FFFFFF') : colors.text }]}>
              Bookings ({reservations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('menu')}
            style={[styles.tabButton, { backgroundColor: activeTab === 'menu' ? colors.primary : 'transparent' }]}
          >
            <UtensilsCrossed size={14} color={activeTab === 'menu' ? (colors.onPrimary || '#FFFFFF') : colors.text} />
            <Text style={[styles.tabText, { color: activeTab === 'menu' ? (colors.onPrimary || '#FFFFFF') : colors.text }]}>
              Menu ({menuItems.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
                Live Kitchen Queue
              </Text>
              <TouchableOpacity
                onPress={loadOrders}
                style={[styles.refreshBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                {ordersLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <RefreshCw size={14} color={colors.primary} />
                )}
                <Text style={[styles.refreshText, { color: colors.primary }]}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {ordersError && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorBoxText}>{ordersError}</Text>
              </View>
            )}

            {orders.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ChefHat size={36} color={colors.textMuted} style={{ opacity: 0.4 }} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No active orders in queue.</Text>
              </View>
            ) : (
              orders.map((ord, idx) => {
                const status = ord.status || 'Pending';
                const nextStatus = NEXT_STATUS[status];
                const isUpdating = updatingOrderId === (ord._id || ord.id);

                return (
                  <View
                    key={ord._id || ord.id || idx}
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View>
                        <View style={styles.rowCentered}>
                          <Text style={[styles.orderIdText, { color: colors.primary }]}>
                            #{String(ord.id || ord._id).slice(-6)}
                          </Text>
                          <Text style={[styles.orderTypeText, { color: colors.text }]}>
                            ({ord.orderType || ord.type || 'Dine-in'})
                          </Text>
                        </View>
                        <Text style={[styles.customerText, { color: colors.textMuted }]}>
                          Customer: {ord.customerName || ord.user || 'Patron'}
                          {ord.table ? ` • ${ord.table}` : ord.pickupTime ? ` • ${ord.pickupTime}` : ''}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              status === 'Ready' || status === 'Served'
                                ? colors.tint
                                : status === 'Preparing'
                                ? colors.primary
                                : colors.inputBg,
                            borderColor: colors.gold || '#D4AF37'
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                status === 'Ready' || status === 'Served'
                                  ? (colors.success || '#16a34a')
                                  : status === 'Preparing'
                                  ? (colors.onPrimary || '#FFFFFF')
                                  : colors.text
                            }
                          ]}
                        >
                          {status}
                        </Text>
                      </View>
                    </View>

                    {/* Items List */}
                    <View style={[styles.itemsListContainer, { borderColor: colors.border }]}>
                      {(ord.items || []).map((itm, i) => (
                        <View key={i} style={styles.orderItemLine}>
                          <Text style={[styles.orderItemName, { color: colors.text }]}>
                            {itm.quantity || itm.qty}x {itm.name}
                          </Text>
                          <Text style={[styles.orderItemPrice, { color: colors.primary }]}>
                            {CURRENCY_SYMBOL} {((itm.price || 0) * (itm.quantity || itm.qty || 1)).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Footer Actions */}
                    <View style={[styles.cardFooterRow, { borderColor: colors.border }]}>
                      <Text style={[styles.totalText, { color: colors.primary }]}>
                        Total: {CURRENCY_SYMBOL} {(ord.total || 0).toLocaleString()}
                      </Text>

                      {nextStatus ? (
                        <TouchableOpacity
                          disabled={isUpdating}
                          onPress={() => handleAdvanceOrderStatus(ord)}
                          style={[styles.advanceBtn, { backgroundColor: colors.primary, opacity: isUpdating ? 0.6 : 1 }]}
                        >
                          <Sparkles size={14} color={colors.gold || '#D4AF37'} />
                          <Text style={[styles.advanceBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>
                            {isUpdating ? 'Advancing...' : `Advance: ${nextStatus} →`}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.rowCentered}>
                          <CheckCircle2 size={14} color={colors.success || '#16a34a'} />
                          <Text style={[styles.fulfilledText, { color: colors.success || '#16a34a' }]}>
                            Order Fulfilled
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: RESERVATIONS MANAGEMENT */}
        {activeTab === 'reservations' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
                Table Bookings
              </Text>
              <TouchableOpacity
                onPress={loadReservations}
                style={[styles.refreshBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                {reservationsLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <RefreshCw size={14} color={colors.primary} />
                )}
                <Text style={[styles.refreshText, { color: colors.primary }]}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {reservationsError && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorBoxText}>{reservationsError}</Text>
              </View>
            )}

            {reservations.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Calendar size={36} color={colors.textMuted} style={{ opacity: 0.4 }} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No table reservations booked yet.</Text>
              </View>
            ) : (
              reservations.map((res, idx) => {
                const isUpdating = updatingResId === (res._id || res.id);
                const isPending = res.status === 'Pending';

                return (
                  <View
                    key={res._id || res.id || idx}
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View>
                        <Text style={[styles.guestName, { color: colors.primary }]}>
                          {res.guestName || res.customerName || 'Guest Patron'}
                        </Text>
                        <View style={styles.rowCentered}>
                          <Calendar size={12} color={colors.textMuted} />
                          <Text style={[styles.subDetailText, { color: colors.textMuted }]}>
                            {res.date} at {res.timeSlot}
                          </Text>
                          <Text style={{ color: colors.textMuted, marginHorizontal: 4 }}>•</Text>
                          <Users size={12} color={colors.textMuted} />
                          <Text style={[styles.subDetailText, { color: colors.textMuted }]}>
                            {res.partySize} Guests
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              res.status === 'Confirmed' || res.status === 'Accepted'
                                ? colors.tint
                                : res.status === 'Declined' || res.status === 'Cancelled'
                                ? (isDark ? '#3E181A' : '#FDE8E8')
                                : colors.inputBg,
                            borderColor: colors.border
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                res.status === 'Confirmed' || res.status === 'Accepted'
                                  ? (colors.success || '#16a34a')
                                  : res.status === 'Declined' || res.status === 'Cancelled'
                                  ? (colors.danger || '#ef4444')
                                  : colors.text
                            }
                          ]}
                        >
                          {res.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reservationDetailRow}>
                      <View style={styles.rowCentered}>
                        <Phone size={13} color={colors.textMuted} />
                        <Text style={[styles.phoneText, { color: colors.textMuted }]}>
                          {res.phone || '0300-1234567'}
                        </Text>
                      </View>
                      <Text style={[styles.tableText, { color: colors.text }]}>
                        {res.tableName || `Table ${res.tableNumber || 3}`}
                      </Text>
                    </View>

                    {/* Decision Buttons */}
                    {isPending && (
                      <View style={[styles.decisionRow, { borderColor: colors.border }]}>
                        <TouchableOpacity
                          disabled={isUpdating}
                          onPress={() => handleReservationAction(res, 'Confirmed')}
                          style={[styles.acceptBtn, { backgroundColor: colors.primary, opacity: isUpdating ? 0.6 : 1 }]}
                        >
                          <Check size={14} color={colors.onPrimary || '#FFFFFF'} />
                          <Text style={[styles.decisionBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>
                            Accept
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          disabled={isUpdating}
                          onPress={() => handleReservationAction(res, 'Declined')}
                          style={[
                            styles.declineBtn,
                            {
                              backgroundColor: isDark ? '#3E181A' : '#FDE8E8',
                              borderColor: colors.danger || '#ef4444',
                              opacity: isUpdating ? 0.6 : 1
                            }
                          ]}
                        >
                          <X size={14} color={colors.danger || '#ef4444'} />
                          <Text style={[styles.decisionBtnText, { color: colors.danger || '#ef4444' }]}>
                            Decline
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 3: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
                Menu Offerings ({menuItems.length} items)
              </Text>
              <View style={styles.rowCentered}>
                <TouchableOpacity
                  onPress={() => setShowAddDishModal(true)}
                  style={[styles.addDishBtn, { backgroundColor: colors.primary }]}
                >
                  <Plus size={14} color={colors.onPrimary || '#FFFFFF'} />
                  <Text style={[styles.addDishBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>
                    Add Dish
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={loadMenu}
                  style={[styles.refreshIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  {menuLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <RefreshCw size={14} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {menuItems.map(item => {
              const isEditingThisPrice = editingPriceId === (item._id || item.id);
              const isAvailable = item.isAvailable !== false;

              return (
                <View
                  key={item._id || item.id}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.menuMainRow}>
                    <View style={styles.menuInfoBox}>
                      <Text style={[styles.dishTitle, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.dishDesc, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.miniBadge, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                          <Text style={[styles.miniBadgeText, { color: colors.primary }]}>{item.category}</Text>
                        </View>
                        {item.isSpecial && (
                          <View style={[styles.miniBadge, { backgroundColor: colors.tint, borderColor: colors.gold }]}>
                            <Text style={[styles.miniBadgeText, { color: colors.primary }]}>★ Chef Special</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.menuPriceActionBox}>
                      {isEditingThisPrice ? (
                        <View style={styles.editPriceRow}>
                          <TextInput
                            keyboardType="numeric"
                            value={String(newPriceValue)}
                            onChangeText={setNewPriceValue}
                            style={[styles.priceInput, { backgroundColor: colors.inputBg, borderColor: colors.primary, color: colors.text }]}
                            placeholder="Price"
                          />
                          <TouchableOpacity onPress={() => handleSavePrice(item)} style={styles.saveCheckBtn}>
                            <Check size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setEditingPriceId(null)} style={[styles.cancelXBtn, { borderColor: colors.border }]}>
                            <X size={14} color={colors.text} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.rowCentered}>
                          <Text style={[styles.priceText, { color: colors.primary }]}>
                            {CURRENCY_SYMBOL} {item.price?.toLocaleString()}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingPriceId(item._id || item.id);
                              setNewPriceValue(String(item.price));
                            }}
                            style={[styles.editIconBtn, { borderColor: colors.border }]}
                          >
                            <Edit2 size={12} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      )}

                      <Text style={[styles.availabilityText, { color: isAvailable ? (colors.success || '#16a34a') : (colors.danger || '#ef4444') }]}>
                        {isAvailable ? '● Available' : '● Sold Out'}
                      </Text>
                    </View>
                  </View>

                  {/* Action Row */}
                  <View style={[styles.menuBottomActionRow, { borderColor: colors.border }]}>
                    <TouchableOpacity
                      onPress={() => handleToggleAvailability(item)}
                      style={[
                        styles.toggleAvailBtn,
                        {
                          backgroundColor: isAvailable ? (colors.inputBg || '#F5F5F4') : (colors.tint || 'rgba(180, 83, 9, 0.1)'),
                          borderColor: colors.border
                        }
                      ]}
                    >
                      {isAvailable ? (
                        <EyeOff size={13} color={colors.text} />
                      ) : (
                        <Eye size={13} color={colors.primary} />
                      )}
                      <Text style={[styles.toggleAvailText, { color: isAvailable ? colors.text : colors.primary }]}>
                        {isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteDish(item)}
                      style={[
                        styles.deleteDishBtn,
                        {
                          backgroundColor: isDark ? '#3E181A' : '#FDE8E8',
                          borderColor: colors.danger || '#ef4444'
                        }
                      ]}
                    >
                      <Trash2 size={13} color={colors.danger || '#ef4444'} />
                      <Text style={[styles.deleteDishText, { color: colors.danger || '#ef4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Modal: Add New Dish */}
        <Modal
          visible={showAddDishModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddDishModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.modalHeader, { borderColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.primary }]}>Add New Dish</Text>
                <TouchableOpacity onPress={() => setShowAddDishModal(false)} style={[styles.modalCloseBtn, { borderColor: colors.border }]}>
                  <X size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Dish Name *</Text>
                <TextInput
                  value={newDish.name}
                  onChangeText={txt => setNewDish({ ...newDish, name: txt })}
                  style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. Saffron Dum Gosht"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.fieldLabel, { color: colors.text }]}>Category *</Text>
                <View style={styles.categoryPickerRow}>
                  {CATEGORIES.map(cat => {
                    const isSelected = newDish.category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setNewDish({ ...newDish, category: cat })}
                        style={[
                          styles.catPill,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.inputBg,
                            borderColor: isSelected ? (colors.gold || '#D4AF37') : colors.border
                          }
                        ]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? (colors.onPrimary || '#FFFFFF') : colors.text }}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { color: colors.text }]}>Price (PKR) *</Text>
                <TextInput
                  keyboardType="numeric"
                  value={newDish.price}
                  onChangeText={txt => setNewDish({ ...newDish, price: txt })}
                  style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. 1850"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.fieldLabel, { color: colors.text }]}>Description</Text>
                <TextInput
                  multiline
                  numberOfLines={2}
                  value={newDish.description}
                  onChangeText={txt => setNewDish({ ...newDish, description: txt })}
                  style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, height: 60 }]}
                  placeholder="Heritage recipe cooked with aromatic spices..."
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.fieldLabel, { color: colors.text }]}>Image URL</Text>
                <TextInput
                  value={newDish.image}
                  onChangeText={txt => setNewDish({ ...newDish, image: txt })}
                  style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, fontSize: 11 }]}
                  placeholder="https://..."
                  placeholderTextColor={colors.textMuted}
                />

                {/* Chef Special Checkbox */}
                <TouchableOpacity
                  onPress={() => setNewDish({ ...newDish, isSpecial: !newDish.isSpecial })}
                  style={styles.checkboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: newDish.isSpecial ? colors.primary : colors.inputBg,
                        borderColor: newDish.isSpecial ? (colors.gold || '#D4AF37') : colors.border
                      }
                    ]}
                  >
                    {newDish.isSpecial && <Check size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                    Mark as Chef's Daily Special
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    onPress={() => setShowAddDishModal(false)}
                    style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                  >
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCreateDish}
                    style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={{ color: colors.onPrimary || '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Save Dish</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    marginBottom: 14
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1
  },
  verifiedText: { fontSize: 11, fontWeight: 'bold' },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  feedbackText: { fontSize: 12, fontWeight: '600', flex: 1 },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabContent: { gap: 12 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionHeading: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  refreshText: { fontSize: 11, fontWeight: '600' },
  refreshIconBtn: { padding: 7, borderRadius: 8, borderWidth: 1 },
  card: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowCentered: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderIdText: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  orderTypeText: { fontSize: 12, fontWeight: '600' },
  customerText: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  itemsListContainer: { marginTop: 10, paddingTop: 6, borderTopWidth: 1 },
  orderItemLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  orderItemName: { fontSize: 12 },
  orderItemPrice: { fontSize: 12, fontWeight: 'bold' },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1
  },
  totalText: { fontSize: 13, fontWeight: 'bold' },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  advanceBtnText: { fontSize: 11, fontWeight: 'bold' },
  fulfilledText: { fontSize: 11, fontWeight: '600' },
  guestName: { fontSize: 14, fontWeight: 'bold' },
  subDetailText: { fontSize: 11 },
  reservationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  phoneText: { fontSize: 11 },
  tableText: { fontSize: 11, fontWeight: '600' },
  decisionRow: { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1
  },
  decisionBtnText: { fontSize: 11, fontWeight: 'bold' },
  addDishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  addDishBtnText: { fontSize: 11, fontWeight: 'bold' },
  menuMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  menuInfoBox: { flex: 1, paddingRight: 8 },
  dishTitle: { fontSize: 14, fontWeight: 'bold' },
  dishDesc: { fontSize: 11, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  miniBadgeText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  menuPriceActionBox: { alignItems: 'flex-end' },
  priceText: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  editIconBtn: { padding: 4, borderRadius: 6, borderWidth: 1 },
  editPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceInput: { width: 70, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, fontSize: 12 },
  saveCheckBtn: { padding: 5, borderRadius: 6, backgroundColor: '#059669' },
  cancelXBtn: { padding: 5, borderRadius: 6, borderWidth: 1 },
  availabilityText: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  menuBottomActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1
  },
  toggleAvailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  toggleAvailText: { fontSize: 11, fontWeight: '500' },
  deleteDishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  deleteDishText: { fontSize: 11, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: 16, borderWidth: 1, padding: 16, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalCloseBtn: { padding: 4, borderRadius: 6, borderWidth: 1 },
  modalForm: { marginTop: 10 },
  fieldLabel: { fontSize: 11, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  textInput: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, fontSize: 12 },
  categoryPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 14 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  checkboxLabel: { fontSize: 12, fontWeight: '500' },
  modalBtnRow: { flexDirection: 'row', gap: 8, marginTop: 8, paddingBottom: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  modalSaveBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  emptyBox: { padding: 24, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyText: { fontSize: 12 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 8
  },
  errorBoxText: { color: '#DC2626', fontSize: 11, fontWeight: '600' },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  deniedCard: { padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', maxWidth: 300 },
  deniedTitle: { fontSize: 16, fontWeight: 'bold' },
  deniedSubtitle: { fontSize: 11, textAlign: 'center', marginVertical: 8 },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }
});