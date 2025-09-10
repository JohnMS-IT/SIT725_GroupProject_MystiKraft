// routes/search.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Search route
router.get('/', async (req, res) => {
  const query = req.query.q || '';
  try {
    const products = await Product.find({ name: { $regex: query, $options: 'i' } });
    res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query error' });
  }
});

module.exports = router;
