// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  createdAt: Date
});

module.exports = mongoose.model('Product', productSchema);
