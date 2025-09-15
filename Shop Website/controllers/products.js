// controllers/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products?category=&q=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { category, q = '', page = 1, limit = 12 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * perPage;

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      Product.countDocuments(filter)
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / perPage)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const item = await Product.findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});

module.exports = router;
