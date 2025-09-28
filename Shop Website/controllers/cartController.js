const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');

router.get('/', async (req, res) => {
  try {
    const sessionId = req.sessionID || 'guest-' + Date.now();
    const cart = await cartService.getCartWithProducts(sessionId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const sessionId = req.sessionID || 'guest-' + Date.now();
    const cart = await cartService.addToCart(sessionId, productId, quantity);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const sessionId = req.sessionID || 'guest-' + Date.now();
    const parsedQuantity = Math.max(1, parseInt(quantity) || 1);
    const cart = await cartService.setCartItemQuantity(sessionId, productId, parsedQuantity);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const sessionId = req.sessionID || 'guest-' + Date.now();
    await cartService.clearCart(sessionId);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;