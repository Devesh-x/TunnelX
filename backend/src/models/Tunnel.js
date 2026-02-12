const db = require('../config/database');

/**
 * Tunnel Model
 * Handles all database operations for tunnels
 */

/**
 * Create a new tunnel
 * @param {string} id - Tunnel ID
 * @param {number} userId - User ID
 * @param {string} publicUrl - Public URL
 * @returns {object} Created tunnel
 */
const createTunnel = async (id, userId, publicUrl) => {
    const result = await db.query(
        'INSERT INTO tunnels (id, user_id, public_url, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, userId, publicUrl, 'active']
    );

    return result.rows[0];
};

/**
 * Find tunnel by ID
 * @param {string} tunnelId - Tunnel ID
 * @returns {object|null} Tunnel object or null
 */
const findTunnelById = async (tunnelId) => {
    const result = await db.query(
        'SELECT * FROM tunnels WHERE id = $1',
        [tunnelId]
    );

    return result.rows[0] || null;
};

/**
 * Find all tunnels for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of tunnel objects
 */
const findTunnelsByUserId = async (userId) => {
    const result = await db.query(
        'SELECT * FROM tunnels WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );

    return result.rows;
};

/**
 * Find active tunnels for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of active tunnel objects
 */
const findActiveTunnelsByUserId = async (userId) => {
    const result = await db.query(
        'SELECT * FROM tunnels WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
        [userId, 'active']
    );

    return result.rows;
};

/**
 * Update tunnel status
 * @param {string} tunnelId - Tunnel ID
 * @param {string} status - New status ('active' or 'inactive')
 * @returns {object} Updated tunnel
 */
const updateTunnelStatus = async (tunnelId, status) => {
    const result = await db.query(
        'UPDATE tunnels SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, tunnelId]
    );

    return result.rows[0];
};

/**
 * Delete tunnel
 * @param {string} tunnelId - Tunnel ID
 * @returns {boolean} True if deleted
 */
const deleteTunnel = async (tunnelId) => {
    const result = await db.query(
        'DELETE FROM tunnels WHERE id = $1 RETURNING id',
        [tunnelId]
    );

    return result.rowCount > 0;
};

/**
 * Delete tunnel by user ID (for cleanup)
 * @param {number} userId - User ID
 * @param {string} tunnelId - Tunnel ID
 * @returns {boolean} True if deleted
 */
const deleteTunnelByUser = async (userId, tunnelId) => {
    const result = await db.query(
        'DELETE FROM tunnels WHERE id = $1 AND user_id = $2 RETURNING id',
        [tunnelId, userId]
    );

    return result.rowCount > 0;
};

/**
 * Get tunnel count by status
 * @param {string} status - Status ('active' or 'inactive')
 * @returns {number} Count of tunnels
 */
const getTunnelCountByStatus = async (status) => {
    const result = await db.query(
        'SELECT COUNT(*) as count FROM tunnels WHERE status = $1',
        [status]
    );

    return parseInt(result.rows[0].count, 10);
};

module.exports = {
    createTunnel,
    findTunnelById,
    findTunnelsByUserId,
    findActiveTunnelsByUserId,
    updateTunnelStatus,
    deleteTunnel,
    deleteTunnelByUser,
    getTunnelCountByStatus,
};
