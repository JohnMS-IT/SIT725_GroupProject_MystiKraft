const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['shoes', 'tops', 'bottoms', 'accessories'], required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Convert ObjectIds to strings when returning JSON
productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    if (ret.sellerId) ret.sellerId = ret.sellerId.toString();
    return ret;
  }
});

// Export the Product model
module.exports = mongoose.model('Product', productSchema);
