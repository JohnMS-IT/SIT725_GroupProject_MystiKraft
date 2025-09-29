require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const productRoutes = require('../routes/products');
const authRoutes = require('../routes/auth');
const contactController = require('../controllers/contact');
const searchRoutes = require('../controllers/search');

const app = express();

// Debugging environment variables
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/contact', contactController);
app.use('/api/search', searchRoutes);
app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected...');
    // Start Server
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Web server running at: http://localhost:${port}`);
      console.log('Type Ctrl+C to shut down the web server');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });