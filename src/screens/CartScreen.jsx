import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { CURRENCY_SYMBOL } from '../data/brand';
import QuantityStepper from '../components/QuantityStepper';
import {
  ShoppingBag,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MessageSquare
} from 'lucide-react-native';

export default function CartScreen({ onNavigate }) {
  const {
    items,
    appliedPromo,
    promoError,
    itemCount,
    removeFromCart,
    incrementQty,
    decrementQty,
    updateNote,
    applyPromo,
    removePromo,
    clearCart
  } = useCart();

  const { colors } = useTheme();

  // Controlled input for promo code (A1 Q7 Requirement 4)
  const [promoInput, setPromoInput] = useState('');

  // Per-item note editing visibility map
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Subtotal calculation
  const subtotal = items.reduce(
    (sum, cartItem) => sum + cartItem.item.price * cartItem.qty,
    0
  );

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    applyPromo(promoInput);
  };

  // 1. If cart is empty
  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)' }]}>
          <ShoppingBag size={40} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.primary }]}>
          Your DASTAAN Cart is Empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Explore our royal recipes and add traditional grilled delicacies to begin your order.
        </Text>
        <TouchableOpacity
          onPress={() => onNavigate && onNavigate('Menu')}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>
            Explore Heritage Menu
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 2. Active Cart Screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>
              Order Cart ({itemCount})
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Review your items and enter promo codes
            </Text>
          </View>
          <TouchableOpacity
            onPress={clearCart}
            style={[styles.clearBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color={colors.danger || '#ef4444'} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.danger || '#ef4444' }}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsWrapper}>
          {items.map((cartItem) => {
            const { item, qty, note } = cartItem;
            const itemId = item.id || item._id;
            const itemTotal = item.price * qty;

            return (
              <View
                key={itemId}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.itemMainRow}>
                  {/* Food Thumbnail */}
                  <Image
                    source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }}
                    style={[styles.thumbnail, { borderColor: colors.border }]}
                    resizeMode="cover"
                  />

                  {/* Info & Quantity */}
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeaderRow}>
                      <Text
                        style={[styles.itemName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeFromCart(itemId)}
                        style={styles.deleteBtn}
                        accessibilityLabel="Remove item"
                      >
                        <Trash2 size={16} color={colors.danger || '#ef4444'} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.unitPrice, { color: colors.primary }]}>
                      {CURRENCY_SYMBOL} {item.price ? item.price.toLocaleString() : 0} each
                    </Text>

                    {/* Stepper & Line Total */}
                    <View style={styles.stepperRow}>
                      <QuantityStepper
                        quantity={qty}
                        onIncrement={() => incrementQty(itemId)}
                        onDecrement={() => decrementQty(itemId)}
                      />
                      <Text style={[styles.itemTotalPrice, { color: colors.text }]}>
                        {CURRENCY_SYMBOL} {itemTotal.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Per-Item Special Note (A1 Q7 Requirement 4) */}
                <View style={[styles.noteContainer, { borderColor: colors.border }]}>
                  {editingNoteId === itemId ? (
                    <View style={styles.noteInputRow}>
                      <TextInput
                        value={note}
                        onChangeText={(val) => updateNote(itemId, val)}
                        placeholder="e.g. Less spicy, extra lemon"
                        placeholderTextColor={colors.textMuted}
                        style={[
                          styles.noteInput,
                          {
                            backgroundColor: colors.inputBg || '#F5F5F4',
                            borderColor: colors.border,
                            color: colors.text
                          }
                        ]}
                      />
                      <TouchableOpacity
                        onPress={() => setEditingNoteId(null)}
                        style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                      >
                        <Text style={[styles.doneBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setEditingNoteId(itemId)}
                      style={styles.addNoteBtn}
                    >
                      <MessageSquare size={14} color={note ? colors.primary : colors.textMuted} />
                      <Text style={[styles.noteText, { color: note ? colors.primary : colors.textMuted }]}>
                        {note ? `Note: "${note}"` : '+ Add cooking note / instructions'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Promo Code Card (A1 Q7 Requirement 3 & 4) */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.promoHeader}>
            <View style={styles.rowCentered}>
              <Tag size={15} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Promo Voucher</Text>
            </View>
            {appliedPromo && (
              <View style={[styles.activeTag, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)' }]}>
                <CheckCircle2 size={13} color={colors.success || '#16a34a'} />
                <Text style={[styles.activeTagText, { color: colors.success || '#16a34a' }]}>Active</Text>
              </View>
            )}
          </View>

          {appliedPromo ? (
            <View style={[styles.appliedBox, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.08)', borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appliedCode, { color: colors.primary }]}>
                  Code applied: {appliedPromo.code}
                </Text>
                <Text style={[styles.appliedDesc, { color: colors.textMuted }]}>
                  {appliedPromo.description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={removePromo}
                style={[styles.removeBtn, { borderColor: colors.danger || '#ef4444', backgroundColor: colors.surface }]}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.danger || '#ef4444' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.promoInputRow}>
                <TextInput
                  value={promoInput}
                  onChangeText={(val) => setPromoInput(val.toUpperCase())}
                  placeholder="Enter code: WELCOME10, DASTAAN20"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  style={[
                    styles.promoInput,
                    {
                      backgroundColor: colors.inputBg || '#F5F5F4',
                      borderColor: promoError ? (colors.danger || '#ef4444') : colors.border,
                      color: colors.text
                    }
                  ]}
                />
                <TouchableOpacity
                  onPress={handleApplyPromo}
                  style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.applyBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Promo Error Display (A1 Q7 Requirement 3) */}
              {promoError ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={14} color={colors.danger || '#ef4444'} />
                  <Text style={[styles.errorText, { color: colors.danger || '#ef4444' }]}>{promoError}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Quick Clickable Promo Pills */}
          {!appliedPromo && (
            <View style={styles.pillsSection}>
              <Text style={[styles.pillsLabel, { color: colors.textMuted }]}>Available:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsScroll}
              >
                {['WELCOME10', 'DASTAAN20', 'FESTIVE50'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    onPress={() => {
                      setPromoInput(code);
                      applyPromo(code);
                    }}
                    style={[styles.pillBadge, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.gold || '#D4AF37' }]}
                  >
                    <Text style={[styles.pillText, { color: colors.primary }]}>{code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Order Subtotal & Next Step Button */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.subtotalRow}>
            <Text style={[styles.subtotalLabel, { color: colors.textMuted }]}>Items Subtotal:</Text>
            <Text style={[styles.subtotalValue, { color: colors.text }]}>
              {CURRENCY_SYMBOL} {subtotal.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('OrderSummary')}
            style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.checkoutText, { color: colors.onPrimary || '#FFFFFF' }]}>
              Proceed to Order Summary
            </Text>
            <ArrowRight size={16} color={colors.onPrimary || '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  itemsWrapper: { marginBottom: 12 },
  itemCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  itemMainRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumbnail: { width: 72, height: 72, borderRadius: 12, borderWidth: 1 },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 6 },
  deleteBtn: { padding: 4 },
  unitPrice: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  itemTotalPrice: { fontSize: 15, fontWeight: 'bold' },
  noteContainer: { marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  noteInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  noteInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 12
  },
  doneBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  doneBtnText: { fontSize: 12, fontWeight: 'bold' },
  addNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noteText: { fontSize: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  rowCentered: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  activeTagText: { fontSize: 10, fontWeight: 'bold' },
  appliedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  appliedCode: { fontSize: 13, fontWeight: 'bold' },
  appliedDesc: { fontSize: 11, marginTop: 2 },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  promoInputRow: { flexDirection: 'row', gap: 8 },
  promoInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 12
  },
  applyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, justifyContent: 'center' },
  applyBtnText: { fontSize: 12, fontWeight: 'bold' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  errorText: { fontSize: 11 },
  pillsSection: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  pillsLabel: { fontSize: 11, marginRight: 8 },
  pillsScroll: { flexDirection: 'row', gap: 6 },
  pillBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  pillText: { fontSize: 10, fontWeight: 'bold' },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  subtotalLabel: { fontSize: 14, fontWeight: '500' },
  subtotalValue: { fontSize: 17, fontWeight: 'bold' },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  checkoutText: { fontSize: 14, fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  emptySubtitle: { fontSize: 12, textAlign: 'center', marginTop: 8, maxWidth: 260 },
  primaryBtn: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12
  },
  primaryBtnText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }
});