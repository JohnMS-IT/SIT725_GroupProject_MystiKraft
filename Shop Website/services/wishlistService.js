const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

class WishlistService {
  // Get or create wishlist
  async getOrCreateWishlist(sessionId, userId = null) {
    let wishlist;
    
    if (userId) {
      wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
        await wishlist.save();
      }
    } else {
      wishlist = await Wishlist.findOne({ sessionId });
      if (!wishlist) {
        wishlist = new Wishlist({ sessionId, items: [] });
        await wishlist.save();
      }
    }
    
    return wishlist;
  }

  // Get wishlist with populated products
  async getWishlistWithProducts(sessionId, userId = null) {
    let wishlist;
    
    if (userId) {
      wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    } else {
      wishlist = await Wishlist.findOne({ sessionId }).populate('items.productId');
    }
    
    return wishlist || { items: [] };
  }

  // Add product to wishlist
  async addToWishlist(sessionId, productId, userId = null) {
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const wishlist = await this.getOrCreateWishlist(sessionId, userId);
    
    // Check if product already in wishlist
    const exists = wishlist.items.find(item => 
      item.productId.toString() === productId.toString()
    );
    
    if (exists) {
      return { success: false, message: 'Product already in wishlist' };
    }
    
    wishlist.items.push({ productId });
    wishlist.updatedAt = new Date();
    await wishlist.save();
    
    return { success: true, wishlist };
  }

  // Remove product from wishlist
  async removeFromWishlist(sessionId, productId, userId = null) {
    const wishlist = await this.getOrCreateWishlist(sessionId, userId);
    
    wishlist.items = wishlist.items.filter(item => 
      item.productId.toString() !== productId
    );
    
    wishlist.updatedAt = new Date();
    await wishlist.save();
    
    return wishlist;
  }

  // Clear wishlist
  async clearWishlist(sessionId, userId = null) {
    if (userId) {
      await Wishlist.findOneAndDelete({ userId });
    } else {
      await Wishlist.findOneAndDelete({ sessionId });
    }
  }

  // Get wishlist count
  async getWishlistCount(sessionId, userId = null) {
    const wishlist = await this.getOrCreateWishlist(sessionId, userId);
    return wishlist.items.length;
  }
}

module.exports = new WishlistService();

