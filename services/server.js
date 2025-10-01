// services/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files
app.use('/api/auth', require('../routes/auth')); // Authentication routes
app.use('/api/products', require('../routes/products')); // Product routes

// MongoDB connection (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Web server running at: http://localhost:${PORT}`);
    console.log('Type Ctrl+C to shut down the web server');
  });
}

module.exports = app; // Export app for testing with supertest