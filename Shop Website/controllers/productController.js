const productService = require('../services/productService');

class ProductController {
  // Get all products
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const products = await productService.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Search products
  async searchProducts(req, res) {
    try {
      const { q } = req.query;
      const products = await productService.searchProducts(q);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const products = await productService.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get products with filters
  async getProductsWithFilters(req, res) {
    try {
      const filters = req.query;
      const products = await productService.getProductsWithFilters(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get single product
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProductController();
