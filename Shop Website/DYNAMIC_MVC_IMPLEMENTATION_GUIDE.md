# Dynamic MVC Structure Implementation Guide
## MystiKraft Shop Website

### Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Code Changes Made](#code-changes-made)
5. [File Structure](#file-structure)
6. [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide documents the transformation of a static website into a fully dynamic MVC (Model-View-Controller) structure using Node.js, Express, MongoDB, and EJS.

### Technologies Used
- 🟢 **Node.js** - Backend runtime
- 🟡 **Vanilla JavaScript** - Frontend logic
- 🔵 **HTML & CSS, Bootstrap** - UI framework
- 🟣 **MongoDB** - Database
- ✅ **EJS** - Template engine
- ✅ **Express** - Web framework
- ✅ **Mongoose** - ODM for MongoDB

---

## Prerequisites

Before starting, ensure you have:
- Node.js installed
- MongoDB running locally
- Basic understanding of JavaScript and Express

---

## Step-by-Step Implementation

### Step 1: Install Required Dependencies

```bash
npm install ejs express-validator helmet morgan dotenv
```

**What this adds:**
- `ejs` - Template engine for dynamic views
- `express-validator` - Input validation
- `helmet` - Security middleware
- `morgan` - HTTP request logger
- `dotenv` - Environment variable management

### Step 2: Enhanced Product Model

**File:** `models/Product.js`

**Before:**
```javascript
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String,
});

module.exports = mongoose.model('Product', ProductSchema);
```

**After:**
```javascript
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: String,
  image: { type: String, required: true },
  description: String,
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
```

**Changes Made:**
- Added validation with `required: true`
- Added `subcategory` field for better categorization
- Added `description` for product details
- Added `stock` for inventory management
- Added `featured` flag for highlighting products
- Added `createdAt` and `updatedAt` timestamps

### Step 3: Create Service Layer

**File:** `services/productService.js` (NEW)

```javascript
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
```

**Purpose:** Separates business logic from HTTP handling (MVC pattern)

### Step 4: Create Controller Layer

**File:** `controllers/productController.js` (NEW)

```javascript
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
```

**Purpose:** Handles only HTTP requests/responses, delegates business logic to services

### Step 5: Create Route Layer

**File:** `routes/products.js` (NEW)

```javascript
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
```

**Purpose:** Defines API endpoints and maps them to controller methods

### Step 6: Enhanced Server Configuration

**File:** `services/server.js`

**Before:**
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});

const contactRoutes = require('../controllers/contact');
const searchRoutes = require('../controllers/search');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/contact', contactRoutes);     
app.use('/api/search', searchRoutes);   

const port = 3000;

app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});
```

**After:**
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mystikraft';

mongoose.connect(mongoURI).then(() => {
  console.log('MongoDB connected...');
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});

const contactRoutes = require('../controllers/contact');
const searchRoutes = require('../controllers/search');
const productRoutes = require('../routes/products');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use('/contact', contactRoutes);     
app.use('/api/search', searchRoutes);   
app.use('/api/products', productRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log('Type Ctrl+C to shut down the web server');
});
```

**Changes Made:**
- Added security middleware (`helmet`)
- Added logging middleware (`morgan`)
- Added environment variable support (`dotenv`)
- Added EJS view engine configuration
- Added product routes
- Removed deprecated MongoDB options
- Added environment-based port configuration

### Step 7: Enhanced Seed Data

**File:** `services/seed.js`

**Before:**
```javascript
const mongoose = require('mongoose');
const Product = require('../models/Product');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

const products = [
  { name: 'Nike Air Max', price: 120, category: 'shoes/Running', image: 'NikeAir.jpg' },
  { name: 'Ultraboost', price: 220, category: 'shoes/Running', image: 'ultraboost.jpg' },
  { name: 'Jordans', price: 100, category: 'shoes/Basketball', image: 'Jordans.webp' },
  { name: 'Vans', price: 90, category: 'shoes/Casual', image: 'vans.webp' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded...');
    mongoose.connection.close();
  } catch (err) {
    console.error(err.message);
    mongoose.connection.close();
  }
};

seedDB();
```

