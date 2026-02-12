const express = require('express');
const router = express.Router();
const tunnelController = require('../controllers/tunnelController');
const { authMiddleware } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimit');

/**
 * Tunnel Routes
 * All routes require authentication
 */

// POST /tunnels/create - Create new tunnel
router.post('/create', authMiddleware, standardRateLimiter, tunnelController.createTunnel);

// GET /tunnels - Get user's tunnels
router.get('/', authMiddleware, standardRateLimiter, tunnelController.getTunnels);

// GET /tunnels/:id - Get specific tunnel
router.get('/:id', authMiddleware, standardRateLimiter, tunnelController.getTunnelById);

// DELETE /tunnels/:id - Delete tunnel
router.delete('/:id', authMiddleware, standardRateLimiter, tunnelController.deleteTunnel);

module.exports = router;
