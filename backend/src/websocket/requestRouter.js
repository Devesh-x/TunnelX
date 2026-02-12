const { nanoid } = require('nanoid');
const logger = require('../utils/logger');
const { forwardRequest } = require('../websocket/server');
const { getTunnelSession } = require('../config/redis');

/**
 * Request Router
 * Routes incoming HTTP requests to the correct tunnel
 */

/**
 * Route request to tunnel
 * @param {object} req - Express request object
 * @param {res} res - Express response object
 */
const routeRequest = async (req, res) => {
    try {
        // Extract tunnel ID from subdomain
        const host = req.headers.host || '';
        const tunnelId = extractTunnelId(host);

        if (!tunnelId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid tunnel URL',
            });
        }

        logger.info(`Routing request to tunnel: ${tunnelId}`);

        // Check if tunnel exists in Redis
        const tunnelSession = await getTunnelSession(tunnelId);

        if (!tunnelSession) {
            return res.status(404).json({
                success: false,
                error: 'Tunnel not found or inactive',
            });
        }

        // Generate unique request ID
        const requestId = nanoid(16);

        // Prepare request data
        const requestData = {
            requestId,
            method: req.method,
            url: req.url,
            headers: sanitizeHeaders(req.headers),
            body: req.body,
        };

        logger.info(`Forwarding request ${requestId} to tunnel ${tunnelId}`);

        // Forward request to client via WebSocket
        const response = await forwardRequest(tunnelId, requestData);

        // Send response back to original requester
        res.status(response.statusCode || 200);

        // Set response headers
        if (response.headers) {
            Object.entries(response.headers).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
        }

        // Send response body
        if (response.body) {
            res.send(response.body);
        } else {
            res.end();
        }

        logger.info(`Request ${requestId} completed with status ${response.statusCode}`);
    } catch (error) {
        logger.error('Request routing error:', error);

        if (error.message === 'Tunnel not connected') {
            return res.status(503).json({
                success: false,
                error: 'Tunnel is not connected. Please ensure your CLI client is running.',
            });
        }

        if (error.message === 'Request timeout') {
            return res.status(504).json({
                success: false,
                error: 'Request timeout. The tunnel did not respond in time.',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to route request',
        });
    }
};

/**
 * Extract tunnel ID from hostname
 * @param {string} host - Hostname (e.g., "abc123.localbridge.dev")
 * @returns {string|null} Tunnel ID or null
 */
const extractTunnelId = (host) => {
    try {
        // Remove port if present
        const hostname = host.split(':')[0];

        // Extract subdomain (tunnel ID)
        const parts = hostname.split('.');

        if (parts.length < 2) {
            return null;
        }

        // First part is the tunnel ID
        const tunnelId = parts[0];

        // Validate tunnel ID format (alphanumeric, 10 characters)
        if (!/^[a-zA-Z0-9_-]{10}$/.test(tunnelId)) {
            return null;
        }

        return tunnelId;
    } catch (error) {
        logger.error('Error extracting tunnel ID:', error);
        return null;
    }
};

/**
 * Sanitize headers before forwarding
 * Remove sensitive or problematic headers
 * @param {object} headers - Request headers
 * @returns {object} Sanitized headers
 */
const sanitizeHeaders = (headers) => {
    const sanitized = { ...headers };

    // Remove headers that shouldn't be forwarded
    delete sanitized.host;
    delete sanitized.connection;
    delete sanitized['transfer-encoding'];
    delete sanitized['content-length']; // Will be recalculated

    return sanitized;
};

/**
 * Middleware to check if request is for a tunnel
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const tunnelMiddleware = (req, res, next) => {
    const host = req.headers.host || '';
    const tunnelId = extractTunnelId(host);

    // If this is a tunnel request, route it
    if (tunnelId) {
        return routeRequest(req, res);
    }

    // Otherwise, continue to normal routes
    next();
};

module.exports = {
    routeRequest,
    extractTunnelId,
    sanitizeHeaders,
    tunnelMiddleware,
};
