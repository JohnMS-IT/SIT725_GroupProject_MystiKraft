// test/orders.test.js - Order Management Tests
const expect = require("chai").expect;
const request = require("request");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const orderService = require("../services/orderService");

const baseUrl = "http://localhost:3000";
const mongoURI = 'mongodb://localhost:27017/mystikraft-test';

describe("Order Management Tests", function () {
  let testProduct;

  before(async function () {
    this.timeout(10000);
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoURI);
    }
  });

  beforeEach(async function () {
    await Order.deleteMany({});
    await Product.deleteMany({});
    
    testProduct = await Product.create({
      name: "Test Order Product",
      price: 100,
      category: "men",
      image: "/test.jpg",
      stock: 10
    });
  });

  after(async function () {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });

  describe("Order Service", function () {
    it("should generate unique order numbers", function () {
      const orderNum1 = orderService.generateOrderNumber();
      const orderNum2 = orderService.generateOrderNumber();
      expect(orderNum1).to.be.a("string");
      expect(orderNum1).to.include("ORD-");
      expect(orderNum1).to.not.equal(orderNum2);
    });

    it("should create an order", async function () {
      const customerInfo = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "Australia"
        }
      };

      const cartItems = [{
        productId: testProduct,
        quantity: 2,
        price: testProduct.price
      }];

      const order = await orderService.createOrder("test-session", customerInfo, cartItems);
      expect(order).to.have.property("orderNumber");
      expect(order.total).to.equal(200);
      expect(order.items.length).to.equal(1);
    });

    it("should get order by order number", async function () {
      const customerInfo = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        address: {
          street: "456 Oak St",
          city: "Test City",
          state: "TS",
          zipCode: "54321",
          country: "Australia"
        }
      };

      const cartItems = [{
        productId: testProduct,
        quantity: 1,
        price: testProduct.price
      }];

      const createdOrder = await orderService.createOrder("test-session-2", customerInfo, cartItems);
      const foundOrder = await orderService.getOrderByNumber(createdOrder.orderNumber);
      
      expect(foundOrder).to.not.be.null;
      expect(foundOrder.orderNumber).to.equal(createdOrder.orderNumber);
    });

    it("should get orders by user email", async function () {
      const customerInfo = {
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
        address: {
          street: "789 Pine St",
          city: "Email City",
          state: "EC",
          zipCode: "67890",
          country: "Australia"
        }
      };

      const cartItems = [{
        productId: testProduct,
        quantity: 1,
        price: testProduct.price
      }];

      await orderService.createOrder("session-1", customerInfo, cartItems);
      await orderService.createOrder("session-2", customerInfo, cartItems);

      const orders = await orderService.getOrdersByUserEmail("user@example.com");
      expect(orders).to.be.an("array");
      expect(orders.length).to.equal(2);
    });

    it("should update order status", async function () {
      const customerInfo = {
        email: "status@example.com",
        firstName: "Status",
        lastName: "Test",
        address: {
          street: "111 Status St",
          city: "Status City",
          state: "SC",
          zipCode: "11111",
          country: "Australia"
        }
      };

      const cartItems = [{
        productId: testProduct,
        quantity: 1,
        price: testProduct.price
      }];

      const order = await orderService.createOrder("session-status", customerInfo, cartItems);
      const updatedOrder = await orderService.updateOrderStatus(order._id, "shipped");
      
      expect(updatedOrder.status).to.equal("shipped");
    });

    it("should get all orders", async function () {
      const customerInfo = {
        email: "all@example.com",
        firstName: "All",
        lastName: "Orders",
        address: {
          street: "222 All St",
          city: "All City",
          state: "AC",
          zipCode: "22222",
          country: "Australia"
        }
      };

      const cartItems = [{
        productId: testProduct,
        quantity: 1,
        price: testProduct.price
      }];

      await orderService.createOrder("session-all-1", customerInfo, cartItems);
      await orderService.createOrder("session-all-2", customerInfo, cartItems);

      const allOrders = await orderService.getAllOrders();
      expect(allOrders).to.be.an("array");
      expect(allOrders.length).to.be.at.least(2);
    });
  });

  describe("Order API Endpoints", function () {
    it("should create order via API", function (done) {
      const orderData = {
        customerInfo: {
          firstName: "API",
          lastName: "Test",
          email: "api@test.com",
          phone: "1234567890",
          address: {
            street: "API St",
            city: "Test",
            state: "TS",
            zipCode: "12345",
            country: "Australia"
          }
        }
      };

      const options = {
        url: `${baseUrl}/api/orders`,
        method: "POST",
        json: orderData
      };

      request(options, function (error, response, body) {
        expect(response.statusCode).to.be.oneOf([200, 400]); // 400 if cart is empty
        done();
      });
    });
  });
});

