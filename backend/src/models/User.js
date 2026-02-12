const bcrypt = require('bcrypt');
const db = require('../config/database');

/**
 * User Model
 * Handles user data operations
 */

/**
 * Create a new user
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<object>} Created user
 */
const createUser = async (email, password) => {
    // Check if email exists
    const existing = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, passwordHash]
    );

    return result.rows[0];
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} User or null
 */
const findUserByEmail = async (email) => {
    const result = await db.query(
        'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
        [email]
    );

    return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<object|null>} User or null
 */
const findUserById = async (id) => {
    const result = await db.query(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [id]
    );

    return result.rows[0] || null;
};

/**
 * Verify password
 * @param {string} password - Plain text password
 * @param {string} hash - Password hash
 * @returns {Promise<boolean>} True if valid
 */
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Get tunnel count for user
 * @param {number} userId - User ID
 * @returns {Promise<number>} Tunnel count
 */
const getTunnelCount = async (userId) => {
    const result = await db.query(
        'SELECT COUNT(*) as count FROM tunnels WHERE user_id = $1',
        [userId]
    );

    return parseInt(result.rows[0].count, 10);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    verifyPassword,
    getTunnelCount,
};
