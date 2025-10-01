const mongoose = require('mongoose');
const Product = require('../models/Product');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

const products = [
  { name: 'Nike Air Max', price: 120, category: 'mens', subcategory: 'running', image: '/images/shoes/NikeAir.jpg', description: 'Comfortable running shoes', featured: true, stock: 7 },
  { name: 'Ultraboost', price: 220, category: 'mens', subcategory: 'running', image: '/images/shoes/ultraboost.jpg', description: 'Premium running shoes', featured: true, stock: 3 },
  { name: 'Jordans', price: 100, category: 'mens', subcategory: 'basketball', image: '/images/shoes/Jordans.webp', description: 'Classic basketball shoes', featured: false, stock: 9 },
  { name: 'Vans', price: 90, category: 'womens', subcategory: 'casual', image: '/images/shoes/vans.webp', description: 'Casual lifestyle shoes', featured: false, stock: 5 },
  { name: 'Vomero', price: 160, category: 'womens', subcategory: 'running', image: '/images/shoes/Vomero.webp', description: 'Women\'s running shoes', featured: true, stock: 2 },
  { name: 'Pegasus Air', price: 210, category: 'womens', subcategory: 'running', image: '/images/shoes/Pegasus.jpg', description: 'High-performance running', featured: false, stock: 8 },
  { name: 'Ultraboost Kids', price: 80, category: 'kids', subcategory: 'running', image: '/images/shoes/ultraboostkids.avif', description: 'Kids running shoes', featured: true, stock: 4 },
  { name: 'Vomero Kids', price: 80, category: 'kids', subcategory: 'running', image: '/images/shoes/vomerokids.webp', description: 'Kids running shoes', featured: false, stock: 10 },
  { name: 'Jordans Kids', price: 80, category: 'kids', subcategory: 'basketball', image: '/images/shoes/jordanskids.webp', description: 'Kids basketball shoes', featured: true, stock: 6 },
  { name: 'Running Shoes', price: 150, category: 'mens', subcategory: 'running', image: '/images/shoes/running.webp', description: 'Professional running shoes', featured: false, stock: 1 },
  { name: 'Skate Shoes', price: 95, category: 'mens', subcategory: 'skate', image: '/images/shoes/skate.webp', description: 'Durable skate shoes', featured: false, stock: 9 },
  { name: 'Sneakers', price: 110, category: 'mens', subcategory: 'casual', image: '/images/shoes/Sneakers.jpg', description: 'Classic sneakers', featured: false, stock: 2 },
  { name: 'Basketball Shoes', price: 130, category: 'mens', subcategory: 'basketball', image: '/images/shoes/basketball.jpg', description: 'High-performance basketball', featured: false, stock: 7 },
  { name: 'Women\'s Shoes', price: 140, category: 'womens', subcategory: 'casual', image: '/images/shoes/womens.png', description: 'Stylish women\'s shoes', featured: false, stock: 3 },
  { name: 'Kids Shoes', price: 70, category: 'kids', subcategory: 'casual', image: '/images/shoes/kids.avif', description: 'Comfortable kids shoes', featured: false, stock: 6 },

  // SHOES
  { name: 'Nike Air Max', slug: 'nike-air-max', price: 120, category: 'shoes', image: '/images/shoes/NikeAir.jpg', description: 'Classic running shoes with air cushioning.', createdAt: new Date('2024-11-03'), stock: 8 },
  { name: 'Ultraboost', slug: 'ultraboost', price: 220, category: 'shoes', image: '/images/shoes/ultraboost.jpg', description: 'High-performance running shoes.', createdAt: new Date('2025-01-15'), stock: 5 },
  { name: 'Jordans', slug: 'jordans', price: 100, category: 'shoes', image: '/images/shoes/Jordans.webp', description: 'Basketball sneakers with iconic design.', createdAt: new Date('2025-03-22'), stock: 1 },
  { name: 'Vans', slug: 'vans', price: 90, category: 'shoes', image: '/images/shoes/vans.webp', description: 'Casual skate shoes.', createdAt: new Date('2025-06-08'), stock: 4 },

  // TOPS
  { name: 'Classic Tee', slug: 'classic-tee', price: 29.99, category: 'tops', image: '/images/tops.png', description: '100% cotton everyday tee.', createdAt: new Date('2024-12-19'), stock: 2 },
  { name: 'Performance Hoodie', slug: 'performance-hoodie', price: 59.99, category: 'tops', image: '/images/tops.png', description: 'Moisture-wicking hoodie.', createdAt: new Date('2025-04-04'), stock: 7 },

  // BOTTOMS
  { name: 'Slim Chinos', slug: 'slim-chinos', price: 49.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Smart casual chinos.', createdAt: new Date('2025-02-10'), stock: 9 },
  { name: 'Flex Joggers', slug: 'flex-joggers', price: 39.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Comfy joggers for daily wear.', createdAt: new Date('2025-05-27'), stock: 6 },

  // ACCESSORIES
  { name: 'Canvas Cap', slug: 'canvas-cap', price: 19.99, category: 'accessories', image: '/images/accessories.png', description: 'Adjustable strapback cap.', createdAt: new Date('2025-07-14'), stock: 5 },
  { name: 'Utility Backpack', slug: 'utility-backpack', price: 69.99, category: 'accessories', image: '/images/accessories.png', description: '15L daily carry backpack.', createdAt: new Date('2025-08-30'), stock: 10 }
];

(async () => {
  try {
    await mongoose.connect(mongoURI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded successfully...');
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
})();
