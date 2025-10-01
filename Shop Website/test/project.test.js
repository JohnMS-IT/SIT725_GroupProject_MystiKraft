// test/basic.test.js
const expect = require("chai").expect;
const request = require("request");

const baseUrl = "http://localhost:3000";

describe("MystiKraft API", function () {
  // 1) Test if server is running
  it("returns status 200 for home page", function (done) {
    request(baseUrl, function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  // 2) Test if /api/products returns JSON with items
  it("should return products with correct structure", function (done) {
    request.get(`${baseUrl}/api/products`, function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(response.headers["content-type"]).to.include("application/json");

      const data = JSON.parse(body);
      expect(data).to.have.property("items").that.is.an("array");
      expect(data).to.have.property("page");
      expect(data).to.have.property("pages");
      done();
    });
  });

  // 3) Test 404 for invalid endpoint
  it("should return 404 for non-existent endpoint", function (done) {
    request.get(`${baseUrl}/api/doesnotexist`, function (error, response, body) {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });
});
