// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

// NEW: http + socket.io
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Load Environment Variables
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Session configuration (must come before passport.session)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: true, // Changed to true to support guest cart functionality
  store: MongoStore.create({ mongoUrl: mongoURI }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

// Initialize passport
require('../config/passport'); // configure strategies
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/contact', require('../controllers/contact'));
app.use('/api/search', require('../controllers/search'));
app.use('/api/auth', require('../routes/auth'));
app.use('/api/products', require('../controllers/products')); // 
app.use('/api/cart', require('../controllers/cartController'));
app.use('/api/user', require('../routes/user'));
app.use('/api/orders', require('../routes/orders'));
app.use('/api/admin/users', require('../routes/admin-users'));

// Serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

//  NEW: create HTTP server and attach Socket.IO
const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server);

// Make io available inside routes via req.app.locals.io
app.locals.io = io;

// Basic connection logging
io.on('connection', socket => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// use server.listen (replace app.listen)
server.listen(port, () => {
  console.log(`MystiKraft server running at http://localhost:${port}`);
});

module.exports = app; 
