// services/server.js
// Entry point for the web server
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
// Load environment variables from .env file
dotenv.config();
// Initialize Express app
const app = express();
// Middleware
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, '../public')));// Serve static files
app.use('/api/auth', require('../routes/auth'));// Auth routes
app.use('/api/products', require('../routes/products'));// Product routes

// Contact route
const PORT = process.env.PORT;;
const MONGO_URI = process.env.MONGO_URI;// MongoDB connection string
// Connect to MongoDB and start the server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected...');
    app.listen(PORT, () => {
      console.log(`Web server running at: http://localhost:${PORT}`);
      console.log('Type Ctrl+C to shut down the web server');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });