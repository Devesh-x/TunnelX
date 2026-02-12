const logger = require('../utils/logger');

/**
 * Request Logging Middleware
 * Logs all incoming requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });

    next();
};

/**
 * Error Handling Middleware
 * Catches and formats errors
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });

    // Don't leak error details in production
    const message =
        process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message;

    res.status(err.status || 500).json({
        success: false,
        error: message,
    });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
};

module.exports = {
    requestLogger,
    errorHandler,
    notFoundHandler,
};