**After:**
```javascript
const mongoose = require('mongoose');
const Product = require('../models/Product');

const mongoURI = 'mongodb://localhost:27017/mystikraft';

const products = [
  { name: 'Nike Air Max', price: 120, category: 'mens', subcategory: 'running', image: 'NikeAir.jpg', description: 'Comfortable running shoes', stock: 50, featured: true },
  { name: 'Ultraboost', price: 220, category: 'mens', subcategory: 'running', image: 'ultraboost.jpg', description: 'Premium running shoes', stock: 30, featured: true },
  { name: 'Jordans', price: 100, category: 'mens', subcategory: 'basketball', image: 'Jordans.webp', description: 'Classic basketball shoes', stock: 25, featured: false },
  { name: 'Vans', price: 90, category: 'womens', subcategory: 'casual', image: 'vans.webp', description: 'Casual lifestyle shoes', stock: 40, featured: false },
  { name: 'Vomero', price: 160, category: 'womens', subcategory: 'running', image: 'Vomero.webp', description: 'Women\'s running shoes', stock: 35, featured: true },
  { name: 'Pegasus Air', price: 210, category: 'womens', subcategory: 'running', image: 'Pegasus.jpg', description: 'High-performance running', stock: 20, featured: false },
  { name: 'Ultraboost Kids', price: 80, category: 'kids', subcategory: 'running', image: 'ultraboostkids.avif', description: 'Kids running shoes', stock: 15, featured: true },
  { name: 'Vomero Kids', price: 80, category: 'kids', subcategory: 'running', image: 'vomerokids.webp', description: 'Kids running shoes', stock: 12, featured: false },
  { name: 'Jordans Kids', price: 80, category: 'kids', subcategory: 'basketball', image: 'jordanskids.webp', description: 'Kids basketball shoes', stock: 18, featured: true },
  { name: 'Running Shoes', price: 150, category: 'mens', subcategory: 'running', image: 'running.webp', description: 'Professional running shoes', stock: 22, featured: false },
  { name: 'Skate Shoes', price: 95, category: 'mens', subcategory: 'skate', image: 'skate.webp', description: 'Durable skate shoes', stock: 28, featured: false },
  { name: 'Sneakers', price: 110, category: 'mens', subcategory: 'casual', image: 'Sneakers.jpg', description: 'Classic sneakers', stock: 33, featured: false },
  { name: 'Basketball Shoes', price: 130, category: 'mens', subcategory: 'basketball', image: 'basketball.jpg', description: 'High-performance basketball', stock: 19, featured: false },
  { name: 'Women\'s Shoes', price: 140, category: 'womens', subcategory: 'casual', image: 'womens.png', description: 'Stylish women\'s shoes', stock: 26, featured: false },
  { name: 'Kids Shoes', price: 70, category: 'kids', subcategory: 'casual', image: 'kids.avif', description: 'Comfortable kids shoes', stock: 31, featured: false }
];

const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Data seeded successfully...');
    mongoose.connection.close();
  } catch (err) {
    console.error(err.message);
    mongoose.connection.close();
  }
};

seedDB();
```

**Changes Made:**
- Expanded from 4 to 15 products
- Changed category format from `shoes/Running` to `mens`
- Added all new fields: `subcategory`, `description`, `stock`, `featured`
- Removed deprecated MongoDB connection options
- Added more comprehensive product data

### Step 8: Dynamic Frontend JavaScript (Optional)

**File:** `public/js/productFilter.js` (NEW)

