const tunnelService = require('../services/tunnelService');
const logger = require('../utils/logger');

/**
 * Tunnel Controller
 * Handles tunnel management endpoints
 */

/**
 * Create a new tunnel
 * POST /tunnels/create
 */
const createTunnel = async (req, res) => {
    try {
        const userId = req.user.id;

        // Create tunnel
        const tunnel = await tunnelService.createTunnel(userId);

        res.status(201).json({
            success: true,
            data: {
                tunnel: {
                    id: tunnel.id,
                    publicUrl: tunnel.public_url,
                    status: tunnel.status,
                    createdAt: tunnel.created_at,
                },
            },
        });
    } catch (error) {
        logger.error('Create tunnel error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create tunnel',
        });
    }
};

/**
 * Get user's tunnels
 * GET /tunnels
 */
const getTunnels = async (req, res) => {
    try {
        const userId = req.user.id;
        const activeOnly = req.query.active === 'true';

        const tunnels = await tunnelService.getUserTunnels(userId, activeOnly);

        res.json({
            success: true,
            data: {
                tunnels: tunnels.map((t) => ({
                    id: t.id,
                    publicUrl: t.public_url,
                    status: t.status,
                    createdAt: t.created_at,
                    updatedAt: t.updated_at,
                })),
            },
        });
    } catch (error) {
        logger.error('Get tunnels error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get tunnels',
        });
    }
};

/**
 * Get tunnel by ID
 * GET /tunnels/:id
 */
const getTunnelById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const tunnel = await tunnelService.getTunnelById(id);

        if (!tunnel) {
            return res.status(404).json({
                success: false,
                error: 'Tunnel not found',
            });
        }

        // Check ownership
        if (tunnel.user_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }

        res.json({
            success: true,
            data: {
                tunnel: {
                    id: tunnel.id,
                    publicUrl: tunnel.public_url,
                    status: tunnel.status,
                    createdAt: tunnel.created_at,
                    updatedAt: tunnel.updated_at,
                },
            },
        });
    } catch (error) {
        logger.error('Get tunnel by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get tunnel',
        });
    }
};

/**
 * Delete tunnel
 * DELETE /tunnels/:id
 */
const deleteTunnel = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deleted = await tunnelService.deleteTunnel(id, userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Tunnel not found or access denied',
            });
        }

        res.json({
            success: true,
            message: 'Tunnel deleted successfully',
        });
    } catch (error) {
        logger.error('Delete tunnel error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete tunnel',
        });
    }
};

module.exports = {
    createTunnel,
    getTunnels,
    getTunnelById,
    deleteTunnel,
};
