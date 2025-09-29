const Product = require('../models/Product');
const path = require('path');

// Controller to get products by category for filtering purposes
exports.getProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

// Controller to add a new product (protected route for 'seller' users)
exports.addProduct = async (req, res) => {
  try {
    console.log('POST /api/products hit');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user);

    const { name, slug, price, category, description } = req.body;
    const image = req.file;

    // Check if user is authenticated and a seller
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Validate input data
    if (!name || !slug || !price || !category || !image || !description) {
      return res.status(400).json({ message: 'All fields are required', missing: { name, slug, price, category, image, description } });
    }

    // Validate category
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category', category });
    }

    // Check for existing product with the same slug
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product slug already exists', slug });
    }

    // Store relative image path
    const imagePath = `/images/${category}/${image.filename}`;
    console.log('Image path:', imagePath);

    // Create and save the new product
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

    // Return the created product
    res.status(201).json({ product, message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};