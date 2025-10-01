const Order = require('../models/Order');
const Product = require('../models/Product');

class OrderService {
  generateOrderNumber() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  async createOrder(sessionId, customerInfo, cartItems) {
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.name}`);
      if (item.quantity > product.stock) throw new Error(`Not enough stock for ${product.name}`);
      product.stock -= item.quantity;
      await product.save();
    }

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

  async getOrderByNumber(orderNumber) {
    return await Order.findOne({ orderNumber }).populate('items.productId');
  }
}

module.exports = new OrderService();
