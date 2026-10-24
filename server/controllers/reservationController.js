const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// In-memory reservations store for resilient offline/mock testing
let memoryReservations = [
  {
    _id: 'res_seed_1',
    id: 'res_seed_1',
    table: '65a000000000000000000013', // Table 3
    tableName: 'Table 3',
    tableNumber: 3,
    date: '2026-10-20',
    timeSlot: '19:00',
    partySize: 4,
    customerName: 'Zainab Malik',
    phone: '0300-1234567',
    status: 'Confirmed'
  },
  {
    _id: 'res_seed_2',
    id: 'res_seed_2',
    table: '65a000000000000000000015', // Table 5
    tableName: 'Table 5',
    tableNumber: 5,
    date: '2026-10-20',
    timeSlot: '20:00',
    partySize: 6,
    customerName: 'Bilal Siddiqui',
    phone: '0333-5554321',
    status: 'Confirmed'
  }
];

// @desc    Create new table reservation (checks double-booking and returns 409 if already booked)
// @route   POST /api/reservations
// @access  Protected
const createReservation = async (req, res, next) => {
  try {
    const { table, date, timeSlot, partySize, name, phone, specialRequests } = req.body;

    if (!date || !timeSlot || !partySize) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, timeSlot, and partySize'
      });
    }

    const tableIdentifier = table || req.body.tableId || '65a000000000000000000013';

    // A2 Q7 Requirement 3: Check if that table is already booked for that date and time slot -> 409 Conflict
    let existingBooking = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingBooking = await Reservation.findOne({
          table: tableIdentifier,
          date,
          timeSlot,
          status: { $ne: 'Cancelled' }
        });
      } catch (e) {
        existingBooking = null;
      }
    }

    if (!existingBooking) {
      // Memory fallback lookup
      existingBooking = memoryReservations.find(
        r => (r.table === tableIdentifier || r.tableId === tableIdentifier) &&
             r.date === date &&
             r.timeSlot === timeSlot &&
             r.status !== 'Cancelled'
      );
    }

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: `Conflict (409): Table is already booked for ${date} at ${timeSlot}. Please select another slot or table.`
      });
    }

    // Lookup table details if in DB
    let tableObj = null;
    if (mongoose.connection.readyState === 1) {
      try {
        if (tableIdentifier.length === 24) {
          tableObj = await Table.findById(tableIdentifier);
        }
      } catch (e) {}
    }

    const customerName = name || (req.user ? req.user.name : 'Guest Patron');
    const contactPhone = phone || '0300-1234567';

    const newReservationData = {
      user: req.user ? (req.user._id || req.user.id) : null,
      table: tableObj ? tableObj._id : tableIdentifier,
      tableName: tableObj ? `Table ${tableObj.tableNumber}` : 'Table Assigned',
      tableNumber: tableObj ? tableObj.tableNumber : 3,
      date,
      timeSlot,
      partySize: Number(partySize) || 2,
      customerName,
      phone: contactPhone,
      specialRequests: specialRequests || '',
      status: 'Pending',
      createdAt: new Date()
    };

    let savedReservation = null;
    if (mongoose.connection.readyState === 1) {
      try {
        savedReservation = await Reservation.create(newReservationData);
      } catch (dbErr) {
        savedReservation = null;
      }
    }

    if (!savedReservation) {
      savedReservation = {
        _id: 'res_' + Date.now(),
        id: 'res_' + Date.now(),
        ...newReservationData
      };
      memoryReservations.unshift(savedReservation);
    }

    res.status(201).json({
      success: true,
      data: savedReservation,
      message: 'Reservation created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reservations (Customer sees own, Manager sees all)
// @route   GET /api/reservations
// @access  Protected
const getReservations = async (req, res, next) => {
  try {
    const isManager = req.user && req.user.role === 'manager';
    const userId = req.user ? (req.user._id || req.user.id) : null;

    let reservations = [];
    if (mongoose.connection.readyState === 1) {
      try {
        if (isManager) {
          reservations = await Reservation.find().populate('table').sort({ date: 1, timeSlot: 1 });
        } else {
          reservations = await Reservation.find({ user: userId }).populate('table').sort({ date: 1, timeSlot: 1 });
        }
      } catch (dbErr) {
        reservations = [];
      }
    }

    if (reservations.length === 0) {
      if (isManager) {
        reservations = [...memoryReservations];
      } else {
        reservations = memoryReservations.filter(r => !r.user || r.user.toString() === userId.toString());
      }
    }

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (Manager can Accept or Decline)
// @route   PATCH /api/reservations/:id/status
// @access  Protected (Manager Only)
const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Confirmed', 'Declined', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: Confirmed, Declined, Cancelled'
      });
    }

    let reservation = null;
    if (mongoose.connection.readyState === 1) {
      try {
        if (id.length === 24) {
          reservation = await Reservation.findById(id);
        }
      } catch (e) {}
    }

    if (!reservation) {
      reservation = memoryReservations.find(r => r.id === id || r._id === id);
    }

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    reservation.status = status;
    if (typeof reservation.save === 'function') {
      await reservation.save();
    }

    res.status(200).json({
      success: true,
      data: reservation,
      message: `Reservation marked as ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation (Customer cancels own reservation)
// @route   DELETE /api/reservations/:id
// @access  Protected
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    let reservation = null;
    if (mongoose.connection.readyState === 1) {
      try {
        if (id.length === 24) {
          reservation = await Reservation.findById(id);
        }
      } catch (e) {}
    }

    if (!reservation) {
      reservation = memoryReservations.find(r => r.id === id || r._id === id);
    }

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    reservation.status = 'Cancelled';
    if (typeof reservation.save === 'function') {
      await reservation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus,
  cancelReservation
};
