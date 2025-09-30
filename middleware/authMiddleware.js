const jwt = require('jsonwebtoken');

// Middleware to authenticate and authorize users based on JWT
module.exports = async (req, res, next) => {
  console.log('authMiddleware: Processing request');
  // Extract token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('authMiddleware: Token:', token);// Log the token for debugging
  if (!token) {
    console.log('authMiddleware: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  try {// Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('authMiddleware: Decoded token:', decoded);
    req.user = decoded;
    next();// Proceed to next middleware or route handler
  } catch (error) {// Log error and respond with 401
    console.error('authMiddleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};