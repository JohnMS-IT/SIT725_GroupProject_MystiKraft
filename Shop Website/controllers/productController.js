const Product = require('../models/Product');

// Controller to get products by category by filtering purpose
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.query.category;// Get category from query string
    const filter = category ? { category } : {};// Build filter object
    const products = await Product.find(filter);// Fetch products from database
    res.json(products);// Return products as JSON 
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });// Handle errors
  }
};
