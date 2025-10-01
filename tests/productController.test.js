// tests/productController.test.js

const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const Product = require('../models/Product');
const productController = require('../controllers/productController');
const app = require('../services/server');

describe('Product Controller CRUD Operations', () => {
  let sandbox;
  let sellerId;
  // Use a sandbox to stub methods
  beforeEach(() => {
    // Create a sandbox for stubbing
    sandbox = sinon.createSandbox();

    sellerId = new mongoose.Types.ObjectId();

    // Stub static methods
    sandbox.stub(Product, 'findOne');
    sandbox.stub(Product, 'find');
    sandbox.stub(Product, 'findById');
    sandbox.stub(Product, 'deleteMany');

    // Stub instance method save
    sandbox.stub(Product.prototype, 'save');
  });

  afterEach(() => {
    sandbox.restore();
  });
  // Tests for each controller method
  describe('addProduct', () => {
    it('should create a new product successfully', async () => {
  const mockId = new mongoose.Types.ObjectId();
  const mockSellerId = sellerId.toString(); // Ensure consistency

  const mockProduct = {
    _id: mockId,
    sellerId: mockSellerId,
    name: 'Test Shoe',
    slug: 'test-shoe',
    price: 99.99,
    category: 'shoes',
    image: '/images/shoes/test-shoe-123456.jpg',
    description: 'Test description',
    toJSON() {
      return {
        _id: mockId.toString(),
        sellerId: mockSellerId, 
        name: this.name,
        slug: this.slug,
        price: this.price,
        category: this.category,
        image: this.image,
        description: this.description,
      };
    }
  };

  Product.findOne.resolves(null);
  Product.prototype.save.resolves(mockProduct);

  const req = {
    body: {
      name: 'Test Shoe',
      slug: 'test-shoe',
      price: '99.99',
      category: 'shoes',
      description: 'Test description'
    },
    file: { filename: 'test-shoe-123456.jpg' },
    user: { userId: mockSellerId, role: 'seller' } // ✅ Same sellerId
  };

  let statusCode, responseBody;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  await productController.addProduct(req, res);

  expect(statusCode).to.equal(201);
  expect(responseBody).to.have.property('product');
  expect(responseBody.product._id).to.equal(mockId.toString());
  expect(responseBody.product.sellerId).to.equal(mockSellerId); // ✅ This should now pass
  expect(responseBody.product).to.include({
    name: 'Test Shoe',
    slug: 'test-shoe',
    price: 99.99,
    category: 'shoes',
    image: '/images/shoes/test-shoe-123456.jpg',
    description: 'Test description'
  });
  expect(responseBody).to.have.property('message', 'Product added successfully');
});


    it('should return 403 if user is not a seller', async () => {
      const req = {
        body: {
          name: 'Test Shoe',
          slug: 'test-shoe',
          price: '99.99',
          category: 'shoes',
          description: 'Test description'
        },
        file: { filename: 'test-shoe-123456.jpg' },
        user: { userId: new mongoose.Types.ObjectId().toString(), role: 'customer' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.addProduct(req, res);

      expect(statusCode).to.equal(403);
      expect(responseBody).to.deep.equal({ message: 'Unauthorized' });
    });

    it('should return 400 if price is less than 1', async () => {
      const req = {
        body: {
          name: 'Test Shoe',
          slug: 'test-shoe',
          price: '0.50',
          category: 'shoes',
          description: 'Test description'
        },
        file: { filename: 'test-shoe-123456.jpg' },
        user: { userId: new mongoose.Types.ObjectId().toString(), role: 'seller' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };
      await productController.addProduct(req, res);
      expect(statusCode).to.equal(400);
      expect(responseBody).to.deep.equal({ message: 'Price must be 1 or higher', price: '0.50' });
    });

    it('should return 400 if a required field is missing', async () => {
      const req = {
        body: {
          name: 'Test Shoe',
          slug: 'test-shoe',
          price: '99.99',
          category: 'shoes'
          // description missing
        },
        file: { filename: 'test-shoe-123456.jpg' },
        user: { userId: new mongoose.Types.ObjectId().toString(), role: 'seller' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.addProduct(req, res);

      expect(statusCode).to.equal(400);
      expect(responseBody).to.deep.equal({
        message: 'All fields are required',
        missing: {
          name: 'Test Shoe',
          slug: 'test-shoe',
          price: '99.99',
          category: 'shoes',
          description: undefined
        }
      });
    });
  });

  describe('getProducts', () => {
    it('should return a list of products', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockProduct = {
        _id: mockId,
        name: 'Jeans',
        slug: 'jeans-blue',
        price: 30,
        category: 'bottoms',
        image: '/images/bottoms/jeans-blue-123456.jpg',
        description: 'Ladies blue jeans',
        toJSON() {
          return {
            _id: mockId.toString(),
            name: this.name,
            slug: this.slug,
            price: this.price,
            category: this.category,
            image: this.image,
            description: this.description
          };
        }
      };

      // Stub find to return a chain
      Product.find.returns({
        sort: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        limit: sandbox.stub().resolves([mockProduct])
      });

      let statusCode, responseBody;
      const req = { query: { page: '1', sort: 'newest' } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.getProducts(req, res);

      expect(statusCode).to.equal(200);
      expect(Array.isArray(responseBody)).to.be.true;
      expect(responseBody).to.have.lengthOf(1);
      expect(responseBody[0]._id).to.equal(mockId.toString());
      expect(responseBody[0]).to.include({
        name: 'Jeans',
        slug: 'jeans-blue',
        price: 30,
        category: 'bottoms',
        image: '/images/bottoms/jeans-blue-123456.jpg',
        description: 'Ladies blue jeans'
      });
    });

    it('should handle errors and return 500', async () => {
      Product.find.returns({
        sort: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        limit: sandbox.stub().rejects(new Error('Database error'))
      });

      let statusCode, responseBody;
      const req = { query: { page: '1' } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.getProducts(req, res);

      expect(statusCode).to.equal(500);
      expect(responseBody).to.deep.equal({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('getMyProducts', () => {
    it('should return seller’s products', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockProduct = {
        _id: mockId,
        sellerId,
        name: 'Test Shoe',
        slug: 'test-shoe',
        price: 99.99,
        category: 'shoes',
        image: '/images/shoes/test-shoe-123456.jpg',
        description: 'Test description',
        toJSON() {
          return {
            _id: mockId.toString(),
            name: this.name,
            slug: this.slug,
            price: this.price,
            category: this.category,
            image: this.image,
            description: this.description
          };
        }
      };

      Product.find.withArgs({ sellerId: sellerId.toString() }).resolves([mockProduct]);

      let statusCode, responseBody;
      const req = { user: { userId: sellerId.toString(), role: 'seller' } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.getMyProducts(req, res);

      expect(statusCode).to.equal(200);
      expect(responseBody).to.be.an('array');
      expect(responseBody[0]._id).to.equal(mockId.toString());
      expect(responseBody[0]).to.include({
        name: 'Test Shoe',
        slug: 'test-shoe',
        price: 99.99,
        category: 'shoes',
        image: '/images/shoes/test-shoe-123456.jpg',
        description: 'Test description'
      });
    });

    it('should return 403 if user is not a seller', async () => {
      const req = { user: { userId: new mongoose.Types.ObjectId().toString(), role: 'customer' } };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.getMyProducts(req, res);

      expect(statusCode).to.equal(403);
      expect(responseBody).to.deep.equal({ message: 'Unauthorized' });
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const mockId = new mongoose.Types.ObjectId();

      const existing = {
        _id: mockId,
        sellerId,
        name: 'Old Name',
        slug: 'old-slug',
        price: 50,
        category: 'shoes',
        description: 'Old desc',
        image: '/images/old.jpg',
        save: sandbox.stub().resolvesThis(),
        toJSON() {
          return {
            _id: mockId.toString(),
            name: this.name,
            slug: this.slug,
            price: this.price,
            category: this.category,
            image: this.image,
            description: this.description
          };
        }
      };

      // Stub findById to match the string version
      Product.findById.withArgs(mockId.toString()).resolves(existing);

      const req = {
        params: { id: mockId.toString() },
        body: {
          name: 'Updated Name',
          slug: 'updated-name',
          price: '75',
          category: 'shoes',
          description: 'New desc'
        },
        file: { filename: 'updated-name-123.jpg' },
        user: { userId: sellerId.toString(), role: 'seller' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.updateProduct(req, res);

      expect(statusCode).to.equal(200);
      expect(responseBody.product._id).to.equal(mockId.toString());
      expect(responseBody.product).to.include({
        name: 'Updated Name',
        slug: 'updated-name',
        price: 75,
        category: 'shoes',
        description: 'New desc'
      });
      expect(responseBody).to.have.property('message', 'Product updated successfully');
    });

    it('should return 403 if user is not the product owner', async () => {
      const mockId = new mongoose.Types.ObjectId();

      const existing = {
        _id: mockId,
        sellerId: new mongoose.Types.ObjectId(),  // different seller
        save: sandbox.stub().resolvesThis()
      };

      Product.findById.withArgs(mockId.toString()).resolves(existing);

      const req = {
        params: { id: mockId.toString() },
        body: {
          name: 'Updated Name',
          slug: 'updated-name',
          price: '75',
          category: 'shoes',
          description: 'New desc'
        },
        user: { userId: sellerId.toString(), role: 'seller' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.updateProduct(req, res);

      expect(statusCode).to.equal(403);
      expect(responseBody).to.deep.equal({ message: 'Unauthorized: You can only edit your own products' });
    });

    it('should return 400 if a required field is missing', async () => {
      const mockId = new mongoose.Types.ObjectId();

      const existing = {
        _id: mockId,
        sellerId,
        save: sandbox.stub().resolvesThis()
      };

      Product.findById.withArgs(mockId.toString()).resolves(existing);

      const req = {
        params: { id: mockId.toString() },
        body: {
          name: '',  // missing name
          slug: 'updated-name',
          price: '75',
          category: 'shoes',
          description: 'New desc'
        },
        user: { userId: sellerId.toString(), role: 'seller' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.updateProduct(req, res);

      expect(statusCode).to.equal(400);
      expect(responseBody).to.deep.equal({
        message: 'All fields are required',
        missing: {
          name: '',
          slug: 'updated-name',
          price: '75',
          category: 'shoes',
          description: 'New desc'
        }
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const mockId = new mongoose.Types.ObjectId();

      const existing = {
        _id: mockId,
        sellerId,
        deleteOne: sandbox.stub().resolves()
      };

      Product.findById.withArgs(mockId.toString()).resolves(existing);

      const req = {
        params: { id: mockId.toString() },
        user: { userId: sellerId.toString(), role: 'seller' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.deleteProduct(req, res);

      expect(statusCode).to.equal(200);
      expect(responseBody).to.deep.equal({ message: 'Product deleted successfully' });
    });

    it('should return 404 if product not found', async () => {
      Product.findById.resolves(null);

      const req = {
        params: { id: new mongoose.Types.ObjectId().toString() },
        user: { userId: sellerId.toString(), role: 'seller' }
      };

      let statusCode, responseBody;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        }
      };

      await productController.deleteProduct(req, res);

      expect(statusCode).to.equal(404);
      expect(responseBody).to.deep.equal({ message: 'Product not found' });
    });
  });
});

describe('API Routes', () => {
  let sandbox;
  let sellerId;
  let token;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sellerId = new mongoose.Types.ObjectId();
    token = jwt.sign(
      { userId: sellerId.toString(), role: 'seller' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create a product via POST /api/products', async () => {
  const mockId = new mongoose.Types.ObjectId();

  // Ensure sellerId is used consistently
  const mockSellerId = sellerId.toString();

  sandbox.stub(Product, 'findOne').resolves(null);
  sandbox.stub(Product.prototype, 'save').resolves({
    _id: mockId,
    sellerId: mockSellerId,
    name: 'Test Shoe',
    slug: 'test-shoe',
    price: 99.99,
    category: 'shoes',
    image: '/images/shoes/test-shoe-123456.jpg',
    description: 'Test description',
    toJSON() {
      return {
        _id: mockId.toString(),
        sellerId: mockSellerId, // ✅ use same sellerId as in token
        name: this.name,
        slug: this.slug,
        price: this.price,
        category: this.category,
        image: this.image,
        description: this.description
      };
    }
  });

  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .field('name', 'Test Shoe')
    .field('slug', 'test-shoe')
    .field('price', '99.99')
    .field('category', 'shoes')
    .field('description', 'Test description')
    .attach('image', Buffer.from('dummy'), 'test-shoe-123456.jpg');

  expect(res.status).to.equal(201);
  expect(res.body).to.have.property('message', 'Product added successfully');
  expect(res.body.product).to.include({
    name: 'Test Shoe',
    slug: 'test-shoe',
    price: 99.99,
    category: 'shoes',
    description: 'Test description'
  });
  expect(res.body.product.sellerId).to.equal(mockSellerId); // ✅ assertion will now match
});


  it('should get products via GET /api/products', async () => {
    const mockId = new mongoose.Types.ObjectId();
    const mockProduct = {
      _id: mockId,
      name: 'Jeans',
      slug: 'jeans-blue',
      price: 30,
      category: 'bottoms',
      image: '/images/bottoms/jeans-blue-123456.jpg',
      description: 'Ladies blue jeans',
      toJSON() {
        return {
          _id: mockId.toString(),
          name: this.name,
          slug: this.slug,
          price: this.price,
          category: this.category,
          image: this.image,
          description: this.description
        };
      }
    };

    sandbox.stub(Product, 'find').returns({
      sort: sandbox.stub().returnsThis(),
      skip: sandbox.stub().returnsThis(),
      limit: sandbox.stub().resolves([mockProduct])
    });

    const res = await request(app)
      .get('/api/products')
      .query({ page: 1, sort: 'newest' });

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.lengthOf(1);
    expect(res.body[0]).to.include({
      name: 'Jeans',
      slug: 'jeans-blue',
      price: 30,
      category: 'bottoms',
      description: 'Ladies blue jeans'
    });
  });
});
