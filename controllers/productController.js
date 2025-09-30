const Product = require('../models/Product');
const path = require('path');

console.log('Loading /controllers/productController.js');
console.log('Product model loaded:', require.resolve('../models/Product'));

// Get all products (for shop page)
exports.getProducts = async (req, res) => {
  try {
    console.log('GET /api/products hit');
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
    }

    const sortOptions = {};
    if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'oldest') sortOptions.createdAt = 1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
    console.log('Products found:', products);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

// Get seller's products
exports.getMyProducts = async (req, res) => {
  try {
    console.log('GET /api/products/my-products hit');
    console.log('User:', req.user);
    if (!req.user || req.user.role !== 'seller') {
      console.log('Unauthorized: User is not a seller', req.user);
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const products = await Product.find({ sellerId: req.user.userId });
    console.log('Seller products found:', products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    console.log('POST /api/products hit');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user);

    const { name, slug, price, category, description } = req.body;
    const image = req.file;

    if (!req.user || req.user.role !== 'seller') {
      console.log('Unauthorized: User is not a seller', req.user);
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!name || !slug || !price || !category || !image || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, image, description } });
    }

    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product slug already exists', slug });
    }

    const imagePath = `/images/${category}/${image.filename}`;
    console.log('Image path:', imagePath);

    const product = new Product({
      name,
      slug,
      price: parseFloat(price),
      category,
      image: imagePath,
      description,
      sellerId: req.user.userId
    });
    await product.save();
    res.status(201).json({ product, message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    console.log('PUT /api/products/:id hit', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user);

    if (!req.user || req.user.role !== 'seller') {// Check if user is a seller
      console.log('Unauthorized: User is not a seller', req.user);
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Verify product ownership
    const product = await Product.findById(req.params.id);
    if (!product) {// Check if product exists
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user.userId) {// Verify ownership
      console.log('Unauthorized: User does not own product', req.user.userId, product.sellerId);
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own products' });
    }
    // Validate and update fields
    const { name, slug, price, category, description } = req.body;
    const image = req.file;

    if (!name || !slug || !price || !category || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, description } });
    }
    // Validate category
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }

    if (slug !== product.slug) {// Check if slug is changing
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product slug already exists', slug });
      }
    }

    product.name = name;
    product.slug = slug;
    product.price = parseFloat(price);
    product.category = category;
    product.description = description;
    if (image) {
      product.image = `/images/${category}/${image.filename}`;
    }

    await product.save();
    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    console.log('DELETE /api/products/:id hit', req.params.id);
    console.log('User:', req.user);

    if (!req.user || req.user.role !== 'seller') {
      console.log('Unauthorized: User is not a seller', req.user);
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user.userId) {
      console.log('Unauthorized: User does not own product', req.user.userId, product.sellerId);
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};