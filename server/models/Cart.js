const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: String,
  items: [{ itemId: String, name: String, price: Number, qty: Number }],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);