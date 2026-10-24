const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide item description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide item price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: {
      values: ['Starters', 'Mains', 'Desserts', 'Drinks'],
      message: 'Category must be Starters, Mains, Desserts, or Drinks'
    }
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
