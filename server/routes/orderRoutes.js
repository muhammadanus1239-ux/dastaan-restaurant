const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, managerOnly } = require('../middleware/auth');

// Customer & Manager routes
router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

router.route('/:id')
  .get(protect, getOrderById);

// Customer cancellation (only permitted while Pending)
router.route('/:id/cancel')
  .patch(protect, cancelOrder);

// Manager status update (strictly forward-only: Pending -> Preparing -> Ready -> Served)
router.route('/:id/status')
  .patch(protect, managerOnly, updateOrderStatus);

module.exports = router;
