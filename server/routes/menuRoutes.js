const express = require('express');
const router = express.Router();
const {
  getMenu,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, managerOnly } = require('../middleware/auth');

// Public route: GET /api/menu
// Protected manager-only route: POST /api/menu (A2 Q5)
router.route('/')
  .get(getMenu)
  .post(protect, managerOnly, createMenuItem);

// Public route: GET /api/menu/:id
// Protected manager-only routes: PUT, DELETE /api/menu/:id (A2 Q5)
router.route('/:id')
  .get(getMenuItemById)
  .put(protect, managerOnly, updateMenuItem)
  .delete(protect, managerOnly, deleteMenuItem);

module.exports = router;
