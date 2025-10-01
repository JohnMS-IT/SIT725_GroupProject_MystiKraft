// services/orderService.js
const Order = require('../models/Order');
const Product = require('../models/Product');

class OrderService {
  generateOrderNumber() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  async createOrder(sessionId, customerInfo, cartItems, io) {
    console.log('=== ORDER SERVICE: Starting order creation ===');
    console.log('Session ID:', sessionId);
    console.log('Cart items count:', cartItems.length);
    console.log('IO instance available:', !!io);
    
    const stockAlerts = []; // Store stock alerts

    for (const item of cartItems) {
      console.log(`Processing item:`, item);
      
      const product = await Product.findById(item.productId || item._id);
      if (!product) {
        console.error(`Product not found for ID:`, item.productId || item._id);
        throw new Error(`Product not found: ${item.name || 'Unknown product'}`);
      }
      
      if (item.quantity > product.stock) {
        throw new Error(`Not enough stock for ${product.name}`);
      }
      
      product.stock -= item.quantity;
      await product.save();

      console.log(`Product: ${product.name}, New Stock: ${product.stock}`);

      // Check stock level and send appropriate notifications
      if (product.stock > 7) {
        // Restock alert - stock is above 7
        console.log(`>>> TRIGGERING RESTOCK ALERT for: ${product.name}`);
        stockAlerts.push({
          type: 'restocked',
          productName: product.name,
          stock: product.stock,
          productId: product._id,
          message: `We just restocked ${product.name}, now have sufficient inventory!`
        });
      } else if (product.stock < 3) {
        // Low stock alert - stock is below 3
        console.log(`>>> TRIGGERING LOW STOCK ALERT for: ${product.name}`);
        stockAlerts.push({
          type: 'low-stock',
          productName: product.name,
          stock: product.stock,
          productId: product._id,
          message: `${product.name} is running low, only ${product.stock} items left!`
        });
      }
    }

    const orderNumber = this.generateOrderNumber();
    console.log(`Generated order number: ${orderNumber}`);
    
    const order = new Order({
      orderNumber,
      sessionId,
      customerInfo,
      items: cartItems.map(item => ({
        productId: item.productId || item._id,
        name: item.name || item.productId?.name || 'Unknown Product',
        price: item.price,
        quantity: item.quantity
      })),
      total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    });

    await order.save();
    console.log(`Order saved successfully: ${orderNumber}`);

    // Send stock alerts via Socket.IO with delay to allow page transition
    if (io && stockAlerts.length > 0) {
      console.log(`>>> EMITTING ${stockAlerts.length} STOCK ALERTS VIA SOCKET.IO`);
      
      // Delay emission to allow client page transition and reconnection
      setTimeout(() => {
        console.log('Delayed emission - sending stock alerts now');
        stockAlerts.forEach(alert => {
          console.log(`Emitting alert:`, alert);
          io.emit('stock-alert', alert);
        });
      }, 1500); // 1.5 second delay to allow page transition and Socket.IO reconnection
    } else {
      console.log('No stock alerts to emit');
      console.log('Stock alerts count:', stockAlerts.length);
    }

    console.log('=== ORDER SERVICE: Order creation completed ===');
    return order;
  }

  async getOrderByNumber(orderNumber) {
    return await Order.findOne({ orderNumber }).populate('items.productId');
  }
}

module.exports = new OrderService();