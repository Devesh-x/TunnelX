const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { setConnectionMapping, deleteConnectionMapping } = require('../config/redis');

/**
 * WebSocket Server
 * Handles persistent connections from CLI clients
 */

// Store active connections: Map<tunnelId, WebSocket>
const activeConnections = new Map();

/**
 * Initialize WebSocket server
 * @param {object} server - HTTP server instance
 * @returns {WebSocket.Server} WebSocket server instance
 */
const initWebSocketServer = (server) => {
    const wss = new WebSocket.Server({
        server,
        path: '/ws',
    });

    wss.on('connection', handleConnection);

    wss.on('error', (error) => {
        logger.error('WebSocket server error:', error);
    });

    logger.info('✅ WebSocket server initialized');

    return wss;
};

/**
 * Handle new WebSocket connection
 * @param {WebSocket} ws - WebSocket connection
 * @param {object} req - HTTP request
 */
const handleConnection = async (ws, req) => {
    logger.info('New WebSocket connection attempt');

    let tunnelId = null;
    let userId = null;

    // Extract token from query string
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
        logger.warn('WebSocket connection rejected: No token provided');
        ws.close(1008, 'Authentication required');
        return;
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;

        logger.info(`WebSocket authenticated: User ${userId}`);

        // Wait for client to send tunnel ID
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());

                // Handle tunnel registration
                if (data.type === 'register' && data.tunnelId) {
                    tunnelId = data.tunnelId;

                    // Store connection
                    activeConnections.set(tunnelId, ws);

                    // Store in Redis for distributed systems
                    await setConnectionMapping(tunnelId, tunnelId);

                    logger.info(`✅ Tunnel registered: ${tunnelId} for user ${userId}`);

                    // Send confirmation
                    ws.send(JSON.stringify({
                        type: 'registered',
                        tunnelId,
                        message: 'Tunnel connected successfully',
                    }));
                }

                // Handle response from client (forwarding back to HTTP request)
                if (data.type === 'response' && data.requestId) {
                    // Emit event that will be caught by request router
                    ws.emit('tunnel-response', data);
                }

                // Handle ping/pong for connection health
                if (data.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
            } catch (error) {
                logger.error('Error handling WebSocket message:', error);
            }
        });

        // Handle connection close
        ws.on('close', async () => {
            if (tunnelId) {
                logger.info(`WebSocket closed: Tunnel ${tunnelId}`);
                activeConnections.delete(tunnelId);
                await deleteConnectionMapping(tunnelId);
            }
        });

        // Handle errors
        ws.on('error', (error) => {
            logger.error(`WebSocket error for tunnel ${tunnelId}:`, error);
        });

        // Send welcome message
        ws.send(JSON.stringify({
            type: 'connected',
            message: 'Connected to LocalBridge tunnel server',
        }));
    } catch (error) {
        logger.error('WebSocket authentication failed:', error);
        ws.close(1008, 'Invalid token');
    }
};

/**
 * Get active connection by tunnel ID
 * @param {string} tunnelId - Tunnel ID
 * @returns {WebSocket|null} WebSocket connection or null
 */
const getConnection = (tunnelId) => {
    return activeConnections.get(tunnelId) || null;
};

/**
 * Send request to client via WebSocket
 * @param {string} tunnelId - Tunnel ID
 * @param {object} requestData - Request data to forward
 * @returns {Promise<object>} Response from client
 */
const forwardRequest = (tunnelId, requestData) => {
    return new Promise((resolve, reject) => {
        const ws = getConnection(tunnelId);

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return reject(new Error('Tunnel not connected'));
        }

        const timeout = setTimeout(() => {
            reject(new Error('Request timeout'));
        }, 30000); // 30 second timeout

        // Listen for response
        const responseHandler = (data) => {
            if (data.requestId === requestData.requestId) {
                clearTimeout(timeout);
                ws.removeListener('tunnel-response', responseHandler);
                resolve(data.response);
            }
        };

        ws.on('tunnel-response', responseHandler);

        // Send request to client
        try {
            ws.send(JSON.stringify({
                type: 'request',
                requestId: requestData.requestId,
                method: requestData.method,
                url: requestData.url,
                headers: requestData.headers,
                body: requestData.body,
            }));
        } catch (error) {
            clearTimeout(timeout);
            ws.removeListener('tunnel-response', responseHandler);
            reject(error);
        }
    });
};

/**
 * Get count of active connections
 * @returns {number} Number of active connections
 */
const getActiveConnectionCount = () => {
    return activeConnections.size;
};

/**
 * Get all active tunnel IDs
 * @returns {Array<string>} Array of tunnel IDs
 */
const getActiveTunnelIds = () => {
    return Array.from(activeConnections.keys());
};

module.exports = {
    initWebSocketServer,
    getConnection,
    forwardRequest,
    getActiveConnectionCount,
    getActiveTunnelIds,
};
