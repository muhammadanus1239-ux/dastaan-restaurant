const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservations,
  updateReservationStatus,
  cancelReservation
} = require('../controllers/reservationController');
const { protect, managerOnly } = require('../middleware/auth');

// Customer and Manager routes
router.route('/')
  .post(protect, createReservation)
  .get(protect, getReservations);

// Manager approval/decline
router.route('/:id/status')
  .patch(protect, managerOnly, updateReservationStatus);

// Customer cancellation
router.route('/:id')
  .delete(protect, cancelReservation);

module.exports = router;
