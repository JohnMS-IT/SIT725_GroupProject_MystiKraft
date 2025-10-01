// models/Coupon.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  // Coupon code (e.g., "SAVE20", "WELCOME10")
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  // Description of the coupon
  description: {
    type: String,
    required: true
  },
  // Discount type: 'percentage' or 'fixed'
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed']
  },
  // Discount value (e.g., 20 for 20% or $20 off)
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  // Minimum order amount to use coupon
  minOrderAmount: {
    type: Number,
    default: 0
  },
  // Maximum discount amount (for percentage discounts)
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  // Usage limit (null = unlimited)
  usageLimit: {
    type: Number,
    default: null
  },
  // Times used
  usedCount: {
    type: Number,
    default: 0
  },
  // Expiration date
  expiresAt: {
    type: Date,
    default: null
  },
  // Active status
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid()) return 0;
  if (orderAmount < this.minOrderAmount) return 0;
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;
  }
  
  // Discount cannot be more than order amount
  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);

