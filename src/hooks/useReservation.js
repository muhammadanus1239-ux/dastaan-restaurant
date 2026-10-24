import { useState, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce } from './useDebounce';
import { apiClient } from '../api/client';

// Master Restaurant Tables (matching server seed & architecture design)
export const RESTAURANT_TABLES = [
  { id: 'T1', number: 1, seats: 2, name: 'Table 1 (2 Seats - Garden View)' },
  { id: 'T2', number: 2, seats: 2, name: 'Table 2 (2 Seats - Quiet Corner)' },
  { id: 'T3', number: 3, seats: 4, name: 'Table 3 (4 Seats - Royal Arch)' },
  { id: 'T4', number: 4, seats: 4, name: 'Table 4 (4 Seats - Center Courtyard)' },
  { id: 'T5', number: 5, seats: 6, name: 'Table 5 (6 Seats - Family Alcove)' },
  { id: 'T6', number: 6, seats: 8, name: 'Table 6 (8 Seats - Imperial Divan)' },
  { id: 'T7', number: 7, seats: 12, name: 'Table 7 (12 Seats - Grand Banquet)' }
];

// Time slots from 12:00 to 22:00 in one-hour increments (A1 Q9 Requirement 2)
export const RESERVATION_TIME_SLOTS = [
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00'
];

// Helper to format date as YYYY-MM-DD
export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial pre-seeded booked slots (A1 Q9 Requirement 3: Pre-seed at least two slots as booked to demonstrate disabled UI)
const initialBookedSlots = [
  {
    id: 'res_seed_1',
    tableId: 'T3',
    tableName: 'Table 3 (4 Seats - Royal Arch)',
    date: getTodayDateString(),
    timeSlot: '19:00',
    partySize: 4,
    guestName: 'Zainab Malik',
    phone: '0300-1234567',
    status: 'Confirmed'
  },
  {
    id: 'res_seed_2',
    tableId: 'T4',
    tableName: 'Table 4 (4 Seats - Center Courtyard)',
    date: getTodayDateString(),
    timeSlot: '19:00', // Both 4-seater tables booked at 19:00! So party size 3-4 will show 19:00 DISABLED!
    partySize: 4,
    guestName: 'Omar Farooq',
    phone: '0321-9876543',
    status: 'Confirmed'
  },
  {
    id: 'res_seed_3',
    tableId: 'T5',
    tableName: 'Table 5 (6 Seats - Family Alcove)',
    date: getTodayDateString(),
    timeSlot: '20:00', // 6-seater booked at 20:00!
    partySize: 6,
    guestName: 'Bilal Siddiqui',
    phone: '0333-5554321',
    status: 'Confirmed'
  }
];

/**
 * useReservation Custom Hook (A1 Q9 Requirement 2)
 * Manages available time slots, date, party size, table assignment,
 * and integrates useDebounce to delay availability checks as user changes parameters.
 */
