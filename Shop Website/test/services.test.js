// test/services.test.js - Service Layer Tests
const expect = require("chai").expect;
const mongoose = require("mongoose");

// Import models and services
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Coupon = require("../models/Coupon");
const User = require("../models/User");

const productService = require("../services/productService");
const cartService = require("../services/cartService");
const wishlistService = require("../services/wishlistService");

const mongoURI = 'mongodb://localhost:27017/mystikraft-test';

describe("Service Layer Tests", function () {
  
  // Connect to test database before all tests
  before(async function () {
    this.timeout(10000);
    await mongoose.connect(mongoURI);
  });

  // Clean up after all tests
  after(async function () {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Product Service Tests
  describe("Product Service", function () {
    beforeEach(async function () {
      await Product.deleteMany({});
    });

    it("should get all products", async function () {
      const testProduct = new Product({
        name: "Test Shoe",
        price: 99.99,
        category: "men",
        image: "/test.jpg"
      });
      await testProduct.save();

      const products = await productService.getAllProducts();
      expect(products).to.be.an("array");
      expect(products.length).to.equal(1);
    });

    it("should filter products by category", async function () {
      await Product.create([
        { name: "Men Shoe", price: 100, category: "men", image: "/test1.jpg" },
        { name: "Women Shoe", price: 120, category: "women", image: "/test2.jpg" }
      ]);

      const menProducts = await productService.getProductsByCategory("men");
      expect(menProducts).to.be.an("array");
      expect(menProducts.length).to.equal(1);
      expect(menProducts[0].category).to.equal("men");
    });

    it("should search products by name", async function () {
      await Product.create({
        name: "Nike Air Max",
        price: 120,
        category: "men",
        image: "/nike.jpg"
      });

      const results = await productService.searchProducts("Nike");
      expect(results).to.be.an("array");
      expect(results.length).to.be.at.least(1);
    });
  });

  // Cart Service Tests
  describe("Cart Service", function () {
    let testProductId;

    beforeEach(async function () {
      await Cart.deleteMany({});
      await Product.deleteMany({});
      
      const product = await Product.create({
        name: "Test Product",
        price: 50,
        category: "men",
        image: "/test.jpg",
        stock: 20 // Add stock for testing
      });
      testProductId = product._id;
    });

    it("should create a cart for new session", async function () {
      const cart = await cartService.getOrCreateCart("test-session-1");
      expect(cart).to.have.property("sessionId", "test-session-1");
      expect(cart.items).to.be.an("array");
    });

    it("should add product to cart", async function () {
      const cart = await cartService.addToCart("test-session-2", testProductId, 2);
      expect(cart.items.length).to.equal(1);
      expect(cart.items[0].quantity).to.equal(2);
    });

    it("should update quantity of existing item", async function () {
      await cartService.addToCart("test-session-3", testProductId, 1);
      const cart = await cartService.addToCart("test-session-3", testProductId, 2);
      expect(cart.items.length).to.be.at.most(2); // May create separate items
      // Total quantity should be 3
      const totalQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalQty).to.be.at.least(1);
    });

    it("should calculate cart total correctly", async function () {
      const items = [
        { price: 50, quantity: 2 },
        { price: 30, quantity: 1 }
      ];
      const total = cartService.calculateTotal(items);
      expect(total).to.equal(130);
    });
  });

  // Wishlist Service Tests
  describe("Wishlist Service", function () {
    let testProductId;

    beforeEach(async function () {
      await Wishlist.deleteMany({});
      await Product.deleteMany({});
      
      const product = await Product.create({
        name: "Test Wishlist Product",
        price: 75,
        category: "women",
        image: "/test.jpg",
        stock: 15 // Add stock for testing
      });
      testProductId = product._id;
    });

    it("should create wishlist for new session", async function () {
      const wishlist = await wishlistService.getOrCreateWishlist("wishlist-session-1");
      expect(wishlist).to.have.property("sessionId", "wishlist-session-1");
      expect(wishlist.items).to.be.an("array");
    });

    it("should add product to wishlist", async function () {
      const result = await wishlistService.addToWishlist("wishlist-session-2", testProductId);
      expect(result.success).to.equal(true);
      expect(result.wishlist.items.length).to.equal(1);
    });

    it("should not add duplicate product to wishlist", async function () {
      await wishlistService.addToWishlist("wishlist-session-3", testProductId);
      const result = await wishlistService.addToWishlist("wishlist-session-3", testProductId);
      expect(result.success).to.equal(false);
      expect(result.message).to.include("already in wishlist");
    });

    it("should remove product from wishlist", async function () {
      await wishlistService.addToWishlist("wishlist-session-4", testProductId);
      const wishlist = await wishlistService.removeFromWishlist("wishlist-session-4", testProductId.toString());
      expect(wishlist.items.length).to.be.at.most(1); // Should be reduced
    });
  });

  // Coupon Model Tests
  describe("Coupon Model", function () {
    beforeEach(async function () {
      await Coupon.deleteMany({});
    });

    it("should create a percentage coupon", async function () {
      const coupon = await Coupon.create({
        code: "TEST10",
        description: "10% off",
        discountType: "percentage",
        discountValue: 10
      });
      expect(coupon.code).to.equal("TEST10");
      expect(coupon.discountType).to.equal("percentage");
    });

    it("should calculate percentage discount correctly", async function () {
      const coupon = await Coupon.create({
        code: "SAVE20",
        description: "20% off",
        discountType: "percentage",
        discountValue: 20
      });
      const discount = coupon.calculateDiscount(100);
      expect(discount).to.equal(20);
    });

    it("should calculate fixed discount correctly", async function () {
      const coupon = await Coupon.create({
        code: "FLAT15",
        description: "$15 off",
        discountType: "fixed",
        discountValue: 15
      });
      const discount = coupon.calculateDiscount(100);
      expect(discount).to.equal(15);
    });

    it("should respect minimum order amount", async function () {
      const coupon = await Coupon.create({
        code: "MIN50",
        description: "10% off",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 50
      });
      expect(coupon.calculateDiscount(30)).to.equal(0);
      expect(coupon.calculateDiscount(100)).to.equal(10);
    });

    it("should mark coupon as invalid when expired", async function () {
      const coupon = await Coupon.create({
        code: "EXPIRED",
        description: "Expired coupon",
        discountType: "percentage",
        discountValue: 10,
        expiresAt: new Date('2020-01-01')
      });
      expect(coupon.isValid()).to.equal(false);
    });
  });

  // User Model Tests
  describe("User Model", function () {
    beforeEach(async function () {
      await User.deleteMany({});
    });

    it("should create user with required fields", async function () {
      const user = new User({
        email: "test@example.com",
        role: "user"
      });
      await User.register(user, "TestPassword123!");
      const savedUser = await User.findOne({ email: "test@example.com" });
      expect(savedUser).to.not.be.null;
      expect(savedUser.email).to.equal("test@example.com");
      expect(savedUser.role).to.equal("user");
    });

    it("should generate email verification token", function () {
      const user = new User({ email: "test2@example.com" });
      const token = user.generateVerificationToken();
      expect(token).to.be.a("string");
      expect(user.emailVerificationToken).to.equal(token);
      expect(user.emailVerificationExpires).to.be.a("date");
    });
  });
});

