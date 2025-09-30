const express = require('express');
const path = require('path');
const productRoutes = require('../routes/products');
const authRoutes = require('../routes/auth');
const contactController = require('../controllers/contact');
const searchController = require('../controllers/search');

console.log('Loading /services/app.js');
console.log('Product routes loaded:', require.resolve('../routes/products'));
console.log('Auth routes loaded:', require.resolve('../routes/auth'));

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Debug routes
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/products', productRoutes); // Mount explicitly to avoid conflicts
app.use('/api/auth', authRoutes);
app.get('/contact', contactController);
app.get('/api/search', searchController);

// Handle 404
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;