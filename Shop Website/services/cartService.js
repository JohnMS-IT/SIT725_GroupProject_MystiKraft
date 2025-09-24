const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
  // Get or create cart for session
  async getOrCreateCart(sessionId) {
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({ sessionId });
      await cart.save();
    }
    return cart;
  }

  // Add item to cart
  async addToCart(sessionId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const cart = await this.getOrCreateCart(sessionId);
    
    // Check if item already exists
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }
    
    cart.total = this.calculateTotal(cart.items);
    cart.updatedAt = new Date();
    await cart.save();
    
    return cart;
  }

  // Get cart with populated products
  async getCartWithProducts(sessionId) {
    const cart = await Cart.findOne({ sessionId }).populate('items.productId');
    return cart || { items: [], total: 0 };
  }

  // Calculate total
  calculateTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Clear cart
  async clearCart(sessionId) {
    await Cart.findOneAndDelete({ sessionId });
  }
}

module.exports = new CartService();

