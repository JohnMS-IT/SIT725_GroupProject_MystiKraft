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

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ 
            error: 'Authentication required',
            redirectTo: '/index.html'
        });
    }
    
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Admin access required',
            message: 'You do not have permission to access this resource'
        });
    }
    
    next();
};

module.exports = {
    requireAuth,
    requireAdmin
};

