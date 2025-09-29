const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes for user registration and login
router.post("/register", authController.register);
router.post("/login", authController.login);
// Protected route to get user info
router.get("/me", authMiddleware, authController.getMe);
// Export the router
module.exports = router;
