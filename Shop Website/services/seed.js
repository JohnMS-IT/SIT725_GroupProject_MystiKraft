const mongoose = require('mongoose');
const Product = require('../models/Product');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

const products = [
  // MEN'S PRODUCTS
  { name: 'Nike Air Max', price: 120, category: 'men', subcategory: 'running', image: '/images/shoes/NikeAir.jpg', description: 'Comfortable running shoes', stock: 50, featured: true, brand: 'Nike', size: ['8', '9', '10', '11'], colour: ['Black', 'White'] },
  { name: 'Adidas Ultraboost', price: 220, category: 'men', subcategory: 'running', image: '/images/shoes/ultraboost.jpg', description: 'Premium running shoes', stock: 30, featured: true, brand: 'Adidas', size: ['8', '9', '10'], colour: ['Black', 'Grey'] },
  { name: 'Air Jordan 1', price: 100, category: 'men', subcategory: 'basketball', image: '/images/shoes/Jordans.webp', description: 'Classic basketball shoes', stock: 25, featured: false, brand: 'Nike', size: ['9', '10', '11'], colour: ['Red', 'Black'] },
  { name: 'Running Shoes', price: 150, category: 'men', subcategory: 'running', image: '/images/shoes/running.webp', description: 'Professional running shoes', stock: 22, featured: false, brand: 'Nike', size: ['8', '9', '10'], colour: ['Blue', 'Black'] },
  { name: 'Skate Shoes', price: 95, category: 'men', subcategory: 'skate', image: '/images/shoes/skate.webp', description: 'Durable skate shoes', stock: 28, featured: false, brand: 'Vans', size: ['9', '10', '11'], colour: ['Black', 'White'] },
  { name: 'Classic Sneakers', price: 110, category: 'men', subcategory: 'casual', image: '/images/shoes/Sneakers.jpg', description: 'Classic sneakers', stock: 33, featured: false, brand: 'Adidas', size: ['8', '9', '10', '11'], colour: ['White', 'Black'] },
  { name: 'Men\'s T-Shirt', slug: 'mens-tee', price: 29.99, category: 'men', image: '/images/tops.png', description: '100% cotton everyday tee', brand: 'Nike', size: ['S', 'M', 'L', 'XL'], colour: ['Black', 'White', 'Grey'], stock: 100 },
  { name: 'Men\'s Joggers', slug: 'mens-joggers', price: 49.99, category: 'men', image: '/images/bottoms.png', description: 'Comfortable joggers', brand: 'Adidas', size: ['S', 'M', 'L', 'XL'], colour: ['Black', 'Grey'], stock: 80 },

  // WOMEN'S PRODUCTS
  { name: 'Vans Classic', price: 90, category: 'women', subcategory: 'casual', image: '/images/shoes/vans.webp', description: 'Casual lifestyle shoes', stock: 40, featured: false, brand: 'Vans', size: ['6', '7', '8', '9'], colour: ['Black', 'White'] },
  { name: 'Nike Vomero', price: 160, category: 'women', subcategory: 'running', image: '/images/shoes/Vomero.webp', description: 'Women\'s running shoes', stock: 35, featured: true, brand: 'Nike', size: ['6', '7', '8'], colour: ['White', 'Blue'] },
  { name: 'Pegasus Air', price: 210, category: 'women', subcategory: 'running', image: '/images/shoes/Pegasus.jpg', description: 'High-performance running', stock: 20, featured: false, brand: 'Nike', size: ['6', '7', '8', '9'], colour: ['White', 'Red'] },
  { name: 'Women\'s Sneakers', price: 140, category: 'women', subcategory: 'casual', image: '/images/shoes/womens.png', description: 'Stylish women\'s shoes', stock: 26, featured: false, brand: 'Puma', size: ['6', '7', '8'], colour: ['White', 'Black'] },
  { name: 'Women\'s Hoodie', slug: 'womens-hoodie', price: 59.99, category: 'women', image: '/images/tops.png', description: 'Moisture-wicking hoodie', brand: 'Adidas', size: ['S', 'M', 'L'], colour: ['Black', 'Grey', 'White'], stock: 60 },
  { name: 'Women\'s Leggings', slug: 'womens-leggings', price: 39.99, category: 'women', image: '/images/bottoms.png', description: 'Stretchy leggings', brand: 'Nike', size: ['S', 'M', 'L'], colour: ['Black', 'Grey'], stock: 90 },

  // KIDS' PRODUCTS
  { name: 'Adidas Kids Ultraboost', price: 80, category: 'kids', subcategory: 'running', image: '/images/shoes/ultraboostkids.avif', description: 'Kids running shoes', stock: 15, featured: true, brand: 'Adidas', size: ['4', '5', '6'], colour: ['Blue', 'Black'] },
  { name: 'Nike Kids Vomero', price: 80, category: 'kids', subcategory: 'running', image: '/images/shoes/vomerokids.webp', description: 'Kids running shoes', stock: 12, featured: false, brand: 'Nike', size: ['4', '5', '6'], colour: ['White', 'Red'] },
  { name: 'Kids Air Jordan', price: 80, category: 'kids', subcategory: 'basketball', image: '/images/shoes/jordanskids.webp', description: 'Kids basketball shoes', stock: 18, featured: true, brand: 'Nike', size: ['4', '5', '6', '7'], colour: ['Red', 'Black'] },
  { name: 'Kids Casual Shoes', price: 70, category: 'kids', subcategory: 'casual', image: '/images/shoes/kids.avif', description: 'Comfortable kids shoes', stock: 31, featured: false, brand: 'Puma', size: ['3', '4', '5'], colour: ['Blue', 'Green'] },
  { name: 'Kids T-Shirt', slug: 'kids-tee', price: 19.99, category: 'kids', image: '/images/tops.png', description: 'Cotton kids tee', brand: 'Nike', size: ['S', 'M', 'L'], colour: ['Red', 'Blue', 'Green'], stock: 80 },

  // ACCESSORIES
  { name: 'Canvas Cap', slug: 'canvas-cap', price: 19.99, category: 'accessories', image: '/images/accessories.png', description: 'Adjustable strapback cap', brand: 'Nike', size: ['One Size'], colour: ['Black', 'White', 'Red'], stock: 100 },
  { name: 'Utility Backpack', slug: 'utility-backpack', price: 69.99, category: 'accessories', image: '/images/accessories.png', description: '15L daily carry backpack', brand: 'Adidas', size: ['One Size'], colour: ['Black', 'Grey'], stock: 50 },
  { name: 'Sports Watch', slug: 'sports-watch', price: 99.99, category: 'accessories', image: '/images/accessories.png', description: 'Digital sports watch', brand: 'Nike', size: ['One Size'], colour: ['Black', 'White'], stock: 40 }
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