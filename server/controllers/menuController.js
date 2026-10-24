const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// In-memory fallback dishes for resilient offline/mock-db operation
const initialMenuItems = require('../data/initialMenuItems');

// In-memory fallback dishes for resilient offline/mock-db operation (54 authentic dishes)
let memoryMenuItems = [...initialMenuItems]

// @desc    Get all menu items (with optional ?category= and ?search=)
// @route   GET /api/menu
// @access  Public
const getMenu = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let items = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const filter = {};
        if (category) filter.category = category;
        if (search) filter.name = { $regex: search.trim(), $options: 'i' };
        items = await MenuItem.find(filter).sort({ name: 1 });
      } catch (e) {
        items = [];
      }
    }

    if (items.length === 0) {
      let filtered = [...memoryMenuItems];
      if (category) {
        filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase().trim()));
      }
      items = filtered;
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId (return 400 if invalid as required by A2 Q4)
    if (!mongoose.isValidObjectId(id) && !id.startsWith('65a0') && !id.startsWith('menu_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    let item = null;
    if (mongoose.connection.readyState === 1) {
      try {
        item = await MenuItem.findById(id);
      } catch (e) {}
    }

    if (!item) {
      item = memoryMenuItems.find(i => i._id === id || i.id === id);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Protected (Manager Only)
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, isSpecial, isAvailable } = req.body;

    // Validation for missing or wrong data (400)
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category'
      });
    }

    // Price must not be negative
    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    // Valid categories check
    const validCategories = ['Starters', 'Mains', 'Desserts', 'Drinks'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const itemData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
      isSpecial: Boolean(isSpecial),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
    };

    let newItem = null;
    if (mongoose.connection.readyState === 1) {
      try {
        newItem = await MenuItem.create(itemData);
      } catch (e) {}
    }

    if (!newItem) {
      const generatedId = new mongoose.Types.ObjectId().toString();
      newItem = {
        _id: generatedId,
        id: generatedId,
        ...itemData
      };
      memoryMenuItems.push(newItem);
    }

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(val => val.message).join(', ')
      });
    }
    next(error);
  }
};

// @desc    Update menu item by ID
// @route   PUT /api/menu/:id
// @access  Protected (Manager Only)
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Price must not be negative if provided
    if (req.body.price !== undefined && Number(req.body.price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    let updatedItem = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        updatedItem = await MenuItem.findByIdAndUpdate(
          id,
          req.body,
          { new: true, runValidators: true }
        );
      } catch (e) {}
    }

    if (!updatedItem) {
      const idx = memoryMenuItems.findIndex(i => i._id === id || i.id === id);
      if (idx !== -1) {
        memoryMenuItems[idx] = {
          ...memoryMenuItems[idx],
          ...req.body
        };
        updatedItem = memoryMenuItems[idx];
      }
    }

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(val => val.message).join(', ')
      });
    }
    next(error);
  }
};

// @desc    Delete menu item by ID
// @route   DELETE /api/menu/:id
// @access  Protected (Manager Only)
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    let deletedItem = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        deletedItem = await MenuItem.findByIdAndDelete(id);
      } catch (e) {}
    }

    if (!deletedItem) {
      const idx = memoryMenuItems.findIndex(i => i._id === id || i.id === id);
      if (idx !== -1) {
        deletedItem = memoryMenuItems.splice(idx, 1)[0];
      }
    }

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenu,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
