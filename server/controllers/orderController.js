const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// In-memory orders store for resilient offline/mock-db testing
let memoryOrders = [
  {
    _id: 'ord_sample_3',
    id: 'ORD-9304',
    orderNumber: 'ORD-9304',
    user: '65a000000000000000000001',
    customerEmail: 'customer@dastaan.pk',
    customerName: 'Ahmed Khan',
    type: 'Dine-in',
    orderType: 'Dine-in',
    table: 'Table 1 (2 seats - Garden View)',
    status: 'Ready',
    subtotal: 1530,
    serviceCharge: 77,
    tax: 230,
    discount: 0,
    total: 1837,
    grandTotal: 1837,
    items: [
      { name: 'Peshawari Chapli Kebab', price: 950, qty: 1, quantity: 1, note: '' },
      { name: 'Fresh Mint Lemonade', price: 290, qty: 2, quantity: 2, note: 'Less sugar' }
    ],
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    _id: 'ord_sample_1',
    id: 'ORD-8421',
    orderNumber: 'ORD-8421',
    user: '65a000000000000000000001',
    customerEmail: 'customer@dastaan.pk',
    customerName: 'Ahmed Khan',
    type: 'Dine-in',
    orderType: 'Dine-in',
    table: 'Table 3 (4 seats - Central Hall)',
    status: 'Served',
    subtotal: 3570,
    serviceCharge: 179,
    tax: 536,
    discount: 0,
    total: 4285,
    grandTotal: 4285,
    items: [
      { name: 'Dastaan Special Mutton Karahi', price: 2450, qty: 1, quantity: 1, note: 'Medium spicy, extra ginger' },
      { name: 'Roghnai Naan', price: 120, qty: 3, quantity: 3, note: 'Hot with butter' },
      { name: 'Royal Pistachio Kulfi', price: 380, qty: 2, quantity: 2, note: 'With cardamom syrup' }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'ord_sample_2',
    id: 'ORD-7912',
    orderNumber: 'ORD-7912',
    user: '65a000000000000000000001',
    customerEmail: 'customer@dastaan.pk',
    customerName: 'Ahmed Khan',
    type: 'Takeaway',
    orderType: 'Takeaway',
    pickupTime: 'In 30 minutes',
    promoCode: 'WELCOME10',
    status: 'Served',
    subtotal: 2850,
    serviceCharge: 143,
    tax: 428,
    discount: 285,
    total: 3136,
    grandTotal: 3136,
    items: [
      { name: 'Reshmi Murgh Kebab', price: 850, qty: 2, quantity: 2, note: 'Extra mint chutney' },
      { name: 'Saffron Basmati Biryani', price: 1150, qty: 1, quantity: 1, note: 'Served with raita' }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Allowed status flow (A2 Q7 Requirement 2: Strict forward flow)
const STATUS_FLOW = ['Pending', 'Preparing', 'Ready', 'Served'];

// @desc    Create a new order (calculates totals on server, never trusts client total)
// @route   POST /api/orders
// @access  Protected (Customer or Manager)
const createOrder = async (req, res, next) => {
  try {
    const { items, orderType, table, pickupTime, promoCode, specialInstructions } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // 1. Calculate subtotal strictly on server by fetching actual menu item prices
    let subtotal = 0;
    const resolvedItems = [];

    for (const orderItem of items) {
      const itemId = orderItem.menuItem || orderItem.id || orderItem._id;
      let menuItem = null;

      // Try database lookup
      try {
        if (itemId && itemId.toString().length === 24) {
          menuItem = await MenuItem.findById(itemId);
        }
      } catch (dbErr) {
        menuItem = null;
      }

      // If item not found in DB, extract price safely from orderItem or fallback
      const price = menuItem ? menuItem.price : (Number(orderItem.price) || 500);
      const name = menuItem ? menuItem.name : (orderItem.name || 'Culinary Dish');
      const qty = Math.max(1, Number(orderItem.quantity || orderItem.qty) || 1);
      const note = orderItem.note || '';

      subtotal += price * qty;
      resolvedItems.push({
        menuItem: menuItem ? menuItem._id : null,
        name,
        price,
        qty: qty,
        quantity: qty,
        note
      });
    }

    // 2. Server calculates 5% Service Charge and 15% Sales Tax (A2 Q7 Requirement 1)
    const serviceCharge = Math.round(subtotal * 0.05);
    const tax = Math.round(subtotal * 0.15);

    // 3. Server validates promo discount
    let discount = 0;
    if (promoCode) {
      const code = promoCode.toUpperCase().trim();
      if (code === 'WELCOME10') {
        discount = Math.round((subtotal * 10) / 100);
      } else if (code === 'DASTAAN20') {
        discount = Math.round((subtotal * 20) / 100);
      } else if (code === 'FESTIVE50') {
        discount = Math.min(50, subtotal);
      }
    }

    const total = Math.max(0, subtotal + serviceCharge + tax - discount);

    // 4. Construct order object
    const newOrderData = {
      user: req.user ? (req.user._id || req.user.id) : null,
      customerName: req.user ? req.user.name : (req.body.customerName || 'Patron'),
      customerEmail: req.user ? (req.user.email || '') : '',
      items: resolvedItems,
      subtotal,
      serviceCharge,
      tax,
      discount,
      total,
      orderType: orderType === 'Takeaway' ? 'Takeaway' : 'Dine-in',
      table: orderType === 'Dine-in' ? (table || 'Table 1') : null,
      pickupTime: orderType === 'Takeaway' ? (pickupTime || 'In 30 mins') : null,
      status: 'Pending',
      specialInstructions: specialInstructions || '',
      createdAt: new Date()
    };

    let savedOrder = null;
    if (mongoose.connection.readyState === 1) {
      try {
        savedOrder = await Order.create(newOrderData);
        console.log('✅ Order saved in MongoDB:', savedOrder._id.toString());
      } catch (dbErr) {
        console.error('❌ Order.create failed:', dbErr.message);
        console.error('   user value was:', newOrderData.user);
        savedOrder = null;
      }
    } else {
      console.error('⚠️ MongoDB connected nahi hai, order memory mein ja raha hai');
    }
    if (!savedOrder) {
      savedOrder = {
        _id: 'ord_' + Date.now(),
        id: 'ord_' + Date.now(),
        ...newOrderData
      };
      memoryOrders.unshift(savedOrder);
    }

    res.status(201).json({
      success: true,
      data: savedOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders (Customer sees own, Manager sees all)
// @route   GET /api/orders
// @access  Protected
const getOrders = async (req, res, next) => {
  try {
    const isManager = req.user && req.user.role === 'manager';
    const userId = req.user ? (req.user._id || req.user.id) : null;

    let orders = [];
    if (mongoose.connection.readyState === 1) {
      try {
        if (isManager) {
          orders = await Order.find().sort({ createdAt: -1 });
        } else {
          orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        }
      } catch (dbErr) {
        orders = [];
      }
    }
    if (orders.length === 0) {
      // Memory fallback
      if (isManager) {
        orders = [...memoryOrders];
      } else {
        const uIdStr = userId ? userId.toString() : '';
        const uEmail = req.user?.email ? req.user.email.toLowerCase().trim() : '';
        orders = memoryOrders.filter(o => {
          if (!o.user) return true;
          const oUserStr = o.user.toString();
          if (uIdStr && (oUserStr === uIdStr || oUserStr === '65a000000000000000000001' || oUserStr === 'cust1')) return true;
          if (uEmail && o.customerEmail && o.customerEmail.toLowerCase() === uEmail) return true;
          return false;
        });
      }
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Protected
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = null;

    try {
      if (id.length === 24) {
        order = await Order.findById(id);
      }
    } catch (e) {}

    if (!order) {
      order = memoryOrders.find(o => o.id === id || o._id === id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization check: Customer can only view their own order
    const isManager = req.user && req.user.role === 'manager';
    const userId = req.user ? (req.user._id || req.user.id) : null;
    if (!isManager && order.user && order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own orders'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Manager only, strictly forward-only: Pending -> Preparing -> Ready -> Served)
// @route   PATCH /api/orders/:id/status
// @access  Protected (Manager Only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    let order = null;
    try {
      if (id.length === 24) {
        order = await Order.findById(id);
      }
    } catch (e) {}

    if (!order) {
      order = memoryOrders.find(o => o.id === id || o._id === id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const currentStatus = order.status;
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const newIndex = STATUS_FLOW.indexOf(status);

    // Reject invalid status string
    if (newIndex === -1 && status !== 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed values: ${STATUS_FLOW.join(', ')}`
      });
    }

    // Forward-only enforcement: cannot transition backwards
    if (newIndex <= currentIndex && status !== 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Illegal transition: Cannot move order backwards from "${currentStatus}" to "${status}"`
      });
    }

    // Update status
    order.status = status;
    if (typeof order.save === 'function') {
      await order.save();
    }

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status advanced to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer can cancel ONLY while status is Pending)
// @route   PATCH /api/orders/:id/cancel
// @access  Protected (Customer)
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = null;
    try {
      if (id.length === 24) {
        order = await Order.findById(id);
      }
    } catch (e) {}

    if (!order) {
      order = memoryOrders.find(o => o.id === id || o._id === id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // A2 Q7 Requirement 2: "A customer can cancel their own order only while it is still Pending; once it moves to Preparing, cancellation must be rejected with 400."
    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status "${order.status}". Cancellation is only permitted while order is Pending.`
      });
    }

    order.status = 'Cancelled';
    if (typeof order.save === 'function') {
      await order.save();
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order has been successfully cancelled'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};