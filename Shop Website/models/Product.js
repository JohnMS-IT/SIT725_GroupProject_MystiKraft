// models/Product.js
const mongoose = require('mongoose');

<<<<<<< HEAD
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: String,
  image: { type: String, required: true },
  description: String,
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
=======
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  createdAt: Date
>>>>>>> 3cd66255b635bc04aedf089202ad0d958fc62b80
});

module.exports = mongoose.model('Product', productSchema);
