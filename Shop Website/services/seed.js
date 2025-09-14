
const mongoose = require('mongoose');
const Product = require('../models/Product');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

const products = [
  { name: 'Nike Air Max', price: 120, category: 'mens', subcategory: 'running', image: 'NikeAir.jpg', description: 'Comfortable running shoes', stock: 50, featured: true },
  { name: 'Ultraboost', price: 220, category: 'mens', subcategory: 'running', image: 'ultraboost.jpg', description: 'Premium running shoes', stock: 30, featured: true },
  { name: 'Jordans', price: 100, category: 'mens', subcategory: 'basketball', image: 'Jordans.webp', description: 'Classic basketball shoes', stock: 25, featured: false },
  { name: 'Vans', price: 90, category: 'womens', subcategory: 'casual', image: 'vans.webp', description: 'Casual lifestyle shoes', stock: 40, featured: false },
  { name: 'Vomero', price: 160, category: 'womens', subcategory: 'running', image: 'Vomero.webp', description: 'Women\'s running shoes', stock: 35, featured: true },
  { name: 'Pegasus Air', price: 210, category: 'womens', subcategory: 'running', image: 'Pegasus.jpg', description: 'High-performance running', stock: 20, featured: false },
  { name: 'Ultraboost Kids', price: 80, category: 'kids', subcategory: 'running', image: 'ultraboostkids.avif', description: 'Kids running shoes', stock: 15, featured: true },
  { name: 'Vomero Kids', price: 80, category: 'kids', subcategory: 'running', image: 'vomerokids.webp', description: 'Kids running shoes', stock: 12, featured: false },
  { name: 'Jordans Kids', price: 80, category: 'kids', subcategory: 'basketball', image: 'jordanskids.webp', description: 'Kids basketball shoes', stock: 18, featured: true },
  { name: 'Running Shoes', price: 150, category: 'mens', subcategory: 'running', image: 'running.webp', description: 'Professional running shoes', stock: 22, featured: false },
  { name: 'Skate Shoes', price: 95, category: 'mens', subcategory: 'skate', image: 'skate.webp', description: 'Durable skate shoes', stock: 28, featured: false },
  { name: 'Sneakers', price: 110, category: 'mens', subcategory: 'casual', image: 'Sneakers.jpg', description: 'Classic sneakers', stock: 33, featured: false },
  { name: 'Basketball Shoes', price: 130, category: 'mens', subcategory: 'basketball', image: 'basketball.jpg', description: 'High-performance basketball', stock: 19, featured: false },
  { name: 'Women\'s Shoes', price: 140, category: 'womens', subcategory: 'casual', image: 'womens.png', description: 'Stylish women\'s shoes', stock: 26, featured: false },
  { name: 'Kids Shoes', price: 70, category: 'kids', subcategory: 'casual', image: 'kids.avif', description: 'Comfortable kids shoes', stock: 31, featured: false }
];

const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded successfully...');
    mongoose.connection.close();
  } catch (err) {
    console.error(err.message);
    mongoose.connection.close();
  }
};

seedDB();
