const mongoose = require('mongoose');
require('dotenv').config();

//establish connection to DB
const connectDB = async () => {
  try {
    //fetches db connection URI from .env
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;