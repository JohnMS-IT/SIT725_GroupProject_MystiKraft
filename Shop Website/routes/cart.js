const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET /api/cart - Get cart
router.get('/', cartController.getCart);

// POST /api/cart - Add to cart
router.post('/', cartController.addToCart);

// DELETE /api/cart - Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;
