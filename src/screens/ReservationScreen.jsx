import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useForm } from '../hooks/useForm';
import { useReservation, getTodayDateString } from '../hooks/useReservation';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { APP_NAME } from '../data/brand';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react-native';

export default function ReservationScreen({ onNavigate }) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  // Active view tab: 'book' or 'my-reservations'
  const [activeTab, setActiveTab] = useState('book');

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  // Today's date reference
  const today = getTodayDateString();

  // useReservation Hook
  const {
    selectedDate,
    setSelectedDate,
    partySize,
    setPartySize,
    selectedSlot,
    setSelectedSlot,
    slotAvailability,
    currentAssignedTable,
    isCheckingAvailability,
    myReservations,
    bookReservation,
    cancelReservation
  } = useReservation(today, 2);

  // Validation function with strict date and Pakistani phone formats
  const validateReservation = (values) => {
    const errors = {};
    const pakPhoneRegex = /^03\d{2}-\d{7}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!values.name || !values.name.trim()) {
      errors.name = 'Contact name is required';
    }

    if (!values.phone || !values.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!pakPhoneRegex.test(values.phone.trim())) {
      errors.phone = 'Phone must match Pakistani format: 03XX-XXXXXXX (e.g. 0300-1234567)';
    }

    if (!selectedDate) {
      errors.date = 'Reservation date is required';
    } else if (!dateRegex.test(selectedDate)) {
      errors.date = 'Date must be formatted as YYYY-MM-DD (e.g. 2026-10-25)';
    } else if (selectedDate < today) {
      errors.date = 'Reservation date cannot be in the past';
    }

    if (!partySize || partySize < 1 || partySize > 12) {
      errors.partySize = 'Party size must be between 1 and 12 guests';
    }

    if (!selectedSlot) {
      errors.timeSlot = 'Please select a dining time slot';
    }

    return errors;
  };

  // useForm Hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validateForm,
    resetForm
  } = useForm(
    {
      name: user?.name || '',
      phone: '0300-1234567',
      specialRequests: ''
    },
    validateReservation
  );

  // Open confirmation modal if form is valid
  const handleProceedToConfirmation = () => {
    if (!selectedSlot) {
      Alert.alert('Slot Required', 'Please select a dining time slot from the grid below.');
      return;
    }

    const isValid = validateForm();
    if (isValid && currentAssignedTable) {
      setShowConfirmModal(true);
    }
  };

  // Final confirmation submission
  const handleConfirmBooking = async () => {
    try {
      const booked = await bookReservation({
        date: selectedDate,
        timeSlot: selectedSlot,
        partySize,
        name: values.name.trim(),
        phone: values.phone.trim(),
        specialRequests: values.specialRequests.trim()
      });

      setShowConfirmModal(false);
      setSelectedSlot('');
      resetForm();

      const bookingRef = booked?.id || booked?._id || booked?.data?.id || booked?.data?._id || 'RES-CONFIRMED';
      setSuccessBanner(`Reservation confirmed in MongoDB! Reference: #${bookingRef}`);
      setActiveTab('my-reservations');

      setTimeout(() => setSuccessBanner(null), 6000);
    } catch (err) {
      const isConflict = err.message?.includes('409') || err.message?.toLowerCase().includes('conflict') || err.message?.toLowerCase().includes('already booked');
      
      Alert.alert(
        isConflict ? 'Table Slot Conflict (409)' : 'Booking Failed',
        isConflict
          ? 'This table is already booked for the selected date and time slot. Please choose another slot.'
          : (err.message || 'Server Connection Failed: Could not record reservation in MongoDB.')
      );
    }
  };

  // Handle Cancel Reservation with Native Alert
  const handleCancelReservationPrompt = (res) => {
    const resId = res.id || res._id;
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel booking #${resId} for ${res.date} at ${res.timeSlot}? This action cannot be undone.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelReservation(resId)
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
              Table Reservation
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Reserve your royal dining experience at {APP_NAME}
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('book')}
              style={[
                styles.tabBtn,
                { backgroundColor: activeTab === 'book' ? colors.primary : 'transparent' }
              ]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'book' ? (colors.onPrimary || '#FFFFFF') : colors.text }]}>
                Book Table
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('my-reservations')}
              style={[
                styles.tabBtn,
                { backgroundColor: activeTab === 'my-reservations' ? colors.primary : 'transparent' }
              ]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'my-reservations' ? (colors.onPrimary || '#FFFFFF') : colors.text }]}>
                My Bookings ({myReservations.filter(r => r.status !== 'Cancelled').length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Success Banner */}
        {successBanner && (
          <View style={[styles.banner, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)', borderColor: colors.gold || '#D4AF37' }]}>
            <View style={styles.bannerLeft}>
              <CheckCircle2 size={16} color="#2E7D4F" style={{ marginRight: 6 }} />
              <Text style={[styles.bannerText, { color: colors.primary }]}>
                {successBanner}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSuccessBanner(null)}>
              <X size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 1: BOOK TABLE FLOW */}
        {activeTab === 'book' && (
          <View style={styles.tabContent}>
            
            {/* 1. Date & Party Size Section */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Calendar size={15} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                  Step 1: Dining Date & Guests
                </Text>
              </View>

              <View style={styles.rowFormFields}>
                {/* Date Picker (YYYY-MM-DD) */}
                <View style={styles.halfField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Date (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    value={selectedDate}
                    onChangeText={(val) => setSelectedDate(val)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.inputField,
                      {
                        backgroundColor: colors.inputBg || '#F5F5F4',
                        borderColor: errors.date ? (colors.danger || '#EF4444') : colors.border,
                        color: colors.text
                      }
                    ]}
                  />
                  {errors.date && (
                    <Text style={styles.errorText}>{errors.date}</Text>
                  )}
                </View>

                {/* Party Size Stepper (1 to 12 guests) */}
                <View style={styles.halfField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Party Size (Guests: {partySize})
                  </Text>
                  <View style={[styles.stepperBox, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}>
                    <TouchableOpacity
                      disabled={partySize <= 1}
                      onPress={() => setPartySize(prev => Math.max(1, prev - 1))}
                      style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <Text style={{ fontWeight: 'bold', color: colors.text }}>-</Text>
                    </TouchableOpacity>

                    <Text style={[styles.stepperCount, { color: colors.primary }]}>
                      {partySize} {partySize === 1 ? 'Guest' : 'Guests'}
                    </Text>

                    <TouchableOpacity
                      disabled={partySize >= 12}
                      onPress={() => setPartySize(prev => Math.min(12, prev + 1))}
                      style={[styles.stepperBtnPrimary, { backgroundColor: colors.primary }]}
                    >
                      <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                  {errors.partySize && (
                    <Text style={styles.errorText}>{errors.partySize}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* 2. Time Slots Grid with Disabled Booked Slots */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeaderBetween}>
                <View style={styles.rowCentered}>
                  <Clock size={15} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.sectionHeading, { color: colors.primary, marginBottom: 0 }]}>
                    Step 2: Time Slot (12:00 - 22:00)
                  </Text>
                </View>
                {isCheckingAvailability && (
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Checking...
                  </Text>
                )}
              </View>

              <Text style={[styles.helperSubtext, { color: colors.textMuted }]}>
                Fully booked slots are automatically disabled and greyed out.
              </Text>

              {/* Responsive 3-Column Native Grid */}
              <View style={styles.slotsGrid}>
                {slotAvailability.map(({ slot, isDisabled, isPast, isFullyBooked }) => {
                  const isSelected = selectedSlot === slot;

                  return (
                    <TouchableOpacity
                      key={slot}
                      disabled={isDisabled}
                      onPress={() => !isDisabled && setSelectedSlot(slot)}
                      style={[
                        styles.slotCard,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isDisabled
                            ? (isDark ? '#20161A' : '#EFE8DE')
                            : (colors.inputBg || '#F5F5F4'),
                          borderColor: isSelected
                            ? (colors.gold || '#D4AF37')
                            : colors.border,
                          opacity: isDisabled ? 0.45 : 1
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotTimeText,
                          { color: isSelected ? (colors.onPrimary || '#FFFFFF') : colors.text }
                        ]}
                      >
                        {slot}
                      </Text>
                      <Text
                        style={[
                          styles.slotStatusText,
                          { color: isSelected ? (colors.onPrimary || '#FFFFFF') : colors.textMuted }
                        ]}
                      >
                        {isPast ? 'Closed' : isFullyBooked ? 'Full' : 'Available'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {errors.timeSlot && (
                <View style={styles.errorRow}>
                  <AlertCircle size={13} color={colors.danger || '#EF4444'} />
                  <Text style={styles.errorText}>{errors.timeSlot}</Text>
                </View>
              )}

              {/* Assigned Table Preview */}
              {selectedSlot && currentAssignedTable && (
                <View style={[styles.matchedTableBanner, { backgroundColor: colors.tint || 'rgba(180, 83, 9, 0.1)', borderColor: colors.gold || '#D4AF37' }]}>
                  <View style={styles.rowCentered}>
                    <Sparkles size={14} color={colors.gold || '#D4AF37'} style={{ marginRight: 6 }} />
                    <Text style={[styles.matchedTableText, { color: colors.primary }]}>
                      Matched: {currentAssignedTable.name}
                    </Text>
                  </View>
                  <Text style={[styles.autoBadge, { color: colors.textMuted }]}>
                    Auto-Assigned
                  </Text>
                </View>
              )}
            </View>

            {/* 3. Contact Details */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <User size={15} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                  Step 3: Contact & Guest Details
                </Text>
              </View>

              <View style={styles.formFields}>
                {/* Guest Name */}
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Primary Guest Name
                  </Text>
                  <TextInput
                    value={values.name}
                    onChangeText={(val) => handleChange('name', val)}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Ahmed Khan"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.inputField,
                      {
                        backgroundColor: colors.inputBg || '#F5F5F4',
                        borderColor: errors.name && touched.name ? (colors.danger || '#EF4444') : colors.border,
                        color: colors.text
                      }
                    ]}
                  />
                  {errors.name && touched.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Pakistani Phone Format */}
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Pakistani Contact Mobile (03XX-XXXXXXX)
                  </Text>
                  <TextInput
                    value={values.phone}
                    onChangeText={(val) => handleChange('phone', val)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="0300-1234567"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={[
                      styles.inputField,
                      {
                        backgroundColor: colors.inputBg || '#F5F5F4',
                        borderColor: errors.phone && touched.phone ? (colors.danger || '#EF4444') : colors.border,
                        color: colors.text
                      }
                    ]}
                  />
                  {errors.phone && touched.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>

                {/* Special Requests */}
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Special Seating / Requests (Optional)
                  </Text>
                  <TextInput
                    multiline
                    numberOfLines={2}
                    value={values.specialRequests}
                    onChangeText={(val) => handleChange('specialRequests', val)}
                    placeholder="e.g. High chair for toddler, anniversary, quiet corner"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.inputField,
                      {
                        backgroundColor: colors.inputBg || '#F5F5F4',
                        borderColor: colors.border,
                        color: colors.text,
                        height: 56
                      }
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              disabled={!selectedSlot || isSubmitting}
              onPress={handleProceedToConfirmation}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: (!selectedSlot || isSubmitting) ? 0.5 : 1
                }
              ]}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>
                Review Reservation Summary
              </Text>
              <ChevronRight size={16} color={colors.onPrimary || '#FFFFFF'} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: MY RESERVATIONS LIST */}
        {activeTab === 'my-reservations' && (
          <View style={styles.tabContent}>
            {myReservations.length === 0 ? (
              <View style={[styles.card, styles.centerBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Calendar size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No reservations found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  You have not booked any tables yet.
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveTab('book')}
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                    Book Your First Table
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              myReservations.map((res) => {
                const isCancelled = res.status === 'Cancelled';
                const resId = String(res.id || res._id);

                return (
                  <View
                    key={resId}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        opacity: isCancelled ? 0.6 : 1
                      }
                    ]}
                  >
                    <View style={styles.bookingCardHeader}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={styles.rowCentered}>
                          <Text style={[styles.resIdText, { color: colors.textMuted }]}>
                            #{resId.length > 8 ? resId.slice(-6) : resId}
                          </Text>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: isCancelled
                                  ? (colors.border || '#E5E7EB')
                                  : (colors.tint || 'rgba(180, 83, 9, 0.1)')
                              }
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: isCancelled ? colors.textMuted : colors.primary }
                              ]}
                            >
                              {res.status}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.bookingTableName, { color: colors.text }]}>
                          {res.tableName}
                        </Text>

                        <View style={styles.bookingMetaRow}>
                          <View style={styles.metaItem}>
                            <Calendar size={13} color={colors.text} style={{ marginRight: 4 }} />
                            <Text style={[styles.metaText, { color: colors.text }]}>{res.date}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Clock size={13} color={colors.text} style={{ marginRight: 4 }} />
                            <Text style={[styles.metaText, { color: colors.text }]}>{res.timeSlot}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Users size={13} color={colors.text} style={{ marginRight: 4 }} />
                            <Text style={[styles.metaText, { color: colors.text }]}>{res.partySize} Guests</Text>
                          </View>
                        </View>

                        <Text style={[styles.bookingReservedFor, { color: colors.textMuted }]}>
                          Reserved under: <Text style={{ fontWeight: '600' }}>{res.guestName}</Text> ({res.phone})
                        </Text>
                      </View>

                      {/* Cancel Button */}
                      {!isCancelled && (
                        <TouchableOpacity
                          onPress={() => handleCancelReservationPrompt(res)}
                          style={[styles.cancelBtn, { borderColor: colors.danger || '#EF4444' }]}
                        >
                          <Text style={[styles.cancelBtnText, { color: colors.danger || '#EF4444' }]}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* 4. Confirmation Modal */}
        <Modal
          visible={showConfirmModal && !!currentAssignedTable}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              
              <View style={[styles.modalHeader, { borderColor: colors.border }]}>
                <View style={styles.rowCentered}>
                  <ShieldCheck size={18} color={colors.gold || '#D4AF37'} style={{ marginRight: 6 }} />
                  <Text style={[styles.modalTitle, { color: colors.primary }]}>
                    Confirm Reservation
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.closeBtn}>
                  <X size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Please review your table booking details before final confirmation:
              </Text>

              {/* Summary Details */}
              <View style={[styles.modalDetailsBox, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.border }]}>
                <View style={styles.detailLine}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Primary Guest:</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{values.name}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Contact Phone:</Text>
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, fontFamily: 'monospace' }}>{values.phone}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Date:</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{selectedDate}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Time Slot:</Text>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12, fontFamily: 'monospace' }}>{selectedSlot}</Text>
                </View>
                <View style={styles.detailLine}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Party Size:</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{partySize} Guests</Text>
                </View>
                <View style={[styles.detailLine, styles.assignedLine, { borderColor: colors.border }]}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Assigned Table:</Text>
                  <Text style={{ color: colors.gold || '#D4AF37', fontWeight: 'bold', fontSize: 13 }}>
                    {currentAssignedTable?.name}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  onPress={() => setShowConfirmModal(false)}
                  style={[styles.modalBtnOutline, { borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Edit Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmBooking}
                  style={[styles.modalBtnPrimary, { backgroundColor: colors.primary }]}
                >
                  <Text style={{ color: colors.onPrimary || '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                    Confirm & Book
                  </Text>
                </TouchableOpacity>
              </View>

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
  header: { marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  tabBar: { flexDirection: 'row', borderRadius: 12, padding: 3, borderWidth: 1, marginTop: 10 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 12, fontWeight: '600' },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bannerText: { fontSize: 12, fontWeight: '600' },
  tabContent: { gap: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, elevation: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardHeaderBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  rowCentered: { flexDirection: 'row', alignItems: 'center' },
  sectionHeading: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  helperSubtext: { fontSize: 11, marginBottom: 10 },
  rowFormFields: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  inputField: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, fontSize: 12 },
  stepperBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 4 },
  stepperBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepperBtnPrimary: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stepperCount: { fontSize: 12, fontWeight: 'bold' },
  errorText: { fontSize: 10, color: '#EF4444', marginTop: 3 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCard: { width: '31%', paddingVertical: 8, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  slotTimeText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  slotStatusText: { fontSize: 9, marginTop: 2, fontWeight: '500' },
  matchedTableBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, marginTop: 12 },
  matchedTableText: { fontSize: 12, fontWeight: 'bold' },
  autoBadge: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  formFields: { gap: 8 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, marginTop: 6, elevation: 2 },
  submitBtnText: { fontSize: 14, fontWeight: 'bold' },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold' },
  emptySubtitle: { fontSize: 12, marginVertical: 6 },
  primaryActionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 6 },
  bookingCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resIdText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', marginRight: 6 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  statusPillText: { fontSize: 10, fontWeight: 'bold' },
  bookingTableName: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  bookingMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, fontWeight: '600' },
  bookingReservedFor: { fontSize: 11, marginTop: 6 },
  cancelBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  cancelBtnText: { fontSize: 11, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 380, borderRadius: 16, borderWidth: 1, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  modalSubtitle: { fontSize: 11, marginVertical: 8 },
  modalDetailsBox: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 5 },
  detailLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assignedLine: { borderTopWidth: 1, paddingTop: 6, marginTop: 4 },
  modalActionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  modalBtnOutline: { flex: 1, paddingVertical: 9, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  modalBtnPrimary: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' }
});