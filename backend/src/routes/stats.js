const express = require('express');
const router = express.Router();
const { getTunnelCountByStatus } = require('../models/Tunnel');

/**
 * Stats Routes
 * Provides statistics about the tunnel server
 */

/**
 * Get server statistics
 * GET /stats
 */
router.get('/', async (req, res) => {
    try {
        // Lazy-load WebSocket server to avoid circular dependency
        let activeConnections = 0;
        let activeTunnelIds = [];

        try {
            const wsServer = require('../websocket/server');
            activeConnections = wsServer.getActiveConnectionCount();
            activeTunnelIds = wsServer.getActiveTunnelIds();
        } catch (error) {
            // WebSocket server not initialized yet
        }

        const totalActiveTunnels = await getTunnelCountByStatus('active');
        const totalInactiveTunnels = await getTunnelCountByStatus('inactive');

        res.json({
            success: true,
            data: {
                server: {
                    uptime: process.uptime(),
                    environment: process.env.NODE_ENV || 'development',
                },
                connections: {
                    active: activeConnections,
                    tunnelIds: activeTunnelIds,
                },
                tunnels: {
                    active: totalActiveTunnels,
                    inactive: totalInactiveTunnels,
                    total: totalActiveTunnels + totalInactiveTunnels,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get stats',
        });
    }
});

module.exports = router;
