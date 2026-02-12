const { nanoid } = require('nanoid');
const Tunnel = require('../models/Tunnel');
const { setTunnelSession, deleteTunnelSession } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Tunnel Service
 * Business logic for tunnel management
 */

/**
 * Generate unique tunnel ID
 * @returns {string} Tunnel ID (e.g., "abc123xyz")
 */
const generateTunnelId = () => {
    return nanoid(10); // 10 character ID
};

/**
 * Generate public URL for tunnel
 * @param {string} tunnelId - Tunnel ID
 * @returns {string} Public URL
 */
const generatePublicUrl = (tunnelId) => {
    const baseDomain = process.env.BASE_DOMAIN || 'localbridge.dev';
    return `https://${tunnelId}.${baseDomain}`;
};

/**
 * Create a new tunnel
 * @param {number} userId - User ID
 * @returns {object} Created tunnel
 */
const createTunnel = async (userId) => {
    try {
        // Generate tunnel ID and URL
        const tunnelId = generateTunnelId();
        const publicUrl = generatePublicUrl(tunnelId);

        // Create in database
        const tunnel = await Tunnel.createTunnel(tunnelId, userId, publicUrl);

        // Store in Redis for fast lookup
        await setTunnelSession(tunnelId, {
            userId,
            publicUrl,
            status: 'active',
            createdAt: tunnel.created_at,
        });

        logger.info(`Created tunnel: ${tunnelId} for user ${userId}`);

        return tunnel;
    } catch (error) {
        logger.error('Create tunnel error:', error);
        throw error;
    }
};

/**
 * Get user's tunnels
 * @param {number} userId - User ID
 * @param {boolean} activeOnly - Return only active tunnels
 * @returns {Array} Array of tunnels
 */
const getUserTunnels = async (userId, activeOnly = false) => {
    try {
        if (activeOnly) {
            return await Tunnel.findActiveTunnelsByUserId(userId);
        }
        return await Tunnel.findTunnelsByUserId(userId);
    } catch (error) {
        logger.error('Get user tunnels error:', error);
        throw error;
    }
};

/**
 * Delete a tunnel
 * @param {string} tunnelId - Tunnel ID
 * @param {number} userId - User ID (for authorization)
 * @returns {boolean} True if deleted
 */
const deleteTunnel = async (tunnelId, userId) => {
    try {
        // Delete from database
        const deleted = await Tunnel.deleteTunnelByUser(userId, tunnelId);

        if (deleted) {
            // Delete from Redis
            await deleteTunnelSession(tunnelId);
            logger.info(`Deleted tunnel: ${tunnelId}`);
        }

        return deleted;
    } catch (error) {
        logger.error('Delete tunnel error:', error);
        throw error;
    }
};

/**
 * Get tunnel by ID
 * @param {string} tunnelId - Tunnel ID
 * @returns {object|null} Tunnel or null
 */
const getTunnelById = async (tunnelId) => {
    try {
        return await Tunnel.findTunnelById(tunnelId);
    } catch (error) {
        logger.error('Get tunnel by ID error:', error);
        throw error;
    }
};

/**
 * Update tunnel status
 * @param {string} tunnelId - Tunnel ID
 * @param {string} status - New status
 * @returns {object} Updated tunnel
 */
const updateTunnelStatus = async (tunnelId, status) => {
    try {
        const tunnel = await Tunnel.updateTunnelStatus(tunnelId, status);

        // Update Redis session
        if (status === 'active') {
            await setTunnelSession(tunnelId, {
                userId: tunnel.user_id,
                publicUrl: tunnel.public_url,
                status: 'active',
                updatedAt: tunnel.updated_at,
            });
        } else {
            await deleteTunnelSession(tunnelId);
        }

        logger.info(`Updated tunnel ${tunnelId} status to ${status}`);
        return tunnel;
    } catch (error) {
        logger.error('Update tunnel status error:', error);
        throw error;
    }
};

module.exports = {
    generateTunnelId,
    generatePublicUrl,
    createTunnel,
    getUserTunnels,
    deleteTunnel,
    getTunnelById,
    updateTunnelStatus,
};
