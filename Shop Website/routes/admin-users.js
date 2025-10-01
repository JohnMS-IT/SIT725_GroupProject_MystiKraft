const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAdmin } = require('../utils/adminAuth');

// Apply admin middleware to all routes
router.use(requireAdmin);

// GET /api/admin/users - Get all users (admin only)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({})
            .select('-salt -hash') // Exclude password fields
            .sort({ createdAt: -1 });
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/admin/users/:id/role - Update user role (admin only)
router.put('/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-salt -hash');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Also delete user's cart
        const Cart = require('../models/Cart');
        await Cart.deleteMany({ userId: req.params.id });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

