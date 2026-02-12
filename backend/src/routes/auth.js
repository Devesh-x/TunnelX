const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { strictRateLimiter } = require('../middleware/rateLimit');

/**
 * Authentication Routes
 */

// POST /auth/register - Register new user
router.post('/register', strictRateLimiter, authController.register);

// POST /auth/login - Login user
router.post('/login', strictRateLimiter, authController.login);

// GET /auth/me - Get current user (protected)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
