const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { requireAdmin } = require('../utils/adminAuth');

// Validate coupon code (public)
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }
    
    if (!coupon.isValid()) {
      return res.status(400).json({ error: 'Coupon is expired or no longer valid' });
    }
    
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        error: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon` 
      });
    }
    
    const discount = coupon.calculateDiscount(orderAmount);
    
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply coupon (increments usage count)
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ error: 'Invalid or expired coupon' });
    }
    
    coupon.usedCount += 1;
    await coupon.save();
    
    res.json({ success: true, message: 'Coupon applied successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all coupons (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create coupon (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, expiresAt } = req.body;
    
    if (!code || !description || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      expiresAt: expiresAt || null
    });
    
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete coupon (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

