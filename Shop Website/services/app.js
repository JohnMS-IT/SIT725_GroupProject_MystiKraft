const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const contactController = require('../controllers/contact'); //
const searchRoutes = require('../controllers/search');
const productsRoutes = require('../controllers/products');
const contactRoutes = require('../controllers/contact');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/contact', contactController); // Use controller directly for simple route
app.use('/api/search', searchRoutes);
app.use('/api/products', productsRoutes);// New products route
app.use('/api/contact', contactRoutes);

module.exports = app;



