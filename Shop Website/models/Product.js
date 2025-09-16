// models/Product.js
const mongoose = require('mongoose');

/*const ProductSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  slug:       { type: String, required: true, unique: true }, // new
  price:      { type: Number, required: true },
  category:   { 
    type: String, 
    enum: ['tops', 'bottoms', 'shoes', 'accessories'], 
    required: true 
  },
  image:      { type: String, default: '/images/placeholders/placeholder.png' },
  description:{ type: String, default: '' } // new
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);*/

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  category: String,
  image: String,
  description: String
});

module.exports = mongoose.model('Product', productSchema);

