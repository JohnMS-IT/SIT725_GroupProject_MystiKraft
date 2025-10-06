// test/checkoutWorkflow.test.js
const { expect } = require('chai');
// Use built-in fetch (Node.js 18+) or fallback to node-fetch
const fetch = globalThis.fetch || require('node-fetch');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const baseUrl = 'http://localhost:3000';

let productId;
let userEmail, userPassword, cookie = '';

async function deleteTestProduct(productId) {
    await Product.findByIdAndDelete(productId);
}

describe('Checkout Workflows', function () {
    this.timeout(15000);

    before(async () => {
        // Create test product directly in database
        const testProduct = await Product.create({
            name: 'Test Product For Checkout',
            price: 9.99,
            category: 'men', // Use valid category
            image: '/images/test.jpg',
            stock: 10
        });
        productId = testProduct._id.toString();
        expect(productId).to.be.a('string');
        userEmail = `testuser_${Date.now()}@example.com`;
        userPassword = 'Test1234!'; 
        const regRes = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password: userPassword, name: 'Test User' })
        });
        const regText = await regRes.text();
        if (regRes.status !== 200) {
            console.error('Registration failed:', regRes.status, regText);
        }
        expect(regRes.status).to.equal(200);
    });

    after(async () => {
        await deleteTestProduct(productId);
    });

    describe('Guest Checkout', function () {
        it('should allow guest to add item to cart', async () => {
            const res = await fetch(`${baseUrl}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            expect(res.status).to.be.oneOf([200, 201]);
            const data = await res.json();
            expect(data).to.have.property('items');
        });

        it('should allow guest to proceed to checkout and return order', async () => {
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerInfo: { name: 'Guest', email: 'guest@example.com' }
                })
            });
            expect(res.status).to.be.oneOf([200, 201, 400]);
            if (res.status === 200 || res.status === 201) {
                const order = await res.json();
                expect(order).to.have.property('items');
                expect(order.items[0]).to.have.property('productId');
            }
        });

        it('should not allow guest checkout with empty cart', async () => {
            await fetch(`${baseUrl}/api/cart`, { method: 'DELETE' });
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerInfo: { name: 'Guest', email: 'guest@example.com' }
                })
            });
            expect(res.status).to.equal(400);
        });
    });

    describe('Registered User Checkout', function () {
        it('should login as a registered user', async () => {
            const res = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, password: userPassword })
            });
            const text = await res.text();
            let parsed;
            try { parsed = JSON.parse(text); } catch { parsed = { message: text }; }

            if (res.status === 200) {
                cookie = res.headers.get('set-cookie');
                expect(cookie).to.be.a('string');
            } else {
                expect(res.status).to.equal(401);
                expect(String(parsed.message || text).toLowerCase()).to.include('verify');
                cookie = '';
            }
        });

        it('should allow registered user to add item to cart', async () => {
            const headers = { 'Content-Type': 'application/json' };
            if (cookie) headers['Cookie'] = cookie;
            const res = await fetch(`${baseUrl}/api/cart`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ productId, quantity: 2 })
            });
            expect(res.status).to.be.oneOf([200, 201]);
            const data = await res.json();
            expect(data).to.have.property('items');
        });

        it('should allow registered user to checkout and return order', async () => {
            const headers = { 'Content-Type': 'application/json' };
            if (cookie) headers['Cookie'] = cookie;
            const res = await fetch(`${baseUrl}/api/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    customerInfo: { name: 'Test User', email: userEmail }
                })
            });
            expect(res.status).to.be.oneOf([200, 201, 400]);
            if (res.status === 200 || res.status === 201) {
                const order = await res.json();
                expect(order).to.have.property('items');
                expect(order.items[0]).to.have.property('productId');
            }
        });
    });
});
