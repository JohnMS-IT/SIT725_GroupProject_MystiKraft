const Product = require('../models/Product');
const path = require('path');

// Controller for product-related operations
exports.getProducts = async (req, res) => {
  try {
    const { category, price, sort, page = 1 } = req.query;
    const limit = 6;
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (price && price !== 'all') {
      if (price === '0-50') filter.price = { $gte: 0, $lte: 50 };
      else if (price === '50-100') filter.price = { $gte: 50, $lte: 100 };
      else if (price === '100+') filter.price = { $gte: 100 };
    }// Sorting
    const sortOptions = sort === 'newest' ? { createdAt: -1 } : sort === 'oldest' ? { createdAt: 1 } : {};
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(products.map(product => product.toJSON()));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Get products for the logged-in seller
exports.getMyProducts = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const products = await Product.find({ sellerId: req.user.userId });
    res.status(200).json(products.map(product => product.toJSON()));
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, slug, price, category, description } = req.body;
    const image = req.file;
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (!name || !slug || !price || !category || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, description } });
    }
    const priceValue = parseFloat(price);
    if (priceValue < 1) {
      return res.status(400).json({ message: 'Price must be 1 or higher', price });
    }
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product slug already exists', slug });
    }
    const imagePath = image ? `/images/${category}/${image.filename}` : '/images/placeholder.jpg';
    const product = new Product({
      name,
      slug,
      price: priceValue,
      category,
      image: imagePath,
      description,
      sellerId: req.user.userId
    });
    await product.save();
    res.status(201).json({ product: product.toJSON(), message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own products' });
    }
    const { name, slug, price, category, description } = req.body;
    if (!name || !slug || !price || !category || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, description } });
    }
    const priceValue = parseFloat(price);
    if (priceValue < 1) {
      return res.status(400).json({ message: 'Price must be 1 or higher' });
    }
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }
    if (slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product slug already exists', slug });
      }
    }
    product.name = name;
    product.slug = slug;
    product.price = priceValue;
    product.category = category;
    product.description = description;
    product.image = req.file ? `/images/${category}/${req.file.filename}` : product.image;
    await product.save();
    res.status(200).json({ product: product.toJSON(), message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
    }
    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};