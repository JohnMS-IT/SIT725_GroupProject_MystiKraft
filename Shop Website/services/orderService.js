const Order = require('../models/Order');

class OrderService {
  // Generate order number
  generateOrderNumber() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  // Create order
  async createOrder(sessionId, customerInfo, cartItems) {
    const orderNumber = this.generateOrderNumber();
    
    const order = new Order({
      orderNumber,
      sessionId,
      customerInfo,
      items: cartItems.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    });

    await order.save();
    return order;
  }

  // Get order by order number
  async getOrderByNumber(orderNumber) {
    return await Order.findOne({ orderNumber }).populate('items.productId');
  }
}

module.exports = new OrderService();




