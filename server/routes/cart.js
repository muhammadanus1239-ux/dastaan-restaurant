const express = require('express');
const Cart = require('../models/Cart');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items },
      { upsert: true, new: true }
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  res.json(cart || { items: [] });
});

module.exports = router;