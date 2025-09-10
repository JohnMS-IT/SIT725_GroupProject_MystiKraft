const mongoose = require('mongoose');
const Product = require('../models/Product');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

const products = [
  { name: 'Nike Air Max', price: 120, category: 'shoes/Running', image: 'NikeAir.jpg' },
  { name: 'Ultraboost', price: 220, category: 'shoes/Running', image: 'ultraboost.jpg' },
  { name: 'Jordans', price: 100, category: 'shoes/Basketball', image: 'Jordans.webp' },
  { name: 'Vans', price: 90, category: 'shoes/Casual', image: 'vans.webp' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded...');
    mongoose.connection.close();
  } catch (err) {
    console.error(err.message);
    mongoose.connection.close();
  }
};

seedDB();
