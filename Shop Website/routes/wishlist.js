const express = require('express');
const router = express.Router();
const wishlistService = require('../services/wishlistService');

// Get wishlist
router.get('/', async (req, res) => {
  try {
    const sessionId = req.sessionID || 'guest-' + Date.now();
    const userId = req.user ? req.user._id : null;
    const wishlist = await wishlistService.getWishlistWithProducts(sessionId, userId);
    res.json(wishlist);
  } catch (err) {
    console.error('Error getting wishlist:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add to wishlist
router.post('/', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const sessionId = req.sessionID || 'guest-' + Date.now();
    const userId = req.user ? req.user._id : null;
    
    console.log('Adding to wishlist:', { sessionId, userId, productId });
    
    const result = await wishlistService.addToWishlist(sessionId, productId, userId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.json({ success: true, wishlist: result.wishlist });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const sessionId = req.sessionID || 'guest-' + Date.now();
    const userId = req.user ? req.user._id : null;
    
    const wishlist = await wishlistService.removeFromWishlist(sessionId, productId, userId);
    res.json({ success: true, wishlist });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ error: err.message });
  }
});

// Clear wishlist
router.delete('/', async (req, res) => {
  try {
    const sessionId = req.sessionID || 'guest-' + Date.now();
    const userId = req.user ? req.user._id : null;
    
    await wishlistService.clearWishlist(sessionId, userId);
    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (err) {
    console.error('Error clearing wishlist:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

