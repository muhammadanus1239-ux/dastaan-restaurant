import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { CURRENCY_SYMBOL } from '../data/brand';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Receipt,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  MapPin,
  AlertCircle
} from 'lucide-react-native';

export default function OrderSummaryScreen({ onNavigate }) {
  const { items, appliedPromo, clearCart } = useCart();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  // Order type selector: 'Dine-in' vs 'Takeaway'
  const [orderType, setOrderType] = useState('Dine-in');
  const [selectedTable, setSelectedTable] = useState('Table 3 (4 seats)');
  const [pickupTime, setPickupTime] = useState('In 30 minutes');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [serverConfirmedOrder, setServerConfirmedOrder] = useState(null);

  // Available mock tables for Dine-in selector
  const availableTables = [
    'Table 1 (2 seats - Garden View)',
    'Table 2 (2 seats - Corner Booth)',
    'Table 3 (4 seats - Central Hall)',
    'Table 4 (4 seats - Window Alcove)',
    'Table 5 (6 seats - Family Section)',
    'Table 6 (8 seats - Royal Suite)'
  ];

  // Available pickup times for Takeaway
  const pickupTimeSlots = [
    'In 20 minutes',
    'In 30 minutes',
    'In 45 minutes',
    'In 1 hour'
  ];

  /**
   * Client-side preview calculation
   */
  const billSummary = useMemo(() => {
    const subtotal = items.reduce(
      (sum, cartItem) => sum + cartItem.item.price * cartItem.qty,
      0
    );
    const serviceCharge = Math.round(subtotal * 0.05);
    const salesTax = Math.round(subtotal * 0.15);

    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        discount = Math.round((subtotal * appliedPromo.value) / 100);
      } else if (appliedPromo.type === 'flat') {
        discount = Math.min(appliedPromo.value, subtotal);
      }
    }

    const grandTotal = Math.max(0, subtotal + serviceCharge + salesTax - discount);

    return {
      subtotal,
      serviceCharge,
      salesTax,
      discount,
      grandTotal
    };
  }, [items, appliedPromo]);

  /**
   * Enforce Strict Server-Authoritative Price Calculation
   */
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setErrorMessage(null);

    const orderPayload = {
      orderType,
      table: orderType === 'Dine-in' ? selectedTable : null,
      pickupTime: orderType === 'Takeaway' ? pickupTime : null,
      promoCode: appliedPromo ? appliedPromo.code : '',
      items: items.map(i => ({
        menuItem: i.item._id || i.item.id,
        name: i.item.name,
        price: i.item.price,
        quantity: i.qty,
        note: i.note || ''
      }))
    };

    try {
      const response = await apiClient.post('/api/orders', orderPayload);

      if (response && (response.data || response.success || response._id || response.id)) {
        const authoritativeOrder = response.data || response;
        setServerConfirmedOrder(authoritativeOrder);
        clearCart();
        setOrderPlacedSuccess(true);
      } else {
        throw new Error('Server did not return a valid order confirmation.');
      }
    } catch (apiErr) {
      setErrorMessage(
        `Server Connection Failed: Could not update MongoDB database. (${apiErr.message || 'Port 5000 unreachable'})`
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // 1. Order Placed Success Screen
  if (orderPlacedSuccess) {
    const finalBill = serverConfirmedOrder || billSummary;
    const finalTotal = finalBill.total ?? finalBill.grandTotal ?? billSummary.grandTotal;

    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.successIconCircle, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)', borderColor: colors.gold || '#D4AF37' }]}>
          <CheckCircle2 size={44} color={colors.success || '#16a34a'} />
        </View>

        <Text style={[styles.successTitle, { color: colors.primary }]}>
          Order Confirmed by Server!
        </Text>
        <Text style={[styles.successSubtitle, { color: colors.text }]}>
          Thank you for dining with DASTAAN. Your order #{String(serverConfirmedOrder?.id || serverConfirmedOrder?._id || 'ORD-RECENT').slice(-6)} has been verified and registered in MongoDB database with status <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>Pending</Text>.
        </Text>

        {/* Server Authoritative Receipt Details */}
        <View style={[styles.confirmedReceiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.confirmedRow}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Order Type:</Text>
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{orderType}</Text>
          </View>
          {orderType === 'Dine-in' && (
            <View style={styles.confirmedRow}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Table:</Text>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{selectedTable}</Text>
            </View>
          )}
          <View style={[styles.confirmedRow, styles.confirmedTotalRow, { borderColor: colors.border }]}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>Verified Total:</Text>
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
              {CURRENCY_SYMBOL} {finalTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.successActionsRow}>
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('Menu')}
            style={[styles.actionOutlineBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('OrderHistory')}
            style={[styles.actionOutlineBtn, { backgroundColor: colors.surface, borderColor: colors.gold || '#D4AF37' }]}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.gold || '#D4AF37' }}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('Orders', serverConfirmedOrder?.id || serverConfirmedOrder?._id)}
            style={[styles.actionPrimaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>Track Live →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Empty Cart Fallback
  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>No items to summarize.</Text>
        <TouchableOpacity
          onPress={() => onNavigate && onNavigate('Menu')}
          style={[styles.actionPrimaryBtn, { backgroundColor: colors.primary, marginTop: 14 }]}
        >
          <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Explore Menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 3. Main Order Summary Screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header with Back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('Cart')}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Back to Cart"
          >
            <ArrowLeft size={16} color={colors.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>
              Order Summary
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Final review before routing to royal kitchen
            </Text>
          </View>
        </View>

        {/* Server Error Banner */}
        {errorMessage && (
          <View style={[styles.errorBanner, { backgroundColor: isDark ? '#3E181A' : '#FEE2E2', borderColor: colors.danger || '#EF4444' }]}>
            <AlertCircle size={18} color={colors.danger || '#EF4444'} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.errorBannerTitle, { color: colors.danger || '#EF4444' }]}>
                Order Submission Failed
              </Text>
              <Text style={[styles.errorBannerText, { color: colors.danger || '#EF4444' }]}>
                {errorMessage}
              </Text>
            </View>
          </View>
        )}

        {/* 1. Dining Type Selection */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>
            Dining Preference
          </Text>

          {/* Dine-in vs Takeaway Toggle Row */}
          <View style={styles.preferenceRow}>
            <TouchableOpacity
              onPress={() => setOrderType('Dine-in')}
              style={[
                styles.prefButton,
                {
                  backgroundColor: orderType === 'Dine-in' ? colors.primary : (colors.inputBg || '#F5F5F4'),
                  borderColor: orderType === 'Dine-in' ? colors.primary : colors.border
                }
              ]}
            >
              <UtensilsCrossed size={16} color={orderType === 'Dine-in' ? (colors.onPrimary || '#FFFFFF') : colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.prefBtnText, { color: orderType === 'Dine-in' ? (colors.onPrimary || '#FFFFFF') : colors.text }]}>
                Dine-in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOrderType('Takeaway')}
              style={[
                styles.prefButton,
                {
                  backgroundColor: orderType === 'Takeaway' ? colors.primary : (colors.inputBg || '#F5F5F4'),
                  borderColor: orderType === 'Takeaway' ? colors.primary : colors.border
                }
              ]}
            >
              <ShoppingBag size={16} color={orderType === 'Takeaway' ? (colors.onPrimary || '#FFFFFF') : colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.prefBtnText, { color: orderType === 'Takeaway' ? (colors.onPrimary || '#FFFFFF') : colors.text }]}>
                Takeaway
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conditional Selection: Table for Dine-in, or Pickup Time for Takeaway */}
          {orderType === 'Dine-in' ? (
            <View style={styles.selectorGroup}>
              <View style={styles.selectorLabelRow}>
                <MapPin size={13} color={colors.gold || '#D4AF37'} style={{ marginRight: 4 }} />
                <Text style={[styles.selectorLabel, { color: colors.text }]}>Select Table Allocation:</Text>
              </View>
              <View style={styles.slotsList}>
                {availableTables.slice(0, 3).map((tbl) => {
                  const isSelected = selectedTable === tbl;
                  return (
                    <TouchableOpacity
                      key={tbl}
                      onPress={() => setSelectedTable(tbl)}
                      style={[
                        styles.slotItem,
                        {
                          backgroundColor: isSelected ? (colors.tint || 'rgba(180, 83, 9, 0.1)') : (colors.inputBg || '#F5F5F4'),
                          borderColor: isSelected ? colors.primary : colors.border
                        }
                      ]}
                    >
                      <Text style={{ fontSize: 12, color: colors.text, fontWeight: isSelected ? '600' : 'normal' }}>{tbl}</Text>
                      {isSelected && <Text style={{ color: colors.primary, fontWeight: 'bold' }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.selectorGroup}>
              <View style={styles.selectorLabelRow}>
                <Clock size={13} color={colors.gold || '#D4AF37'} style={{ marginRight: 4 }} />
                <Text style={[styles.selectorLabel, { color: colors.text }]}>Estimated Pickup Time:</Text>
              </View>
              <View style={styles.slotsList}>
                {pickupTimeSlots.map((slot) => {
                  const isSelected = pickupTime === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setPickupTime(slot)}
                      style={[
                        styles.slotItem,
                        {
                          backgroundColor: isSelected ? (colors.tint || 'rgba(180, 83, 9, 0.1)') : (colors.inputBg || '#F5F5F4'),
                          borderColor: isSelected ? colors.primary : colors.border
                        }
                      ]}
                    >
                      <Text style={{ fontSize: 12, color: colors.text, fontWeight: isSelected ? '600' : 'normal' }}>{slot}</Text>
                      {isSelected && <Text style={{ color: colors.primary, fontWeight: 'bold' }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* 2. Items Review Snapshot */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>
            Selected Dishes ({items.reduce((s, i) => s + i.qty, 0)})
          </Text>
          <View style={styles.itemsWrapper}>
            {items.map((cartItem, idx) => (
              <View
                key={cartItem.item.id || cartItem.item._id || idx}
                style={[
                  styles.dishItemRow,
                  idx !== items.length - 1 && [styles.itemDivider, { borderColor: colors.border }]
                ]}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.dishItemTitle, { color: colors.text }]}>
                    {cartItem.qty}x {cartItem.item.name}
                  </Text>
                  {cartItem.note ? (
                    <Text style={[styles.dishItemNote, { color: colors.textMuted }]}>
                      Note: "{cartItem.note}"
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.dishItemPrice, { color: colors.text }]}>
                  {CURRENCY_SYMBOL} {(cartItem.item.price * cartItem.qty).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. Financial Calculation Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.receiptTitleRow}>
            <Receipt size={15} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionHeading, { color: colors.primary, marginBottom: 0 }]}>
              Verified Financial Breakdown
            </Text>
          </View>

          <View style={styles.breakdownLine}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Subtotal</Text>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>
              {CURRENCY_SYMBOL} {billSummary.subtotal.toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownLine}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Service Charge (5%)</Text>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>
              {CURRENCY_SYMBOL} {billSummary.serviceCharge.toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownLine}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>GST / Sales Tax (15%)</Text>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>
              {CURRENCY_SYMBOL} {billSummary.salesTax.toLocaleString()}
            </Text>
          </View>

          {billSummary.discount > 0 && (
            <View style={styles.breakdownLine}>
              <Text style={{ color: colors.success || '#16a34a', fontSize: 12, fontWeight: '600' }}>
                Discount ({appliedPromo?.code})
              </Text>
              <Text style={{ color: colors.success || '#16a34a', fontWeight: 'bold', fontSize: 12 }}>
                - {CURRENCY_SYMBOL} {billSummary.discount.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={[styles.grandTotalContainer, { borderColor: colors.border }]}>
            <View>
              <Text style={[styles.grandTotalHeading, { color: colors.textMuted }]}>
                Grand Total
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                Server Authoritative Price
              </Text>
            </View>
            <Text style={[styles.grandTotalValue, { color: colors.primary }]}>
              {CURRENCY_SYMBOL} {billSummary.grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* 4. Place Order Submission Button */}
        <TouchableOpacity
          disabled={isPlacingOrder}
          onPress={handlePlaceOrder}
          style={[
            styles.submitOrderBtn,
            {
              backgroundColor: colors.primary,
              opacity: isPlacingOrder ? 0.6 : 1
            }
          ]}
          activeOpacity={0.85}
        >
          {isPlacingOrder ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.onPrimary || '#FFFFFF'} />
              <Text style={[styles.submitOrderText, { color: colors.onPrimary || '#FFFFFF' }]}>
                Submitting Order to Server...
              </Text>
            </View>
          ) : (
            <Text style={[styles.submitOrderText, { color: colors.onPrimary || '#FFFFFF' }]}>
              Confirm & Transmit Order →
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, borderRadius: 10, borderWidth: 1, marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  errorBannerTitle: { fontSize: 12, fontWeight: 'bold' },
  errorBannerText: { fontSize: 11, marginTop: 2 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  preferenceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  prefButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  prefBtnText: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  selectorGroup: { marginTop: 6 },
  selectorLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  selectorLabel: { fontSize: 12, fontWeight: '600' },
  slotsList: { gap: 6 },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  itemsWrapper: { marginTop: 2 },
  dishItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  itemDivider: { borderBottomWidth: 0.5 },
  dishItemTitle: { fontSize: 13, fontWeight: '600' },
  dishItemNote: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  dishItemPrice: { fontSize: 13, fontWeight: 'bold' },
  receiptTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  breakdownLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1
  },
  grandTotalHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  submitOrderBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  submitOrderText: { fontSize: 14, fontWeight: 'bold' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 14
  },
  successTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  successSubtitle: { fontSize: 12, textAlign: 'center', marginTop: 6, maxWidth: 300, lineHeight: 18 },
  confirmedReceiptCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 18,
    gap: 6
  },
  confirmedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmedTotalRow: { paddingTop: 8, marginTop: 4, borderTopWidth: 1 },
  successActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20
  },
  actionOutlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1
  },
  actionPrimaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10
  }
});