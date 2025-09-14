const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});

const contactRoutes = require('../controllers/contact');
const searchRoutes = require('../controllers/search');
const productRoutes = require('../routes/products');
const cartRoutes = require('../routes/cart');
const orderRoutes = require('../routes/orders');

console.log('contactRoutes:', contactRoutes);
console.log('searchRoutes:', searchRoutes);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use('/contact', contactRoutes);     
app.use('/api/search', searchRoutes);   
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});
