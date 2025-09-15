const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session'); // New：session management
const MongoStore = require('connect-mongo'); // New：MongoDB session storage
const passport = require('passport'); // New：authentication middleware

const app = express();

// ==================== New ====================
// Load Environment Variables
require('dotenv').config();

// Session Configuration - Using MongoDB for Session Storage
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft'
  }),
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true // Enhance Security
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
require('../config/passport'); 
// ==================== /New ====================

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});

// 路由引入
const contactRoutes = require('../controllers/contact');
const searchRoutes = require('../controllers/search');
// ==================== New ====================
const authRoutes = require('../routes/auth'); // New: Authentication Routing
// ==================== /New ====================


console.log('contactRoutes:', contactRoutes);
console.log('searchRoutes:', searchRoutes);

// 中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// 路由注册
app.use('/contact', contactRoutes);     
app.use('/api/search', searchRoutes);   
// ==================== New ====================
app.use('/api/auth', authRoutes);
app.get('/verify/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});
// ==================== /New ====================

const port = 3000;

app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});
