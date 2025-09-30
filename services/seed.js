// services/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Default seller ID for all products
const defaultSellerId = '64a7f0c2e4b0f5a1b2c3d4e5'; // Example ObjectId

// Sample shop data
const products = [
  { name: 'Nike Air Max', slug: 'nike-air-max', price: 120, category: 'shoes', image: '/images/shoes/NikeAir.jpg', description: 'Classic running shoes with air cushioning.', createdAt: new Date('2024-11-03'), sellerId: defaultSellerId },
  { name: 'Ultraboost', slug: 'ultraboost', price: 220, category: 'shoes', image: '/images/shoes/ultraboost.jpg', description: 'High-performance running shoes.', createdAt: new Date('2025-01-15'), sellerId: defaultSellerId },
  { name: 'Jordans', slug: 'jordans', price: 100, category: 'shoes', image: '/images/shoes/Jordans.webp', description: 'Basketball sneakers with iconic design.', createdAt: new Date('2025-03-22'), sellerId: defaultSellerId },
  { name: 'Vans', slug: 'vans', price: 90, category: 'shoes', image: '/images/shoes/vans.webp', description: 'Casual skate shoes.', createdAt: new Date('2025-06-08'), sellerId: defaultSellerId },
  { name: 'Classic Tee', slug: 'classic-tee', price: 29.99, category: 'tops', image: '/images/tops.png', description: '100% cotton everyday tee.', createdAt: new Date('2024-12-19'), sellerId: defaultSellerId },
  { name: 'Performance Hoodie', slug: 'performance-hoodie', price: 59.99, category: 'tops', image: '/images/tops.png', description: 'Moisture-wicking hoodie.', createdAt: new Date('2025-04-04'), sellerId: defaultSellerId },
  { name: 'Slim Chinos', slug: 'slim-chinos', price: 49.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Smart casual chinos.', createdAt: new Date('2025-02-10'), sellerId: defaultSellerId },
  { name: 'Flex Joggers', slug: 'flex-joggers', price: 39.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Comfy joggers for daily wear.', createdAt: new Date('2025-05-27'), sellerId: defaultSellerId },
  { name: 'Canvas Cap', slug: 'canvas-cap', price: 19.99, category: 'accessories', image: '/images/accessories.png', description: 'Adjustable strapback cap.', createdAt: new Date('2025-07-14'), sellerId: defaultSellerId },
  { name: 'Utility Backpack', slug: 'utility-backpack', price: 69.99, category: 'accessories', image: '/images/accessories.png', description: '15L daily carry backpack.', createdAt: new Date('2025-08-30'), sellerId: defaultSellerId }
];

(async () => {
  try {// Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Product data seeded successfully.');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Seeding failed:', err);
    mongoose.connection.close();
  }
})();
