const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/featured - Get featured products
router.get('/featured', productController.getFeaturedProducts);

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', productController.getProductsByCategory);

// GET /api/products/search - Search products
router.get('/search', productController.searchProducts);

// GET /api/products/filter - Get products with multiple filters
router.get('/filter', productController.getProductsWithFilters);

// GET /api/products/:id - Get single product
router.get('/:id', productController.getProductById);

module.exports = router;
