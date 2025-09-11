const Product = require('../models/Product');

class ProductService {
  // Get all products
  async getAllProducts() {
    return await Product.find({});
  }

  // Get products by category
  async getProductsByCategory(category) {
    return await Product.find({ category: category });
  }

  // Search products
  async searchProducts(query) {
    return await Product.find({ 
      name: { $regex: query, $options: 'i' } 
    });
  }

  // Get featured products
  async getFeaturedProducts() {
    return await Product.find({ featured: true });
  }

  // Get products by price range
  async getProductsByPriceRange(minPrice, maxPrice) {
    return await Product.find({
      price: { $gte: minPrice, $lte: maxPrice }
    });
  }

  // Get single product
  async getProductById(id) {
    return await Product.findById(id);
  }

  // Get products with combined filters
  async getProductsWithFilters(filters) {
    let query = {};
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }
    
    return await Product.find(query);
  }
}

module.exports = new ProductService();
