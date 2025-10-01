const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft';

const coupons = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 20,
    usageLimit: 100
  },
  {
    code: 'SAVE20',
    description: '20% off orders over $100',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 100,
    maxDiscountAmount: 50,
    usageLimit: 50
  },
  {
    code: 'FLAT15',
    description: '$15 off any order',
    discountType: 'fixed',
    discountValue: 15,
    minOrderAmount: 75,
    usageLimit: 200
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping (equivalent to $10 off)',
    discountType: 'fixed',
    discountValue: 10,
    minOrderAmount: 30,
    usageLimit: null // Unlimited
  }
];

(async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');
    
    await Coupon.deleteMany({});
    console.log('Cleared existing coupons...');
    
    await Coupon.insertMany(coupons);
    console.log(`Seeded ${coupons.length} coupons successfully!`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding coupons:', err);
    mongoose.connection.close();
  }
})();

