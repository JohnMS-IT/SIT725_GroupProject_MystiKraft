// controllers/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products?category=&q=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const {
      category,
      q = '',
      price = 'all',
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };

    // Price filtering
    if (price === '0-50') {
      filter.price = { $gte: 0, $lte: 50 };
    } else if (price === '50-100') {
      filter.price = { $gte: 50, $lte: 100 };
    } else if (price === '100+') {
      filter.price = { $gte: 100 };
    }

    // Sorting by date
    const sortOption = sort === 'oldest'
      ? { createdAt: 1 }
      : { createdAt: -1 }; // default to newest

    // Pagination
    const pageNum = Math.max(1, Number(page));
    // Limit between 1 and 100
    const perPage = Math.max(1, Math.min(100, Number(limit)));
    // Calculate how many documents to skip
    const skip = (pageNum - 1) * perPage;

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(perPage),
      Product.countDocuments(filter)
    ]);

    // Return paginated results
    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / perPage)
    });
    // Log the fetched products for debugging
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});
module.exports = router;