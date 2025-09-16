const mongoose = require('mongoose');
const Product = require('../models/Product');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

const products = [
  // SHOES
  { name: 'Nike Air Max', slug: 'nike-air-max', price: 120, category: 'shoes', image: '/images/shoes/NikeAir.jpg', description: 'Classic running shoes with air cushioning.' },
  { name: 'Ultraboost', slug: 'ultraboost', price: 220, category: 'shoes', image: '/images/shoes/ultraboost.jpg', description: 'High-performance running shoes.' },
  { name: 'Jordans', slug: 'jordans', price: 100, category: 'shoes', image: '/images/shoes/Jordans.webp', description: 'Basketball sneakers with iconic design.' },
  { name: 'Vans', slug: 'vans', price: 90, category: 'shoes', image: '/images/shoes/vans.webp', description: 'Casual skate shoes.' },

  // TOPS
  { name: 'Classic Tee', slug: 'classic-tee', price: 29.99, category: 'tops', image: '/images/tops.png', description: '100% cotton everyday tee.' },
  { name: 'Performance Hoodie', slug: 'performance-hoodie', price: 59.99, category: 'tops', image: '/images/tops.png', description: 'Moisture-wicking hoodie.' },

  // BOTTOMS
  { name: 'Slim Chinos', slug: 'slim-chinos', price: 49.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Smart casual chinos.' },
  { name: 'Flex Joggers', slug: 'flex-joggers', price: 39.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Comfy joggers for daily wear.' },

  // ACCESSORIES
  { name: 'Canvas Cap', slug: 'canvas-cap', price: 19.99, category: 'accessories', image: '/images/accessories.png', description: 'Adjustable strapback cap.' },
  { name: 'Utility Backpack', slug: 'utility-backpack', price: 69.99, category: 'accessories', image: '/images/accessories.png', description: '15L daily carry backpack.' }
];

(async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded...');
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
})();
