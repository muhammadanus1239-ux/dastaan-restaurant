const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: false
    },
    table: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Table',
      required: [true, 'Reservation must specify a table']
    },
    tableName: {
      type: String,
      default: ''
    },
    tableNumber: {
      type: Number,
      default: 1
    },
    date: {
      type: String,
      required: [true, 'Please provide booking date (YYYY-MM-DD)']
    },
    timeSlot: {
      type: String,
      required: [true, 'Please provide time slot (e.g., 19:00)']
    },
    partySize: {
      type: Number,
      required: [true, 'Please provide party size'],
      min: [1, 'Party size must be at least 1'],
      max: [12, 'Party size cannot exceed 12']
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number']
    },
    customerName: {
      type: String,
      default: ''
    },
    specialRequests: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Confirmed', 'Declined', 'Cancelled'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate active bookings on the same table, date, and time slot at the database engine level
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'Cancelled' } } }
);

module.exports = mongoose.model('Reservation', reservationSchema);
