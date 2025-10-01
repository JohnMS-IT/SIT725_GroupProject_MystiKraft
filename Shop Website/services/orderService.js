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

  // Get orders by user email
  async getOrdersByUserEmail(email) {
    return await Order.find({ 'customerInfo.email': email }).sort({ createdAt: -1 });
  }

  // Get all orders
  async getAllOrders() {
    return await Order.find({}).sort({ createdAt: -1 });
  }

  // Update order status
  async updateOrderStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  }
}

module.exports = new OrderService();




