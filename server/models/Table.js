const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: [true, 'Please provide a table number'],
    unique: true
  },
  seats: {
    type: Number,
    required: [true, 'Please provide number of seats'],
    min: [1, 'Seats must be at least 1'],
    max: [12, 'Seats cannot exceed 12']
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Table', tableSchema);
