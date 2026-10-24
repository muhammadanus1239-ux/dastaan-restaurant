const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'MenuItem',
    required: false
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  quantity: {
    type: Number,
    default: 1
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: false
    },
    customerName: {
      type: String,
      default: 'Patron'
    },
    customerEmail: {
      type: String,
      default: ''
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    serviceCharge: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    type: {
      type: String,
      required: [true, 'Order type is required'],
      enum: ['Dine-in', 'Takeaway'],
      default: 'Dine-in'
    },
    orderType: {
      type: String,
      enum: ['Dine-in', 'Takeaway'],
      default: 'Dine-in'
    },
    table: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Table',
      default: null
    },
    pickupTime: {
      type: String,
      default: ''
    },
    promoCode: {
      type: String,
      default: ''
    },
    specialInstructions: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'],
        message: 'Status must be Pending, Preparing, Ready, Served, or Cancelled'
      },
      default: 'Pending'
    },
    idempotencyKey: {
      type: String,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
