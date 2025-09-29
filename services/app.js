const express = require('express');
const path = require('path');
const productRoutes = require('../routes/products');
const authRoutes = require('../routes/auth');
const contactController = require('../controllers/contact');
const searchRoutes = require('../controllers/search');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

//Debug routes

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.get('/contact', contactController);
app.use('/api/search', searchRoutes);

module.exports = app;