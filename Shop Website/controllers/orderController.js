const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const { sendOrderConfirmationEmail } = require('../utils/orderEmail');

class OrderController {
  async createOrder(req, res) {
    try {
      const { customerInfo } = req.body;
      const sessionId = req.sessionID || req.headers['x-session-id'] || 'guest-' + Date.now();

      const cart = await cartService.getCartWithProducts(sessionId);
      if (!cart.items || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

      // Pass io instance to createOrder
      const order = await orderService.createOrder(sessionId, customerInfo, cart.items, req.app.locals.io);

      await cartService.clearCart(sessionId);

      try {
        const itemsForEmail = order.items.map(i => ({
          name: i.name || i.productId?.name || 'Unnamed Product',
          price: i.price || 0,
          quantity: i.quantity || 1
        }));
        const safeOrder = { ...order.toObject(), items: itemsForEmail };
        await sendOrderConfirmationEmail(order.customerInfo.email, safeOrder);
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OrderController();