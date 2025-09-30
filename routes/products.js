// routes/products.js - Product routes with image upload handling using multer
// and category-based storage directories.
// Categories: shoes, tops, bottoms, accessories
// Images stored in: public/images/<category>/
// Requires: express, multer, path, productController, authMiddleware
// Example: POST /api/products with form-data including 'image' file and 'category' field.
// Note: Ensures directories exist or handle directory creation in production code.
// -------------------------------------------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
// Set up multer storage with category-based directories
const storage = multer.diskStorage({// Ensure directories exist in production code
  destination: (req, file, cb) => {
    // Validate category and set directory
    const category = req.body.category;
    const validCategories = ['shoes', 'tops', 'bottoms', 'accessories'];// Add more categories as needed
    if (!validCategories.includes(category)) {// Basic validation
      return cb(new Error('Invalid category'));
    }// In production, ensure the directory exists or create it
    cb(null, `public/images/${category}`);
  },// Filename: slug + timestamp + original extension
  filename: (req, file, cb) => {// Ensure req.body.slug is provided
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);// To avoid collisions
    const ext = path.extname(file.originalname);// Get original file extension
    cb(null, `${req.body.slug}-${uniqueSuffix}${ext}`);// e.g., cool-shoe-1632345678901-123456789.jpg
  }
});// File filter to accept only images
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {// Reject non-image files
      cb(new Error('Only images are allowed'), false);
    }
  }
});
// Routes
router.get('/', productController.getProducts);
router.get('/my-products', authMiddleware, productController.getMyProducts);
router.post('/', authMiddleware, upload.single('image'), productController.addProduct);
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
// Export the router
module.exports = router;