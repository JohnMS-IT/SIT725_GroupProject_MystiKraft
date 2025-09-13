const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const authUtils = require('../utils/auth');

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { email: string, password: string }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Create new user
    const user = new User({ email });
    await User.register(user, password);
    
    // Send verification email
    await authUtils.sendVerificationEmail(user, req);
    
    res.json({ 
      success: true, 
      message: 'Registration successful. Please check your email for verification.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user
 * Body: { email: string, password: string }
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: info.message 
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Login failed' 
        });
      }
      return res.json({ 
        success: true, 
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email
        }
      });
    });
  })(req, res, next);
});

/**
 * GET /api/auth/verify/:token
 * Verify user's email with provided token
 */
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is invalid or has expired' 
      });
    }
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email verification failed' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Log out the current user
 */
router.post('/logout', (req, res) => {
  req.logout();
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

/**
 * GET /api/auth/user
 * Get current user information
 */
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }
  
  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      emailVerified: req.user.emailVerified
    }
  });
});

module.exports = router;