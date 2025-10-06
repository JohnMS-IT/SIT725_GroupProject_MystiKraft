const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
  async getOrCreateCart(sessionId) {
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({ sessionId });
      await cart.save();
    }
    return cart;
  }

  async addToCart(sessionId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < 1) throw new Error('Product out of stock');

    const cart = await this.getOrCreateCart(sessionId);
    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
      if (newQuantity < 1) throw new Error('Cannot add product - insufficient stock');
      existingItem.quantity = newQuantity;
    } else {
      const itemQuantity = Math.min(quantity, product.stock);
      if (itemQuantity < 1) throw new Error('Cannot add product - insufficient stock');
      cart.items.push({
        productId,
        quantity: itemQuantity,
        price: product.price
      });
    }

    cart.total = this.calculateTotal(cart.items);
    cart.updatedAt = new Date();
    await cart.save();
    return cart;
  }

  async setCartItemQuantity(sessionId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      return this.removeFromCart(sessionId, productId);
    }

    const cart = await this.getOrCreateCart(sessionId);
    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    const finalQuantity = Math.max(1, Math.min(quantity, product.stock));

    if (existingItem) {
      existingItem.quantity = finalQuantity;
    } else {
      cart.items.push({
        productId,
        quantity: finalQuantity,
        price: product.price
      });
    }

    cart.total = this.calculateTotal(cart.items);
    cart.updatedAt = new Date();
    await cart.save();
    return cart;
  }

  async getCartWithProducts(sessionId) {
    const cart = await Cart.findOne({ sessionId }).populate('items.productId');
    return cart || { items: [], total: 0 };
  }

  calculateTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  async clearCart(sessionId) {
    await Cart.findOneAndDelete({ sessionId });
  }
}

module.exports = new CartService();
