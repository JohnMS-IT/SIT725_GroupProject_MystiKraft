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
        const { firstName, lastName, phone, shippingAddress, shippingAddresses, paymentMethod, creditCard, address, index } = req.body;
        
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (phone !== undefined) updateData.phone = phone;
        if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (creditCard !== undefined) updateData.creditCard = creditCard;

        // Handle multiple addresses
        if (address !== undefined) {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!user.shippingAddresses) {
                user.shippingAddresses = [];
            }

            if (index !== undefined && index !== '') {
                // Update existing address
                user.shippingAddresses[parseInt(index)] = address;
            } else {
                // Add new address
                user.shippingAddresses.push(address);
            }

            await user.save();
            return res.json({
                message: 'Address saved successfully',
                user: user
            });
        }

        if (shippingAddresses !== undefined) {
            updateData.shippingAddresses = shippingAddresses;
        }

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

// Delete address
router.delete('/address/:index', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const index = parseInt(req.params.index);
        if (user.shippingAddresses && user.shippingAddresses[index]) {
            user.shippingAddresses.splice(index, 1);
            await user.save();
            return res.json({
                message: 'Address deleted successfully',
                user: user
            });
        }

        res.status(404).json({ error: 'Address not found' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete user account
router.delete('/account', async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Delete user account
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Also delete user's cart and orders (optional - you may want to keep orders for records)
        const Cart = require('../models/Cart');
        await Cart.deleteMany({ sessionId: req.sessionID });

        // Logout user
        req.logout((err) => {
            if (err) {
                console.error('Logout error after account deletion:', err);
            }
        });

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;