```javascript
class ProductFilter {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentCategory = 'all';
    this.currentPrice = 300;
  }

  // Load all products from API
  async loadAllProducts() {
    try {
      const response = await fetch('/api/products');
      this.products = await response.json();
      this.filteredProducts = [...this.products];
      this.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products. Please try again.');
    }
  }

  // Filter by category
  async filterByCategory(category) {
    this.currentCategory = category;
    try {
      const response = await fetch(`/api/products/category/${category}`);
      this.filteredProducts = await response.json();
      this.applyPriceFilter();
      this.renderProducts();
    } catch (error) {
      console.error('Error filtering by category:', error);
      this.showError('Failed to filter by category. Please try again.');
    }
  }

  // Filter by price
  filterByPrice(maxPrice) {
    this.currentPrice = maxPrice;
    document.getElementById('currentPrice').textContent = `$${maxPrice}`;
    this.applyPriceFilter();
    this.renderProducts();
  }

  // Apply price filter to current products
  applyPriceFilter() {
    if (this.currentPrice < 300) {
      this.filteredProducts = this.filteredProducts.filter(
        product => product.price <= this.currentPrice
      );
    }
  }

  // Clear all filters
  clearFilters() {
    this.currentCategory = 'all';
    this.currentPrice = 300;
    document.getElementById('priceRange').value = 300;
    document.getElementById('currentPrice').textContent = '$300';
    this.loadAllProducts();
  }

  // Render products to DOM
  renderProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    if (this.filteredProducts.length === 0) {
      container.innerHTML = '<p class="text-center">No products found matching your criteria.</p>';
      return;
    }

    this.filteredProducts.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 col-12';
      
      col.innerHTML = `
        <div class="card p-3 text-center">
          <img src="/images/shoes/${product.image}" alt="${product.name}" class="product-hover" style="height: 200px; object-fit: cover;">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">$${product.price}</p>
          <p class="card-text small text-muted">${product.description || ''}</p>
          <button class="btn btn-primary" onclick="addToCart('${product._id}')">Add to Cart</button>
        </div>
      `;
      
      container.appendChild(col);
    });
  }

  // Show error message
  showError(message) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `<p class="text-center text-danger">${message}</p>`;
  }
}

// Global functions for HTML onclick events
const productFilter = new ProductFilter();

function loadAllProducts() {
  productFilter.loadAllProducts();
}

function filterByCategory(category) {
  productFilter.filterByCategory(category);
}

function filterByPrice(price) {
  productFilter.filterByPrice(price);
}

function clearFilters() {
  productFilter.clearFilters();
}

function addToCart(productId) {
  console.log('Adding to cart:', productId);
  alert('Product added to cart! (This is a demo)');
}
```

**Purpose:** Handles dynamic product loading and filtering on the frontend

---

## File Structure

### Before (Static Structure)
```
├── controllers/
│   ├── contact.js
│   └── search.js
├── models/
│   ├── Message.js
│   └── Product.js
├── public/
│   ├── *.html (static files)
│   ├── css/
│   ├── js/
│   └── images/
├── routes/
│   └── projects.js (empty)
├── services/
│   ├── server.js
│   └── seed.js
├── index.js
└── package.json
```

### After (Dynamic MVC Structure)
```
├── controllers/
│   ├── contact.js
│   ├── search.js
│   └── productController.js (NEW)
├── models/
│   ├── Message.js
│   └── Product.js (ENHANCED)
├── routes/
│   ├── products.js (NEW)
│   └── projects.js
├── services/
│   ├── productService.js (NEW)
│   ├── server.js (ENHANCED)
│   └── seed.js (ENHANCED)
├── public/
│   ├── *.html (static files)
│   ├── css/
│   ├── js/
│   │   └── productFilter.js (NEW)
│   └── images/
├── views/ (NEW - for EJS templates)
├── index.js
└── package.json (ENHANCED)
```

---

## API Endpoints

### Product Endpoints

| Method | Endpoint | Description | Example |
|--------|----------|-------------|---------|
| GET | `/api/products` | Get all products | `GET /api/products` |
| GET | `/api/products/featured` | Get featured products | `GET /api/products/featured` |
| GET | `/api/products/category/:category` | Get products by category | `GET /api/products/category/mens` |
| GET | `/api/products/search` | Search products | `GET /api/products/search?q=nike` |
| GET | `/api/products/filter` | Get products with filters | `GET /api/products/filter?category=mens&maxPrice=150` |
| GET | `/api/products/:id` | Get single product | `GET /api/products/507f1f77bcf86cd799439011` |

