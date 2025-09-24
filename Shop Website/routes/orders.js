const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Create order
router.post('/', orderController.createOrder);

// GET /api/orders/:orderNumber - Get order by number
router.get('/:orderNumber', orderController.getOrderByNumber);

module.exports = router;


