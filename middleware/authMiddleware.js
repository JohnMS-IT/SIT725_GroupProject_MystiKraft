const jwt = require('jsonwebtoken');

// Middleware to authenticate and authorize users based on JWT
module.exports = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.debug('authMiddleware: Invalid or missing Authorization header');
    return res.status(401).json({ message: 'Invalid or missing Authorization header' });
  }
  // Remove 'Bearer ' prefix to get the token
  const token = authHeader.replace('Bearer ', '');
  console.debug('authMiddleware: Token:', token);

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.debug('authMiddleware: Decoded token:', decoded);

    // Validate decoded token structure
    if (!decoded.userId || !decoded.role) {
      console.debug('authMiddleware: Invalid token payload');
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    // Set req.user to match productController.js expectations
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (error) {
    console.error('authMiddleware error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Authentication failed', details: error.message });
  }
};