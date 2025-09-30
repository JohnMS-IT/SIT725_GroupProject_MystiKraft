const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ 
            error: 'Authentication required',
            redirectTo: '/index.html'
        });
    }
    next();
};

// Apply auth middleware to all user routes
router.use(requireAuth);

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user data (password is automatically excluded by toJSON)
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const { firstName, lastName, phone, shippingAddress, paymentMethod, creditCard } = req.body;
        
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (phone !== undefined) updateData.phone = phone;
        if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (creditCard !== undefined) updateData.creditCard = creditCard;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: user
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;