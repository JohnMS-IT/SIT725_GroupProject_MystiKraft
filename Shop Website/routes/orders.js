const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../utils/adminAuth');

// POST /api/orders - Create order
router.post('/', orderController.createOrder);

// GET /api/orders/user/history - Get user's order history (protected)
router.get('/user/history', requireAuth, orderController.getUserOrders);

// GET /api/orders/all - Get all orders (admin only)
router.get('/all', requireAdmin, orderController.getAllOrders);

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

// GET /api/orders/:orderNumber - Get order by number
router.get('/:orderNumber', orderController.getOrderByNumber);

module.exports = router;




