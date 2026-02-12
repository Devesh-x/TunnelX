const { incrementRateLimit, getRateLimitCount } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Rate Limiting Middleware
 * Uses Redis to track request counts
 */

/**
 * Create rate limiter middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum requests per window
 * @returns {Function} Express middleware
 */
const createRateLimiter = (windowMs, max) => {
    return async (req, res, next) => {
        try {
            // Use IP address as key
            const key = `ratelimit:${req.ip}`;

            // Increment counter
            const count = await incrementRateLimit(key, windowMs);

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
            res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);

            // Check if limit exceeded
            if (count > max) {
                logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
                return res.status(429).json({
                    success: false,
                    error: 'Too many requests, please try again later',
                });
            }

            next();
        } catch (error) {
            logger.error('Rate limit error:', error);
            // On error, allow request to proceed
            next();
        }
    };
};

/**
 * Strict rate limiter (for login, register)
 * 5 requests per 15 minutes
 */
const strictRateLimiter = createRateLimiter(15 * 60 * 1000, 5);

/**
 * Standard rate limiter (for API endpoints)
 * 100 requests per 15 minutes
 */
const standardRateLimiter = createRateLimiter(15 * 60 * 1000, 100);

/**
 * Lenient rate limiter (for public endpoints)
 * 300 requests per 15 minutes
 */
const lenientRateLimiter = createRateLimiter(15 * 60 * 1000, 300);

module.exports = {
    createRateLimiter,
    strictRateLimiter,
    standardRateLimiter,
    lenientRateLimiter,
};
