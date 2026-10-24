import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { apiClient } from '../api/client';
import { CURRENCY_SYMBOL } from '../data/brand';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Sparkles,
  Utensils,
  XCircle,
  Receipt,
  Search,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  RotateCcw,
  AlertCircle,
  Calendar,
  MapPin
} from 'lucide-react-native';

export default function OrderHistoryScreen({ onNavigate }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { addToCart } = useCart();

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'completed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded order IDs for full breakdown view
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Cancellation feedback state
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  /**
   * Fetch orders from API with safe array fallback
   */
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let fetchedList = [];
      const response = await apiClient.get('/api/orders');

      if (Array.isArray(response)) {
        fetchedList = response;
      } else if (response && Array.isArray(response.data)) {
        fetchedList = response.data;
      }

      // Sort newest first
      fetchedList.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setOrders(fetchedList);
    } catch (err) {
      setError('Server Connection Failed: Could not retrieve orders from MongoDB database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Toggle order card expansion
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Reorder action
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;

    let countAdded = 0;
    order.items.forEach((item) => {
      const dishObj = {
        id: item.menuItem || item.id || `dish_${item.name}`,
        _id: item.menuItem || item.id || `dish_${item.name}`,
        name: item.name,
        price: item.price || 500,
        category: 'Mains',
        isAvailable: true
      };
      const qty = item.qty || item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        addToCart(dishObj, item.note || '');
        countAdded++;
      }
    });

    setActionMessage(`Added ${countAdded} item(s) from Order #${order.id || order.orderNumber || ''} to your Cart!`);
    setTimeout(() => {
      setActionMessage(null);
      if (onNavigate) onNavigate('Cart');
    }, 1200);
  };

  // Customer order cancellation
  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(orderId);
            try {
              await apiClient.patch(`/api/orders/${orderId}/cancel`);

              setOrders((prev) =>
                prev.map((o) => {
                  if (o.id === orderId || o._id === orderId) {
                    return { ...o, status: 'Cancelled' };
                  }
                  return o;
                })
              );

              setActionMessage('Order was successfully cancelled in MongoDB.');
              setTimeout(() => setActionMessage(null), 3000);
            } catch (err) {
              Alert.alert(
                'Cancellation Failed',
                'Server Connection Failed: Could not update order in MongoDB database.'
              );
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  // Status badge stylings & icons
  const getStatusBadge = (status) => {
    const s = status || 'Pending';
    switch (s) {
      case 'Pending':
        return {
          label: 'Order Placed',
          icon: Clock,
          bg: isDark ? '#3D2F17' : '#FEF3C7',
          color: '#D97706',
          border: '#F59E0B'
        };
      case 'Preparing':
        return {
          label: 'In Kitchen',
          icon: ChefHat,
          bg: isDark ? '#2E1E3B' : '#EDE9FE',
          color: '#8B5CF6',
          border: '#A78BFA'
        };
      case 'Ready':
        return {
          label: 'Ready for Service',
          icon: Sparkles,
          bg: isDark ? '#3B3216' : '#FEF9C3',
          color: colors.gold || '#D4AF37',
          border: colors.gold || '#D4AF37'
        };
      case 'Served':
        return {
          label: 'Served & Completed',
          icon: CheckCircle2,
          bg: isDark ? '#143521' : '#DCFCE7',
          color: '#16A34A',
          border: '#22C55E'
        };
      case 'Cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          bg: isDark ? '#3E181A' : '#FEE2E2',
          color: '#EF4444',
          border: '#F87171'
        };
      default:
        return {
          label: s,
          icon: Receipt,
          bg: isDark ? '#261B20' : '#F3F4F6',
          color: colors.textMuted,
          border: colors.border
        };
    }
  };

  // Format date
  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const activeCount = orders.filter((o) => ['Pending', 'Preparing', 'Ready'].includes(o.status)).length;
    const totalSpent = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.grandTotal || o.total || o.subtotal || 0), 0);

    return { totalCount, activeCount, totalSpent };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeFilter === 'active') {
        if (!['Pending', 'Preparing', 'Ready'].includes(order.status)) return false;
      } else if (activeFilter === 'completed') {
        if (order.status !== 'Served') return false;
      } else if (activeFilter === 'cancelled') {
        if (order.status !== 'Cancelled') return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const orderIdMatch = String(order.id || order._id || order.orderNumber || '').toLowerCase().includes(query);
        const itemMatch = (order.items || []).some((item) => (item.name || '').toLowerCase().includes(query));
        const tableMatch = String(order.table || '').toLowerCase().includes(query);
        if (!orderIdMatch && !itemMatch && !tableMatch) return false;
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Navigation & Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerTitleRow}>
              <TouchableOpacity
                onPress={() => (onNavigate ? onNavigate('Profile') : null)}
                style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityLabel="Back to Profile"
              >
                <ArrowLeft size={16} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.primary }]}>
                Order History
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Authenticated patron: <Text style={{ fontWeight: '600', color: colors.text }}>{user?.name || 'Ahmed Khan'}</Text> ({user?.email || 'customer@dastaan.pk'})
            </Text>
          </View>

          {/* Action buttons: Refresh and New Order */}
          <View style={styles.headerActionBtns}>
            <TouchableOpacity
              onPress={() => fetchOrders(true)}
              disabled={refreshing}
              style={[styles.headerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <RefreshCw size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                {refreshing ? 'Syncing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => (onNavigate ? onNavigate('Menu') : null)}
              style={[styles.newOrderBtn, { backgroundColor: colors.primary }]}
            >
              <ShoppingBag size={14} color={colors.onPrimary || '#FFFFFF'} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: '600' }}>New Order</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action toast message */}
        {actionMessage && (
          <View style={[styles.actionBanner, { backgroundColor: colors.surface, borderColor: colors.gold || '#D4AF37' }]}>
            <Sparkles size={16} color={colors.gold || '#D4AF37'} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.gold || '#D4AF37', fontSize: 12, fontWeight: '600', flex: 1 }}>
              {actionMessage}
            </Text>
          </View>
        )}

        {/* Metrics Overview Cards (Native 3-Column Row) */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Orders</Text>
            <Text style={[styles.metricValue, { color: colors.primary }]}>{metrics.totalCount}</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>In Kitchen</Text>
            <Text style={[styles.metricValue, { color: colors.gold || '#D4AF37' }]}>{metrics.activeCount}</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Dining</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {CURRENCY_SYMBOL} {metrics.totalSpent.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Search Bar & Filter Chips Container */}
        <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Search Input */}
          <View style={[styles.searchBox, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}>
            <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by dish name, order #, or table..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              {
                id: 'active',
                label: 'Active / Live',
                count: orders.filter((o) => ['Pending', 'Preparing', 'Ready'].includes(o.status)).length
              },
              {
                id: 'completed',
                label: 'Served',
                count: orders.filter((o) => o.status === 'Served').length
              },
              {
                id: 'cancelled',
                label: 'Cancelled',
                count: orders.filter((o) => o.status === 'Cancelled').length
              }
            ].map((chip) => {
              const isSelected = activeFilter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => setActiveFilter(chip.id)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? colors.primary : (colors.inputBg || '#F5F5F4'),
                      borderColor: isSelected ? colors.primary : colors.border
                    }
                  ]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: isSelected ? (colors.onPrimary || '#FFFFFF') : colors.text }}>
                    {chip.label}
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : (colors.tint || 'rgba(180, 83, 9, 0.1)') }
                    ]}
                  >
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: isSelected ? (colors.onPrimary || '#FFFFFF') : colors.primary }}>
                      {chip.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
              Retrieving dining archives from MongoDB...
            </Text>
          </View>
        )}

        {/* Error State */}
        {!loading && error && (
          <View style={[styles.centerBox, styles.errorBox, { backgroundColor: isDark ? '#3E181A' : '#FEE2E2', borderColor: colors.danger || '#EF4444' }]}>
            <AlertCircle size={32} color={colors.danger || '#EF4444'} />
            <Text style={[styles.errorTitle, { color: colors.danger || '#EF4444' }]}>{error}</Text>
            <TouchableOpacity onPress={() => fetchOrders()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <View style={[styles.centerBox, styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)' }]}>
              <Utensils size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.primary }]}>No Orders Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {searchQuery
                ? `No orders matched "${searchQuery}".`
                : 'You have not placed any orders yet. Discover our Royal Mughlai delicacies.'}
            </Text>
            <TouchableOpacity
              onPress={() => (onNavigate ? onNavigate('Menu') : null)}
              style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            >
              <ShoppingBag size={14} color={colors.onPrimary || '#FFFFFF'} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.onPrimary || '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Explore Heritage Menu</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <View style={styles.ordersListWrapper}>
            {filteredOrders.map((order) => {
              const orderId = String(order.id || order._id || order.orderNumber || 'ORD-RECENT');
              const isExpanded = expandedIds.has(orderId);
              const statusCfg = getStatusBadge(order.status);
              const StatusIcon = statusCfg.icon;
              const isLive = ['Pending', 'Preparing', 'Ready'].includes(order.status);
              const canCancel = order.status === 'Pending';
              const grandTotal = order.grandTotal || order.total || order.subtotal || 0;
              const itemsList = order.items || [];

              return (
                <View
                  key={orderId}
                  style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  {/* Card Header */}
                  <View style={[styles.orderCardHeader, { borderColor: colors.border }]}>
                    <View style={styles.cardHeaderTop}>
                      <View style={styles.rowCentered}>
                        <Text style={[styles.orderIdText, { color: colors.primary }]}>
                          #{orderId.length > 8 ? orderId.slice(-6) : orderId}
                        </Text>
                        <View style={[styles.typeBadge, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}>
                          <Text style={[styles.typeBadgeText, { color: colors.textMuted }]}>
                            {order.orderType || order.type || 'Dine-in'}
                          </Text>
                        </View>
                      </View>

                      {/* Status Tag */}
                      <View style={[styles.statusTag, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                        <StatusIcon size={12} color={statusCfg.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusTagText, { color: statusCfg.color }]}>
                          {statusCfg.label}
                        </Text>
                      </View>
                    </View>

                    {/* Metadata: Date, Table, or Pickup time */}
                    <View style={styles.metadataRow}>
                      <View style={styles.metaItem}>
                        <Calendar size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                        <Text style={[styles.metaText, { color: colors.textMuted }]}>{formatDate(order.createdAt)}</Text>
                      </View>

                      {(order.table || order.orderType === 'Dine-in') && (
                        <View style={styles.metaItem}>
                          <MapPin size={12} color={colors.gold || '#D4AF37'} style={{ marginRight: 4 }} />
                          <Text style={[styles.metaText, { color: colors.textMuted }]}>{order.table || 'Table Seated'}</Text>
                        </View>
                      )}

                      {(order.pickupTime || order.orderType === 'Takeaway') && (
                        <View style={styles.metaItem}>
                          <Clock size={12} color={colors.gold || '#D4AF37'} style={{ marginRight: 4 }} />
                          <Text style={[styles.metaText, { color: colors.textMuted }]}>Pickup: {order.pickupTime || 'Standard'}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Dish Items Snapshot */}
                  <View style={styles.orderCardBody}>
                    <View style={styles.itemsSnapshot}>
                      {itemsList.slice(0, isExpanded ? itemsList.length : 2).map((item, idx) => (
                        <View key={idx} style={styles.itemLine}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={[styles.itemLineTitle, { color: colors.text }]}>
                              {item.qty || item.quantity || 1}x {item.name}
                            </Text>
                            {item.note ? (
                              <Text style={[styles.itemLineNote, { color: colors.textMuted }]}>
                                Note: {item.note}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={[styles.itemLinePrice, { color: colors.text }]}>
                            {CURRENCY_SYMBOL} {((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString()}
                          </Text>
                        </View>
                      ))}

                      {!isExpanded && itemsList.length > 2 && (
                        <Text style={[styles.moreItemsText, { color: colors.gold || '#D4AF37' }]}>
                          + {itemsList.length - 2} more item(s)...
                        </Text>
                      )}
                    </View>

                    {/* Financial Receipt Breakdown (visible when expanded) */}
                    {isExpanded && (
                      <View style={[styles.receiptBreakdown, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}>
                        <View style={styles.receiptLine}>
                          <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>Subtotal</Text>
                          <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>
                            {CURRENCY_SYMBOL} {(order.subtotal || grandTotal).toLocaleString()}
                          </Text>
                        </View>

                        {order.serviceCharge > 0 && (
                          <View style={styles.receiptLine}>
                            <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>5% Service Charge</Text>
                            <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>
                              {CURRENCY_SYMBOL} {order.serviceCharge.toLocaleString()}
                            </Text>
                          </View>
                        )}

                        {order.tax > 0 && (
                          <View style={styles.receiptLine}>
                            <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>15% Sales Tax</Text>
                            <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>
                              {CURRENCY_SYMBOL} {order.tax.toLocaleString()}
                            </Text>
                          </View>
                        )}

                        {order.discount > 0 && (
                          <View style={styles.receiptLine}>
                            <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: '500' }}>
                              Promo Discount {order.promoCode ? `(${order.promoCode})` : ''}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: 'bold' }}>
                              - {CURRENCY_SYMBOL} {order.discount.toLocaleString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Total Row */}
                    <View style={[styles.grandTotalRow, { borderColor: colors.border }]}>
                      <Text style={[styles.grandTotalLabel, { color: colors.textMuted }]}>Grand Total</Text>
                      <Text style={[styles.grandTotalValue, { color: colors.primary }]}>
                        {CURRENCY_SYMBOL} {grandTotal.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Card Actions Footer */}
                  <View style={[styles.orderCardFooter, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}>
                    {/* Toggle Details Button */}
                    <TouchableOpacity
                      onPress={() => toggleExpand(orderId)}
                      style={styles.rowCentered}
                    >
                      <Text style={[styles.expandToggleText, { color: colors.primary }]}>
                        {isExpanded ? 'Hide Details' : 'Full Receipt'}
                      </Text>
                      {isExpanded ? (
                        <ChevronUp size={14} color={colors.primary} />
                      ) : (
                        <ChevronDown size={14} color={colors.primary} />
                      )}
                    </TouchableOpacity>

                    {/* Right-aligned Buttons: Cancel, Reorder, Track Live */}
                    <View style={styles.footerBtnsRight}>
                      {canCancel && (
                        <TouchableOpacity
                          onPress={() => handleCancelOrder(orderId)}
                          disabled={cancellingId === orderId}
                          style={[styles.cancelBtn, { borderColor: colors.danger || '#EF4444' }]}
                        >
                          <Text style={[styles.cancelBtnText, { color: colors.danger || '#EF4444' }]}>
                            {cancellingId === orderId ? '...' : 'Cancel'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => handleReorder(order)}
                        style={[styles.reorderBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <RotateCcw size={12} color={colors.gold || '#D4AF37'} style={{ marginRight: 4 }} />
                        <Text style={[styles.reorderBtnText, { color: colors.text }]}>Reorder</Text>
                      </TouchableOpacity>

                      {isLive && (
                        <TouchableOpacity
                          onPress={() => (onNavigate ? onNavigate('Orders', orderId) : null)}
                          style={[styles.trackLiveBtn, { backgroundColor: colors.primary }]}
                        >
                          <Text style={[styles.trackLiveBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>Track</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },
  header: { marginBottom: 14 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backBtn: { padding: 6, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11 },
  headerActionBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  newOrderBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12
  },
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  metricCard: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, elevation: 1 },
  metricLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  metricValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  filterContainer: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 40, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 12, height: '100%' },
  filterScroll: { flexDirection: 'row', gap: 6 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  countBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, marginLeft: 6 },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { borderWidth: 1, borderRadius: 16 },
  emptyIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold' },
  emptySubtitle: { fontSize: 12, textAlign: 'center', marginTop: 6, maxWidth: 260 },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 14 },
  errorBox: { borderWidth: 1, borderRadius: 14 },
  errorTitle: { fontSize: 13, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 10 },
  ordersListWrapper: { gap: 12 },
  orderCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  orderCardHeader: { padding: 12, borderBottomWidth: 1 },
  cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCentered: { flexDirection: 'row', alignItems: 'center' },
  orderIdText: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginRight: 6 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  typeBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  statusTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  statusTagText: { fontSize: 11, fontWeight: 'bold' },
  metadataRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11 },
  orderCardBody: { padding: 12 },
  itemsSnapshot: { gap: 6 },
  itemLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemLineTitle: { fontSize: 12, fontWeight: '600' },
  itemLineNote: { fontSize: 11, fontStyle: 'italic', marginTop: 1 },
  itemLinePrice: { fontSize: 12, fontWeight: '600' },
  moreItemsText: { fontSize: 11, fontWeight: '600', paddingTop: 2 },
  receiptBreakdown: { padding: 10, borderRadius: 10, borderWidth: 1, marginTop: 10, gap: 4 },
  receiptLine: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptLabel: { fontSize: 11 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  grandTotalLabel: { fontSize: 12, fontWeight: '600' },
  grandTotalValue: { fontSize: 16, fontWeight: 'bold' },
  orderCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  expandToggleText: { fontSize: 11, fontWeight: 'bold', marginRight: 2 },
  footerBtnsRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cancelBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  cancelBtnText: { fontSize: 11, fontWeight: 'bold' },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  reorderBtnText: { fontSize: 11, fontWeight: '600' },
  trackLiveBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  trackLiveBtnText: { fontSize: 11, fontWeight: 'bold' }
});