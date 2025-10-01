// test/frontend.test.js - Frontend Pages and Features Tests
const expect = require("chai").expect;
const request = require("request");

const baseUrl = "http://localhost:3000";

describe("Frontend Pages Tests", function () {

  describe("All Pages Load Successfully", function () {
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/index.html', name: 'Index' },
      { path: '/shop.html', name: 'Shop' },
      { path: '/cart.html', name: 'Cart' },
      { path: '/wishlist.html', name: 'Wishlist' },
      { path: '/checkout.html', name: 'Checkout' },
      { path: '/guestCheckout.html', name: 'Guest Checkout' },
      { path: '/product.html', name: 'Product' },
      { path: '/profile.html', name: 'Profile' },
      { path: '/about.html', name: 'About' },
      { path: '/contact.html', name: 'Contact' },
      { path: '/search.html', name: 'Search' }
    ];

    pages.forEach(page => {
      it(`should load ${page.name} page (${page.path})`, function (done) {
        request.get(`${baseUrl}${page.path}`, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body).to.be.a("string");
          expect(body.length).to.be.above(0);
          done();
        });
      });
    });
  });

  describe("Admin Pages Load Successfully", function () {
    const adminPages = [
      { path: '/admin.html', name: 'Admin Products' },
      { path: '/admin-orders.html', name: 'Admin Orders' },
      { path: '/admin-users.html', name: 'Admin Users' }
    ];

    adminPages.forEach(page => {
      it(`should load ${page.name} page`, function (done) {
        request.get(`${baseUrl}${page.path}`, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(body).to.include('Admin');
          done();
        });
      });
    });
  });

  describe("Static Assets", function () {
    it("should load CSS files", function (done) {
      request.get(`${baseUrl}/css/style.css`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.include("text/css");
        done();
      });
    });

    it("should load dark mode CSS", function (done) {
      request.get(`${baseUrl}/css/dark-mode.css`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers["content-type"]).to.include("text/css");
        done();
      });
    });

    it("should load JavaScript files", function (done) {
      request.get(`${baseUrl}/js/cart.js`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("should load auth.js", function (done) {
      request.get(`${baseUrl}/js/auth.js`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.include('login');
        done();
      });
    });

    it("should load wishlist.js", function (done) {
      request.get(`${baseUrl}/js/wishlist.js`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.include('wishlist');
        done();
      });
    });

    it("should load dark-mode.js", function (done) {
      request.get(`${baseUrl}/js/dark-mode.js`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.include('dark');
        done();
      });
    });

    it("should load recently-viewed.js", function (done) {
      request.get(`${baseUrl}/js/recently-viewed.js`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.include('RecentlyViewed');
        done();
      });
    });
  });

  describe("Page Content Verification", function () {
    it("homepage should contain MystiKraft branding", function (done) {
      request.get(baseUrl, function (error, response, body) {
        expect(body).to.include('MystiKraft');
        done();
      });
    });

    it("shop page should have filter options", function (done) {
      request.get(`${baseUrl}/shop.html`, function (error, response, body) {
        expect(body).to.include('filter');
        expect(body).to.include('category');
        done();
      });
    });

    it("cart page should have checkout button", function (done) {
      request.get(`${baseUrl}/cart.html`, function (error, response, body) {
        expect(body).to.include('checkout');
        done();
      });
    });

    it("wishlist page should have wishlist functionality", function (done) {
      request.get(`${baseUrl}/wishlist.html`, function (error, response, body) {
        expect(body).to.include('wishlist');
        expect(body).to.include('favorite');
        done();
      });
    });
  });
});

