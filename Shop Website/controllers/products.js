// controllers/products.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { requireAdmin } = require('../utils/adminAuth');

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
      brand,
      size,
      colour,
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };

    // Price filtering
    if (price === '0-50') filter.price = { $gte: 0, $lte: 50 };
    else if (price === '50-100') filter.price = { $gte: 50, $lte: 100 };
    else if (price === '100+') filter.price = { $gte: 100 };

    // Brand filtering
    if (brand && brand !== 'all') filter.brand = brand;

    // Size filtering (check if size array contains the value)
    if (size && size !== 'all') filter.size = size;

    // Colour filtering (check if colour array contains the value)
    if (colour && colour !== 'all') filter.colour = colour;

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
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, price, category, image, description = '', brand, stock, size, colour, featured } = req.body;
    if (!name || !price || !category || !image) {
      return res.status(400).json({ error: 'name, price, category, and image are required' });
    }

    const doc = new Product({
      name,
      price: Number(price),
      category,
      image,
      description,
      slug: slugify(name),
      brand: brand || undefined,
      stock: stock ? Number(stock) : 0,
      size: size || [],
      colour: colour || [],
      featured: featured || false
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

// PUT /api/products/:id  (Admin: update product)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, price, category, image, description, stock, featured, brand, size, colour } = req.body;
    
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (featured !== undefined) updateData.featured = featured;
    if (brand !== undefined) updateData.brand = brand;
    if (size !== undefined) updateData.size = size;
    if (colour !== undefined) updateData.colour = colour;
    updateData.updatedAt = Date.now();

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Product not found' });

    // Broadcast update to all sockets
    req.app.locals.io.emit('product-updated', updated);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update product' });
  }
});

// PUT /api/products/:id/stock (Admin: update stock only)
router.put('/:id/stock', requireAdmin, async (req, res) => {
  try {
    console.log('=== ADMIN STOCK UPDATE ===');
    console.log('Product ID:', req.params.id);
    console.log('New stock value:', req.body.stock);
    
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newStock = Number(stock);
    product.stock = newStock;
    await product.save();

    console.log(`Admin updated stock: ${product.name} = ${newStock}`);

    // Check stock level and send appropriate notifications with delay
    if (newStock > 7) {
      setTimeout(() => {
        req.app.locals.io.emit('stock-alert', {
          type: 'restocked',
          productName: product.name,
          stock: newStock,
          productId: product._id,
          message: `We just restocked ${product.name}, now have sufficient inventory!`
        });
      }, 500);
    } else if (newStock < 3) {
      setTimeout(() => {
        req.app.locals.io.emit('stock-alert', {
          type: 'low-stock',
          productName: product.name,
          stock: newStock,
          productId: product._id,
          message: `${product.name} is running low, only ${newStock} items left!`
        });
      }, 500);
    }

    // Broadcast stock update to all sockets
    req.app.locals.io.emit('stock-updated', { 
      id: product._id, 
      stock: newStock, 
      name: product.name 
    });

    res.json({ ok: true, stock: newStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// DELETE /api/products/:id  (Admin: delete)
router.delete('/:id', requireAdmin, async (req, res) => {
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
