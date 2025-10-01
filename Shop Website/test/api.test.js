// test/api.test.js - API Endpoint Tests
const expect = require("chai").expect;
const request = require("request");

const baseUrl = "http://localhost:3000";

describe("MystiKraft API Tests", function () {
  
  // Server Health
  describe("Server Health", function () {
    it("should return status 200 for home page", function (done) {
      request(baseUrl, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("should return 404 for non-existent endpoint", function (done) {
      request.get(`${baseUrl}/api/doesnotexist`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    });
  });

  // Product API Tests
  describe("Product API", function () {
    it("should return products with correct structure", function (done) {
      request.get(`${baseUrl}/api/products`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.include("application/json");

        const data = JSON.parse(body);
        expect(data).to.have.property("items").that.is.an("array");
        expect(data).to.have.property("page");
        expect(data).to.have.property("pages");
        expect(data).to.have.property("total");
        done();
      });
    });

    it("should filter products by category", function (done) {
      request.get(`${baseUrl}/api/products?category=men`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(body);
        expect(data.items).to.be.an("array");
        if (data.items.length > 0) {
          expect(data.items[0]).to.have.property("category", "men");
        }
        done();
      });
    });

    it("should filter products by price range", function (done) {
      request.get(`${baseUrl}/api/products?price=0-50`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(body);
        expect(data.items).to.be.an("array");
        if (data.items.length > 0) {
          data.items.forEach(item => {
            expect(item.price).to.be.at.most(50);
          });
        }
        done();
      });
    });

    it("should sort products by newest", function (done) {
      request.get(`${baseUrl}/api/products?sort=newest`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(body);
        expect(data.items).to.be.an("array");
        done();
      });
    });

    it("should filter by brand", function (done) {
      request.get(`${baseUrl}/api/products?brand=Nike`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(body);
        expect(data.items).to.be.an("array");
        done();
      });
    });
  });

  // Cart API Tests
  describe("Cart API", function () {
    it("should return cart for guest session", function (done) {
      request.get(`${baseUrl}/api/cart`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(body);
        expect(data).to.have.property("items").that.is.an("array");
        done();
      });
    });
  });

  // Wishlist API Tests
  describe("Wishlist API", function () {
    it("should return wishlist for guest session", function (done) {
      request.get(`${baseUrl}/api/wishlist`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        const data = JSON.parse(body);
        expect(data).to.have.property("items").that.is.an("array");
        done();
      });
    });
  });

  // Coupon API Tests
  describe("Coupon API", function () {
    it("should validate a valid coupon code", function (done) {
      const options = {
        url: `${baseUrl}/api/coupons/validate`,
        method: "POST",
        json: { code: "WELCOME10", orderAmount: 100 }
      };
      
      request(options, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property("success", true);
        expect(body).to.have.property("coupon");
        done();
      });
    });

    it("should reject invalid coupon code", function (done) {
      const options = {
        url: `${baseUrl}/api/coupons/validate`,
        method: "POST",
        json: { code: "INVALID123", orderAmount: 100 }
      };
      
      request(options, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        expect(body).to.have.property("error");
        done();
      });
    });
  });

  // Search API Tests
  describe("Search API", function () {
    it("should return search results", function (done) {
      request.get(`${baseUrl}/api/search?q=Nike`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  // Static Pages Tests
  describe("Static Pages", function () {
    const pages = ['/shop.html', '/cart.html', '/wishlist.html', '/about.html', '/contact.html'];
    
    pages.forEach(page => {
      it(`should load ${page} successfully`, function (done) {
        request.get(`${baseUrl}${page}`, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      });
    });
  });
});

