const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

/**
 * Auth middleware - requires valid JWT token
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'No authorization header provided',
            });
        }

        // Check format: "Bearer <token>"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                error: 'Invalid authorization header format. Use: Bearer <token>',
            });
        }

        const token = parts[1];

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request
            req.user = {
                id: decoded.userId,
                email: decoded.email,
            };

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                });
            }

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                });
            }

            throw error;
        }
    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication error',
        });
    }
};

/**
 * Optional auth middleware - doesn't require token but attaches user if present
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const parts = authHeader.split(' ');

        if (parts.length === 2 && parts[0] === 'Bearer') {
            const token = parts[1];

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = {
                    id: decoded.userId,
                    email: decoded.email,
                };
            } catch (error) {
                // Invalid token, but continue anyway
            }
        }

        next();
    } catch (error) {
        logger.error('Optional auth error:', error);
        next();
    }
};

module.exports = {
    authMiddleware,
    optionalAuth,
};
