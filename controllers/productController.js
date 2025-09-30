const Product = require('../models/Product');
const path = require('path');

// Get products with optional filtering, sorting, and pagination
exports.getProducts = async (req, res) => {
  try {
    const { category, price, sort, page = 1 } = req.query;// Default to page 1 if not provided
    const limit = 6;// Number of products per page
    const filter = {};
    // Apply filters based on query parameters
    if (category && category !== 'all') {
      filter.category = category;
    }// Filter by price range
    if (price && price !== 'all') {// Example price ranges: '0-50', '50-100', '100+'
      if (price === '0-50') filter.price = { $gte: 0, $lte: 50 };
      else if (price === '50-100') filter.price = { $gte: 50, $lte: 100 };
      else if (price === '100+') filter.price = { $gte: 100 };
    }
    // Apply sorting
    const sortOptions = {};
    if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'oldest') sortOptions.createdAt = 1;
    // Default sorting by newest
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};
// Get products for the authenticated seller
exports.getMyProducts = async (req, res) => {
  try {// Ensure the user is authenticated and is a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }// Fetch products belonging to the authenticated seller
    const products = await Product.find({ sellerId: req.user.userId });
    res.json(products);// Return the seller's products
  } catch (error) {
    console.error('Error fetching seller products:', error);// Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Add a new product
exports.addProduct = async (req, res) => {
  try {// Extract product details from the request body
    const { name, slug, price, category, description } = req.body;
    const image = req.file;
    // Ensure the user is authenticated and is a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Validate required fields
    if (!name || !slug || !price || !category || !image || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, image, description } });
    }
    // Validate category
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });// Check for unique slug
    }
    //  Check if the slug is unique
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {// If a product with the same slug exists, return an error
      return res.status(400).json({ message: 'Product slug already exists', slug });
    }
    // Create and save the new product
    // Construct the image path to be stored in the database
    const imagePath = `/images/${category}/${image.filename}`;
    const product = new Product({
      name,
      slug,
      price: parseFloat(price),
      category,
      image: imagePath,
      description,
      sellerId: req.user.userId
    });// Save the product to the database
    await product.save();
    res.status(201).json({ product, message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Update an existing product
exports.updateProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    //Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Ensure the authenticated seller owns the product
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own products' });
    }
    // Extract updated product details from the request body
    const { name, slug, price, category, description } = req.body;
    const image = req.file;
    // Validate required fields
    if (!name || !slug || !price || !category || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, description } });
    }
    // Validate category
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }
    // Check for unique slug if it has been changed
    if (slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {// If a product with the same slug exists, return an error
        return res.status(400).json({ message: 'Product slug already exists', slug });
      }
    }
    // Update product fields
    product.name = name;
    product.slug = slug;
    product.price = parseFloat(price);
    product.category = category;
    product.description = description;
    if (image) {// Update image path if a new image is uploaded
      product.image = `/images/${category}/${image.filename}`;
    }
    // Save the updated product to the database
    await product.save();
    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {// Log and handle errors
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Delete a product
exports.deleteProduct = async (req, res) => {
  try {// Ensure the user is authenticated and is a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {// If the product does not exist, return a 404 error
      return res.status(404).json({ message: 'Product not found' });
    }
    // Ensure the authenticated seller owns the product
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
    }
    // Delete the product from the database
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {// Log and handle errors
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};