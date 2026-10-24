const express = require('express');
const router = express.Router();
const { getTables } = require('../controllers/tableController');
const { protect } = require('../middleware/auth');

// Endpoint 10: GET /api/tables
router.route('/')
  .get(protect, getTables);

module.exports = router;
