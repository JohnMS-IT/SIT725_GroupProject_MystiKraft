// controllers/products.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Utility: make slugs from names
function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}

// GET /api/products (with category, q, price, sort, pagination)
router.get('/', async (req, res) => {
  try {
    // If DB not connected, return sample data (Docker fallback)
    if (mongoose.connection.readyState !== 1) {
      const sampleProducts = [
        { name: 'Nike Air Max', price: 120, category: 'mens', image: '/images/shoes/NikeAir.jpg', description: 'Comfortable running shoes' },
        { name: 'Ultraboost', price: 220, category: 'mens', image: '/images/shoes/ultraboost.jpg', description: 'Premium running shoes' },
        { name: 'Jordans', price: 100, category: 'mens', image: '/images/shoes/Jordans.webp', description: 'Classic basketball shoes' }
      ];
      return res.json({ items: sampleProducts, total: sampleProducts.length, page: 1, pages: 1 });
    }

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

    if (price === '0-50') filter.price = { $gte: 0, $lte: 50 };
    else if (price === '50-100') filter.price = { $gte: 50, $lte: 100 };
    else if (price === '100+') filter.price = { $gte: 100 };

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * perPage;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(perPage),
      Product.countDocuments(filter)
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / perPage) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});

// POST /api/products  (Admin: create product)
router.post('/', async (req, res) => {
  try {
    const { name, price, category, image, description = '' } = req.body;
    if (!name || !price || !category || !image) {
      return res.status(400).json({ error: 'name, price, category, and image are required' });
    }

    const doc = new Product({
      name,
      price: Number(price),
      category,
      image,
      description,
      stock: Number(stock), 
      slug: slugify(name)
    });

    const saved = await doc.save();

    // Broadcast new product to all sockets
    req.app.locals.io.emit('product-added', saved);

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create product' });
  }
});

// DELETE /api/products/:id  (Admin: delete)
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Product not found' });

    // 🔌 Broadcast removal
    req.app.locals.io.emit('product-removed', { id: removed._id.toString(), slug: removed.slug });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete product' });
  }
});

module.exports = router;
