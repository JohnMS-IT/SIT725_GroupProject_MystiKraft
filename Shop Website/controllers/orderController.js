const orderService = require('../services/orderService');
const cartService = require('../services/cartService');

class OrderController {
  // Create order
  async createOrder(req, res) {
    try {
      const { customerInfo } = req.body;
      const sessionId = req.sessionID || req.headers['x-session-id'] || 'guest-' + Date.now();
      
      // Get cart items
      const cart = await cartService.getCartWithProducts(sessionId);
      if (!cart.items || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Create order
      const order = await orderService.createOrder(sessionId, customerInfo, cart.items);
      
      // Clear cart after successful order
      await cartService.clearCart(sessionId);
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get order by number
  async getOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OrderController();




