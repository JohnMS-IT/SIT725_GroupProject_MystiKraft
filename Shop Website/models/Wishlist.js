// models/Wishlist.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  // User reference (can be userId or sessionId for guests)
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  sessionId: {
    type: String,
    sparse: true
  },
  // Array of product references
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one wishlist per user or session
wishlistSchema.index({ userId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);