### Example API Responses

**Get All Products:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nike Air Max",
    "price": 120,
    "category": "mens",
    "subcategory": "running",
    "image": "NikeAir.jpg",
    "description": "Comfortable running shoes",
    "stock": 50,
    "featured": true,
    "createdAt": "2025-01-10T10:30:00.000Z",
    "updatedAt": "2025-01-10T10:30:00.000Z"
  }
]
```

**Search Products:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nike Air Max",
    "price": 120,
    "category": "mens",
    "subcategory": "running",
    "image": "NikeAir.jpg",
    "description": "Comfortable running shoes",
    "stock": 50,
    "featured": true
  }
]
```

---

## Testing

### 1. Start the Server
```bash
npm start
```

### 2. Seed the Database
```bash
npm run seed
```

### 3. Test API Endpoints

**Test All Products:**
```bash
curl http://localhost:3000/api/products
```

**Test Category Filter:**
```bash
curl http://localhost:3000/api/products/category/mens
```

**Test Search:**
```bash
curl http://localhost:3000/api/products/search?q=nike
```

**Test Featured Products:**
```bash
curl http://localhost:3000/api/products/featured
```

### 4. Test Frontend (if using dynamic JavaScript)
1. Open `http://localhost:3000/shop.html`
2. Click category buttons to filter
3. Use price range slider
4. Test search functionality

---

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: MongoDB connection failed
```
**Solution:** Ensure MongoDB is running locally on port 27017

**2. Module Not Found Error**
```
Error: Cannot find module 'ejs'
```
**Solution:** Run `npm install` to install dependencies

**3. Port Already in Use**
```
Error: Port 3000 is already in use
```
**Solution:** Change port in `services/server.js` or kill existing process

**4. Database Seeding Issues**
```
Error: Data seeding failed
```
**Solution:** Check MongoDB connection and run `npm run seed`

### Debug Commands

**Check if server is running:**
```bash
curl http://localhost:3000
```

**Check MongoDB connection:**
```bash
mongosh
```

**View server logs:**
```bash
npm start
```

---

## Benefits of Dynamic MVC Structure

### 1. **Separation of Concerns**
- **Models**: Data structure and validation
- **Views**: Presentation layer
- **Controllers**: Request handling
- **Services**: Business logic

### 2. **Scalability**
- Easy to add new features
- Modular architecture
- Reusable components

### 3. **Maintainability**
- Clear code organization
- Easy to debug and modify
- Consistent patterns

### 4. **Performance**
- Database-driven content
- Efficient queries
- Caching capabilities

### 5. **Security**
- Input validation
- Security middleware
- Environment variables

---

## Next Steps

### To Make Frontend Fully Dynamic:

1. **Create EJS Templates:**
   - Convert HTML files to EJS templates
   - Add dynamic data rendering

2. **Implement Dynamic Views:**
   - Replace static HTML with database queries
   - Add real-time filtering

3. **Add Authentication:**
   - User registration/login
   - Session management

4. **Add Admin Panel:**
   - Product management
   - Order management

5. **Add Shopping Cart:**
   - Cart functionality
   - Checkout process

---

## Conclusion

This implementation transforms a static website into a fully dynamic MVC structure while maintaining the original UI design. The backend now supports:

- ✅ **Dynamic Product Loading**
- ✅ **Category Filtering**
- ✅ **Search Functionality**
- ✅ **Price Range Filtering**
- ✅ **Featured Products**
- ✅ **Scalable Architecture**
- ✅ **API Endpoints**
- ✅ **Database Integration**

The structure is now ready for further enhancements and can easily support additional features like user authentication, shopping cart, and admin functionality.
