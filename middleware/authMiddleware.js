const jwt = require('jsonwebtoken');

//console.log('Loading /middleware/authMiddleware.js');

module.exports = async (req, res, next) => {
  console.log('authMiddleware: Processing request');
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('authMiddleware: Token:', token);
  if (!token) {
    console.log('authMiddleware: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('authMiddleware: Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('authMiddleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};