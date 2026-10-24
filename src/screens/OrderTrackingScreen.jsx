import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { CURRENCY_SYMBOL } from '../data/brand';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Utensils,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Receipt
} from 'lucide-react-native';

// Status Progression Flow (A2 Q7 Requirement 2 & A1 Q10 Requirement 2)
const STEPS = [
  { key: 'Pending', label: 'Order Received', icon: Clock, desc: 'Kitchen is reviewing your order' },
  { key: 'Preparing', label: 'In Kitchen', icon: ChefHat, desc: 'Master chefs are grilling your meal' },
  { key: 'Ready', label: 'Order Ready', icon: Sparkles, desc: 'Hot & ready for table service / pickup' },
  { key: 'Served', label: 'Served', icon: Utensils, desc: 'Dining experience in progress' }
];

export default function OrderTrackingScreen({ orderId, onNavigate }) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  // Active tracked order state
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  // Elapsed time state in seconds (A1 Q10 Requirement 3)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Cancellation state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Polling interval ref & timer ref for clean unmount
  const pollIntervalRef = useRef(null);
  const elapsedTimerRef = useRef(null);

  // Fetch live order status from server
  const fetchOrderStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const endpoint = orderId ? `/api/orders/${orderId}` : '/api/orders';
      const response = await apiClient.get(endpoint);

      let targetOrder = null;

      if (orderId) {
        if (response && (response.id === orderId || response._id === orderId)) {
          targetOrder = response;
        } else if (response?.data && (response.data.id === orderId || response.data._id === orderId)) {
          targetOrder = response.data;
        } else if (Array.isArray(response)) {
          targetOrder = response.find(o => o.id === orderId || o._id === orderId);
        } else if (Array.isArray(response?.data)) {
          targetOrder = response.data.find(o => o.id === orderId || o._id === orderId);
        }
      } else {
        const list = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
        if (list.length > 0) {
          targetOrder = list[0];
        }
      }

      if (targetOrder) {
        setOrder(targetOrder);
        setError(null);
        setPollCount(prev => prev + 1);
      } else {
        if (!silent) {
          setError('No active order found. Please place an order or check your Order History.');
        }
      }
    } catch (err) {
      if (!silent) {
        setError('Server Connection Failed: Could not retrieve live order status.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load and 10s polling interval
  useEffect(() => {
    fetchOrderStatus(false);

    pollIntervalRef.current = setInterval(() => {
      fetchOrderStatus(true);
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orderId]);

  // Elapsed timer tick (1 second)
  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, []);

  // Format elapsed seconds as MM:SS
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const currentStatus = order?.status || 'Pending';
  const isCancelled = currentStatus === 'Cancelled';
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStatus);

  // Customer cancel handler with native Alert.alert
  const handleCancelOrder = () => {
    if (!order) return;

    if (order.status !== 'Pending') {
      Alert.alert(
        'Cancellation Restricted',
        `Cannot cancel order once the kitchen has started preparing it (Status: ${order.status}).`
      );
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be reversed.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            setCancelError(null);
            try {
              await apiClient.patch(`/api/orders/${order.id || order._id}/cancel`);
              setOrder(prev => ({ ...prev, status: 'Cancelled' }));
            } catch (err) {
              setCancelError('Server Connection Failed: Could not update order in MongoDB.');
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Navigation & Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity
              onPress={() => onNavigate && onNavigate('Menu')}
              style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Back to Menu"
            >
              <ArrowLeft size={16} color={colors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: colors.primary }]}>
                Live Order Tracker
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                Auto-refreshes every 10s via background polling
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => onNavigate && onNavigate('OrderHistory')}
              style={[styles.historyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Receipt size={14} color={colors.gold || '#D4AF37'} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => fetchOrderStatus(false)}
              style={[styles.refreshIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <RefreshCw size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Polling & Live Elapsed Timer Bar */}
        <View style={[styles.timerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.timerLeft}>
            <View style={[styles.clockIconBox, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)' }]}>
              <Clock size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.timerLabel, { color: colors.textMuted }]}>
                Live Elapsed Time
              </Text>
              <Text style={[styles.timerValue, { color: colors.text }]}>
                {formatTime(elapsedSeconds)}
              </Text>
            </View>
          </View>

          <View style={styles.timerRight}>
            <View style={styles.pollingStatusRow}>
              <View style={[styles.liveDot, { backgroundColor: colors.gold || '#D4AF37' }]} />
              <Text style={[styles.pollCountText, { color: colors.primary }]}>
                Polling #{pollCount}
              </Text>
            </View>
            <Text style={[styles.pollSubtext, { color: colors.textMuted }]}>
              Refreshes every 10s
            </Text>
          </View>
        </View>

        {/* Cancel Error Notification */}
        {cancelError && (
          <View style={[styles.errorNotification, { backgroundColor: isDark ? '#3E181A' : '#FDE8E8', borderColor: colors.danger || '#EF4444' }]}>
            <AlertCircle size={15} color={colors.danger || '#EF4444'} style={{ marginRight: 6 }} />
            <Text style={[styles.errorNotificationText, { color: colors.danger || '#EF4444' }]}>{cancelError}</Text>
          </View>
        )}

        {/* General Error or Empty State */}
        {!order && !loading && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AlertCircle size={36} color={colors.gold || '#D4AF37'} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: colors.primary }]}>
              No Active Order Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {error || 'You do not have any active dining orders in progress right now.'}
            </Text>
            <View style={styles.emptyActionsRow}>
              <TouchableOpacity
                onPress={() => onNavigate && onNavigate('Menu')}
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                  Explore Menu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onNavigate && onNavigate('OrderHistory')}
                style={[styles.outlineActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
                  View History
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 4-Step Progress Indicator */}
        {order && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.stepperHeader, { borderColor: colors.border }]}>
              <View>
                <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                  Kitchen Progression
                </Text>
                <Text style={[styles.orderIdSub, { color: colors.text }]}>
                  Order #{String(order?.id || order?._id || 'ORD-ACTIVE').slice(-6)}
                </Text>
              </View>

              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor: isCancelled ? (colors.danger || '#EF4444') : (colors.tint || 'rgba(180, 83, 9, 0.1)'),
                    borderColor: colors.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    { color: isCancelled ? '#FFFFFF' : colors.primary }
                  ]}
                >
                  {isCancelled ? 'Cancelled' : currentStatus}
                </Text>
              </View>
            </View>

            {/* Stepper Timeline */}
            {isCancelled ? (
              <View style={styles.cancelledBox}>
                <XCircle size={44} color={colors.danger || '#EF4444'} style={{ marginBottom: 6 }} />
                <Text style={[styles.cancelledTitle, { color: colors.danger || '#EF4444' }]}>
                  Order Has Been Cancelled
                </Text>
                <Text style={[styles.cancelledSubtitle, { color: colors.textMuted }]}>
                  This order was cancelled while pending and will not be prepared.
                </Text>
              </View>
            ) : (
              <View style={styles.timelineList}>
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = currentStepIndex > index;
                  const isCurrent = currentStepIndex === index;

                  return (
                    <View key={step.key} style={styles.stepItemRow}>
                      {/* Connecting vertical line */}
                      {index < STEPS.length - 1 && (
                        <View
                          style={[
                            styles.verticalConnectorLine,
                            {
                              backgroundColor: isCompleted ? colors.primary : colors.border
                            }
                          ]}
                        />
                      )}

                      {/* Step Circle Badge */}
                      <View
                        style={[
                          styles.stepBadge,
                          {
                            backgroundColor: isCompleted
                              ? colors.primary
                              : isCurrent
                              ? (colors.gold || '#D4AF37')
                              : (colors.inputBg || '#F5F5F4'),
                            borderColor: isCurrent ? colors.primary : colors.border
                          }
                        ]}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} color="#FFFFFF" />
                        ) : (
                          <Icon
                            size={16}
                            color={isCurrent ? '#4B1420' : colors.textMuted}
                          />
                        )}
                      </View>

                      {/* Step Details */}
                      <View style={styles.stepContent}>
                        <View style={styles.stepTitleRow}>
                          <Text
                            style={[
                              styles.stepLabel,
                              {
                                color: isCurrent
                                  ? colors.primary
                                  : isCompleted
                                  ? colors.text
                                  : colors.textMuted,
                                fontWeight: isCurrent ? 'bold' : isCompleted ? '600' : '500'
                              }
                            ]}
                          >
                            {step.label}
                          </Text>

                          {isCurrent && (
                            <View style={[styles.inProgressBadge, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)' }]}>
                              <Text style={[styles.inProgressText, { color: colors.primary }]}>
                                In Progress
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textMuted }]}>
                          {step.desc}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Order Details & Summary Card */}
        {order && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>
              Order Contents ({order.items?.length || 0} items)
            </Text>
            <View style={styles.itemsList}>
              {(order.items || []).map((it, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {it.quantity || it.qty || 1}x {it.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    {CURRENCY_SYMBOL} {((it.price || 0) * (it.quantity || it.qty || 1)).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.totalRow, { borderColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total Amount:</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {CURRENCY_SYMBOL} {(order.total || order.grandTotal || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Customer Cancel Button (Permitted strictly while Pending) */}
        {order && !isCancelled && currentStatus === 'Pending' && (
          <TouchableOpacity
            disabled={isCancelling}
            onPress={handleCancelOrder}
            style={[
              styles.cancelOrderBtn,
              {
                backgroundColor: isDark ? '#3E181A' : '#FDE8E8',
                borderColor: colors.danger || '#EF4444'
              }
            ]}
            activeOpacity={0.8}
          >
            <XCircle size={16} color={colors.danger || '#EF4444'} style={{ marginRight: 6 }} />
            <Text style={[styles.cancelBtnText, { color: colors.danger || '#EF4444' }]}>
              {isCancelling ? 'Cancelling Order...' : 'Cancel Order (Only while Pending)'}
            </Text>
          </TouchableOpacity>
        )}
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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { padding: 8, borderRadius: 10, borderWidth: 1, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  refreshIconBtn: { padding: 7, borderRadius: 8, borderWidth: 1 },
  timerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  timerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clockIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timerLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  timerValue: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 },
  timerRight: { alignItems: 'flex-end' },
  pollingStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  pollCountText: { fontSize: 12, fontWeight: '600' },
  pollSubtext: { fontSize: 10, marginTop: 2 },
  errorNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12
  },
  errorNotificationText: { fontSize: 12, flex: 1 },
  emptyCard: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold' },
  emptySubtitle: { fontSize: 12, textAlign: 'center', marginVertical: 8, maxWidth: 280 },
  emptyActionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primaryActionBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  outlineActionBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  stepperHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1 },
  sectionHeading: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderIdSub: { fontSize: 12, fontWeight: '600', fontFamily: 'monospace', marginTop: 2 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 0.5 },
  statusTagText: { fontSize: 11, fontWeight: 'bold' },
  cancelledBox: { alignItems: 'center', paddingVertical: 20 },
  cancelledTitle: { fontSize: 16, fontWeight: 'bold' },
  cancelledSubtitle: { fontSize: 12, textAlign: 'center', marginTop: 4, maxWidth: 260 },
  timelineList: { marginTop: 14 },
  stepItemRow: { flexDirection: 'row', alignItems: 'flex-start', position: 'relative', marginBottom: 20 },
  verticalConnectorLine: { position: 'absolute', left: 15, top: 32, bottom: -20, width: 2 },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 10
  },
  stepContent: { flex: 1, paddingTop: 3 },
  stepTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 14 },
  inProgressBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  inProgressText: { fontSize: 10, fontWeight: 'bold' },
  stepDesc: { fontSize: 11, marginTop: 2 },
  itemsList: { gap: 6, marginTop: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  itemName: { fontSize: 12, flex: 1 },
  itemPrice: { fontSize: 12, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  totalLabel: { fontSize: 12, fontWeight: 'bold' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
  cancelOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  cancelBtnText: { fontSize: 13, fontWeight: 'bold' }
});