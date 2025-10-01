const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const { sendOrderConfirmationEmail } = require('../utils/orderEmail');

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
      
      // Populate productId to ensure full info for email
      await order.populate('items.productId').execPopulate?.(); // mongoose 6+ may not need execPopulate
      
      // Clear cart
      await cartService.clearCart(sessionId);

      // Send confirmation email safely
      try {
        const itemsForEmail = order.items.map(i => ({
          name: i.name || i.productId?.name || 'Unnamed Product',
          price: i.price || 0,
          quantity: i.quantity || 1
        }));
        const safeOrder = {
          ...order.toObject(),
          items: itemsForEmail
        };
        await sendOrderConfirmationEmail(order.customerInfo.email, safeOrder);
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }
      
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

  // Get user's order history
  async getUserOrders(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const orders = await orderService.getOrdersByUserEmail(req.user.email);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all orders (admin only)
  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const order = await orderService.updateOrderStatus(id, status);
      
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
