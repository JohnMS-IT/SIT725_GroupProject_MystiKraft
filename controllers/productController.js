const Product = require('../models/Product');
const path = require('path');
// Controller for product-related operations
exports.getProducts = async (req, res) => {
  try {// Extract query parameters for filtering, sorting, and pagination
    const { category, price, sort, page = 1 } = req.query;
    const limit = 6;
    const filter = {};
    // Apply category filter if provided
    if (category && category !== 'all') {
      filter.category = category;
    }// Apply price range filter if provided
    if (price && price !== 'all') {// Example price ranges: "0-50", "50-100", "100+"
      if (price === '0-50') filter.price = { $gte: 0, $lte: 50 };
      else if (price === '50-100') filter.price = { $gte: 50, $lte: 100 };
      else if (price === '100+') filter.price = { $gte: 100 };
    }
    // Apply sorting if provided
    const sortOptions = {};
    if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'oldest') sortOptions.createdAt = 1;
    // Default sort by name
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(products);
  } catch (err) {// Log error and send response
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};
// Get product details by slug
exports.getMyProducts = async (req, res) => {
  try {// Ensure user is authenticated and is a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }// Fetch products belonging to the authenticated seller
    const products = await Product.find({ sellerId: req.user.userId });
    res.json(products);
  } catch (error) {// Log error and send response
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get product details by slug
exports.addProduct = async (req, res) => {
  try {
    const { name, slug, price, category, description } = req.body;
    const image = req.file;
    // Ensure user is authenticated and is a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Validate required fields
    if (!name || !slug || !price || !category || !image || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, image, description } });
    }
    // Validate price
    const priceValue = parseFloat(price);
    if (priceValue < 1) {
      return res.status(400).json({ message: 'Price must be 1 or higher' });
    }
    // Validate category
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }
    // Check for unique slug
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product slug already exists', slug });
    }
    // Save product to database
    const imagePath = `/images/${category}/${image.filename}`;// Store relative path for serving
    const product = new Product({
      name,
      slug,
      price: priceValue,
      category,
      image: imagePath,
      description,
      sellerId: req.user.userId
    });
    await product.save();// Respond with created product
    res.status(201).json({ product, message: 'Product added successfully' });
  } catch (error) {// Log error and send response
    console.error('Error adding product:', error);// Log error and send response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Update product details
exports.updateProduct = async (req, res) => {
  try {// Ensure user is authenticated and is a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Find the product to update
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Ensure the product belongs to the authenticated seller
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own products' });
    }
    // Validate and update fields
    const { name, slug, price, category, description } = req.body;
    const image = req.file;
    // Validate required fields
    if (!name || !slug || !price || !category || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, description } });
    }
    // Validate price
    const priceValue = parseFloat(price);
    if (priceValue < 1) {
      return res.status(400).json({ message: 'Price must be 1 or higher' });
    }
    // Validate category
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }
    // Check for unique slug if changed
    if (slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product slug already exists', slug });
      }
    }
    // Update product fields
    product.name = name;
    product.slug = slug;
    product.price = priceValue;
    product.category = category;
    product.description = description;
    if (image) {
      product.image = `/images/${category}/${image.filename}`;
    }
    // Save updates
    await product.save();
    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Find the product to delete
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Ensure the product belongs to the authenticated seller
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
    }
    // Delete the product
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {// Log error and send response
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};