const cartService = require('../services/cartService');

class CartController {
  // Get cart
  async getCart(req, res) {
    try {
      const sessionId = req.sessionID || req.headers['x-session-id'] || 'guest-' + Date.now();
      const cart = await cartService.getCartWithProducts(sessionId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Add to cart
  async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      const sessionId = req.sessionID || req.headers['x-session-id'] || 'guest-' + Date.now();
      
      const cart = await cartService.addToCart(sessionId, productId, quantity);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Clear cart
  async clearCart(req, res) {
    try {
      const sessionId = req.sessionID || req.headers['x-session-id'] || 'guest-' + Date.now();
      await cartService.clearCart(sessionId);
      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CartController();


