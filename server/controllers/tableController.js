const mongoose = require('mongoose');
const Table = require('../models/Table');

// Default tables data matching seed
const defaultTables = [
  { _id: '65a000000000000000000011', id: 'T1', number: 1, seats: 2, isActive: true, name: 'Table 1 (2 Seats - Garden View)' },
  { _id: '65a000000000000000000012', id: 'T2', number: 2, seats: 2, isActive: true, name: 'Table 2 (2 Seats - Quiet Corner)' },
  { _id: '65a000000000000000000013', id: 'T3', number: 3, seats: 4, isActive: true, name: 'Table 3 (4 Seats - Royal Arch)' },
  { _id: '65a000000000000000000014', id: 'T4', number: 4, seats: 4, isActive: true, name: 'Table 4 (4 Seats - Center Courtyard)' },
  { _id: '65a000000000000000000015', id: 'T5', number: 5, seats: 6, isActive: true, name: 'Table 5 (6 Seats - Family Alcove)' },
  { _id: '65a000000000000000000016', id: 'T6', number: 6, seats: 8, isActive: true, name: 'Table 6 (8 Seats - Imperial Divan)' }
];

// @desc    Get all active tables
// @route   GET /api/tables
// @access  Protected
const getTables = async (req, res, next) => {
  try {
    let tables = [];
    if (mongoose.connection.readyState === 1) {
      try {
        tables = await Table.find({ isActive: true }).sort({ number: 1 });
      } catch (e) {
        tables = [];
      }
    }

    if (tables.length === 0) {
      tables = defaultTables;
    }

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTables
};