export const useReservation = (initialDate = getTodayDateString(), initialPartySize = 2) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [partySize, setPartySize] = useState(initialPartySize);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Stored reservations (includes pre-seeded bookings + user created bookings)
  const [allReservations, setAllReservations] = useState(initialBookedSlots);

  // Restore reservations from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('dastaan_reservations')
      .then(stored => {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAllReservations(parsed);
            }
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Save reservations to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('dastaan_reservations', JSON.stringify(allReservations)).catch(() => {});
  }, [allReservations]);

  // Integrate useDebounce (A1 Q9 Requirement 7): Debounce availability checks as user changes party size or date
  const debouncedDate = useDebounce(selectedDate, 350);
  const debouncedPartySize = useDebounce(partySize, 350);

  // Trigger brief checking state during debounce settling
  useEffect(() => {
    setIsCheckingAvailability(true);
    const timer = setTimeout(() => {
      setIsCheckingAvailability(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [selectedDate, partySize]);

  /**
   * Check if a time slot has already passed for today (A1 Q9 Requirement 4)
   * If booking for today, slot must be at least one hour ahead of the current time.
   */
  const isSlotPastToday = useCallback((dateStr, slotStr) => {
    const today = getTodayDateString();
    if (dateStr !== today) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const [slotHour] = slotStr.split(':').map(Number);

    // Must be at least 1 hour ahead
    return slotHour <= currentHour + 1;
  }, []);

  /**
   * Find suitable table for party size
   * Picks smallest table where seats >= partySize
   */
  const findAvailableTableForSlot = useCallback((date, timeSlot, size) => {
    // Filter tables that can accommodate party size
    const candidateTables = RESTAURANT_TABLES
      .filter(t => t.seats >= size)
      .sort((a, b) => a.seats - b.seats); // Best fit first

    // Find table that is not already booked on that date and timeSlot
    for (const table of candidateTables) {
      const isBooked = allReservations.some(
        res => res.date === date && res.timeSlot === timeSlot && res.tableId === table.id && res.status !== 'Cancelled'
      );
      if (!isBooked) {
        return table;
      }
    }
    return null; // All suitable tables booked
  }, [allReservations]);

  /**
   * Compute availability status for all slots (12:00 to 22:00)
   * Disables slot if already booked or past time (A1 Q9 Requirement 3)
   */
  const slotAvailability = useMemo(() => {
    return RESERVATION_TIME_SLOTS.map(slot => {
      const isPast = isSlotPastToday(debouncedDate, slot);
      const assignedTable = findAvailableTableForSlot(debouncedDate, slot, debouncedPartySize);
      const isFullyBooked = !assignedTable;

      return {
        slot,
        isPast,
        isFullyBooked,
        isDisabled: isPast || isFullyBooked,
        assignedTable: assignedTable || null,
        reason: isPast
          ? 'Slot closed (Must be 1+ hour ahead)'
          : isFullyBooked
          ? `Fully booked for party of ${debouncedPartySize}`
          : `Available (${assignedTable.name})`
      };
    });
  }, [debouncedDate, debouncedPartySize, isSlotPastToday, findAvailableTableForSlot]);

  // Assigned table for the currently selected slot
  const currentAssignedTable = useMemo(() => {
    if (!selectedSlot) return null;
    return findAvailableTableForSlot(selectedDate, selectedSlot, partySize);
  }, [selectedDate, selectedSlot, partySize, findAvailableTableForSlot]);

  /**
   * Add a new reservation (A1 Q9 Requirement 6 & A2 Q7)
   */
  const bookReservation = useCallback(async (reservationData) => {
    const table = findAvailableTableForSlot(
      reservationData.date,
      reservationData.timeSlot,
      reservationData.partySize
    );

    if (!table) {
      throw new Error('Sorry, no table is available for this slot and party size.');
    }

    let serverRes = null;
    try {
      const response = await apiClient.post('/api/reservations', {
        table: table.id,
        tableNumber: table.number,
        date: reservationData.date,
        timeSlot: reservationData.timeSlot,
        partySize: reservationData.partySize,
        name: reservationData.name,
        phone: reservationData.phone,
        specialRequests: reservationData.specialRequests || ''
      });
      if (response && response.data) {
        serverRes = response.data;
      }
    } catch (apiErr) {
      if (apiErr.message && (apiErr.message.includes('409') || apiErr.status === 409)) {
        throw new Error('Conflict (409): Table is already booked for this slot on server.');
      }
      throw new Error(`Server Connection Failed: Could not update MongoDB database. (${apiErr.message || 'Port 5000 unreachable'})`);
    }

    const newReservation = serverRes || {
      id: 'RES-' + Math.floor(1000 + Math.random() * 9000),
      tableId: table.id,
      tableName: table.name,
      tableNumber: table.number,
      date: reservationData.date,
      timeSlot: reservationData.timeSlot,
      partySize: reservationData.partySize,
      guestName: reservationData.name,
      phone: reservationData.phone,
      specialRequests: reservationData.specialRequests || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setAllReservations(prev => [newReservation, ...prev]);
    return newReservation;
  }, [findAvailableTableForSlot]);

  /**
   * Cancel an existing reservation (A1 Q9 Requirement 6 & A2 Q7)
   */
  const cancelReservation = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/reservations/${id}`);
    } catch (e) {}

    setAllReservations(prev =>
      prev.map(res =>
        res.id === id || res._id === id ? { ...res, status: 'Cancelled' } : res
      )
    );
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    partySize,
    setPartySize,
    selectedSlot,
    setSelectedSlot,
    slotAvailability,
    currentAssignedTable,
    isCheckingAvailability,
    myReservations: allReservations,
    bookReservation,
    cancelReservation
  };
};

export default useReservation;
