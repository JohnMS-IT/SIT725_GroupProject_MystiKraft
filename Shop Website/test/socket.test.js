// test/socket.test.js
const { expect } = require("chai");
const { io } = require("socket.io-client");

const baseUrl = "http://localhost:3000";

describe("Socket.IO", function () {
  let clientSocket;

  // Increase timeout because sockets sometimes need more time
  this.timeout(5000);

  beforeEach((done) => {
    // Connect client before each test
    clientSocket = io(baseUrl, {
      transports: ["websocket"], // use websocket transport
      reconnectionDelay: 0,
      forceNew: true
    });

    clientSocket.on("connect", () => {
      done();
    });
  });

  afterEach((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    done();
  });

  it("should connect to the server", (done) => {
    expect(clientSocket.connected).to.be.true;
    done();
  });

  it("should receive product-added broadcast", (done) => {
    // Listen for product-added event
    clientSocket.on("product-added", (data) => {
      expect(data).to.have.property("name");
      expect(data).to.have.property("price");
      done();
    });

    // Emit a fake product from server side by POSTing to /api/products
    // In real test, this assumes your API triggers io.emit
    const fetch = require("node-fetch");
    fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Product",
        price: 50,
        category: "test",
        image: "/images/test.jpg"
      })
    });
  });
});
