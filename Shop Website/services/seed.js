
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
<<<<<<< HEAD
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
=======
  // SHOES 
  { name: 'Nike Air Max', slug: 'nike-air-max', price: 120, category: 'shoes', image: '/images/shoes/NikeAir.jpg', description: 'Classic running shoes with air cushioning.', createdAt: new Date('2024-11-03') },
  { name: 'Ultraboost', slug: 'ultraboost', price: 220, category: 'shoes', image: '/images/shoes/ultraboost.jpg', description: 'High-performance running shoes.', createdAt: new Date('2025-01-15') },
  { name: 'Jordans', slug: 'jordans', price: 100, category: 'shoes', image: '/images/shoes/Jordans.webp', description: 'Basketball sneakers with iconic design.', createdAt: new Date('2025-03-22') },
  { name: 'Vans', slug: 'vans', price: 90, category: 'shoes', image: '/images/shoes/vans.webp', description: 'Casual skate shoes.', createdAt: new Date('2025-06-08') },

  // TOPS
  { name: 'Classic Tee', slug: 'classic-tee', price: 29.99, category: 'tops', image: '/images/tops.png', description: '100% cotton everyday tee.', createdAt: new Date('2024-12-19') },
  { name: 'Performance Hoodie', slug: 'performance-hoodie', price: 59.99, category: 'tops', image: '/images/tops.png', description: 'Moisture-wicking hoodie.', createdAt: new Date('2025-04-04') },

  // BOTTOMS
  { name: 'Slim Chinos', slug: 'slim-chinos', price: 49.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Smart casual chinos.', createdAt: new Date('2025-02-10') },
  { name: 'Flex Joggers', slug: 'flex-joggers', price: 39.99, category: 'bottoms', image: '/images/bottoms.png', description: 'Comfy joggers for daily wear.', createdAt: new Date('2025-05-27') },

  // ACCESSORIES
  { name: 'Canvas Cap', slug: 'canvas-cap', price: 19.99, category: 'accessories', image: '/images/accessories.png', description: 'Adjustable strapback cap.', createdAt: new Date('2025-07-14') },
  { name: 'Utility Backpack', slug: 'utility-backpack', price: 69.99, category: 'accessories', image: '/images/accessories.png', description: '15L daily carry backpack.', createdAt: new Date('2025-08-30') }
>>>>>>> 3cd66255b635bc04aedf089202ad0d958fc62b80
];

(async () => {
  try {
<<<<<<< HEAD
    await mongoose.connect(mongoURI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded successfully...');
    mongoose.connection.close();
=======
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded...');
    await mongoose.connection.close();
>>>>>>> 3cd66255b635bc04aedf089202ad0d958fc62b80
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
})();
