const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const contactController = require('../controllers/contact');
const searchRoutes = require('../controllers/search');
const productsRoutes = require('../controllers/products');
const contactRoutes = require('../controllers/contact');
const cartRoutes = require('../routes/cart');
const orderRoutes = require('../routes/orders');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/contact', contactController); // Use controller directly for simple route
app.use('/api/search', searchRoutes);
app.use('/api/products', productsRoutes);// New products route
app.use('/api/contact', contactRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Student identity endpoint for Docker assignment
app.get('/api/student', (req, res) => {
    res.json({
        "name": "KRISHNA CHAUDHARI",
        "studentId": "S223751702"
    });
});

module.exports = app;



