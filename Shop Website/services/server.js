// server.js
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = require('./app');

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// MongoDB Connection - Optional for Docker
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft';

// Try to connect to MongoDB, but don't fail if it's not available
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.log('MongoDB not available, continuing without database:', err.message);
  console.log('This is normal when running in Docker without MongoDB');
});

// Start the server regardless of MongoDB connection status
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Web server running at: http://0.0.0.0:${port}`);
  console.log(`Local access: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});