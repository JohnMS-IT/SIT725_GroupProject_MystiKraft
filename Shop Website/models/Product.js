// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: String,
  price: { type: Number, required: true },
  category: { type: String, required: true }, // men, women, kids, accessories
  subcategory: String,
  image: { type: String, required: true },
  description: String,
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  brand: { type: String }, // Nike, Adidas, Puma, etc.
  size: [{ type: String }], // Array: ['S', 'M', 'L', 'XL'] or ['7', '8', '9']
  colour: [{ type: String }], // Array: ['Black', 'White', 'Red']
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
