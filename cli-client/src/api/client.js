const axios = require('axios');
const { getToken, getServerUrl } = require('../config/store');

/**
 * API Client
 * Handles all HTTP requests to the tunnel server
 */

/**
 * Create axios instance with default config
 */
const createClient = () => {
    const serverUrl = getServerUrl();
    const token = getToken();

    return axios.create({
        baseURL: serverUrl,
        headers: token ? {
            'Authorization': `Bearer ${token}`,
        } : {},
    });
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data and token
 */
const login = async (email, password) => {
    const client = createClient();
    const response = await client.post('/auth/login', {
        email,
        password,
    });
    return response.data.data;
};

/**
 * Register user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data and token
 */
const register = async (email, password) => {
    const client = createClient();
    const response = await client.post('/auth/register', {
        email,
        password,
    });
    return response.data.data;
};

/**
 * Get current user
 * @returns {Promise<object>} User data
 */
const getCurrentUser = async () => {
    const client = createClient();
    const response = await client.get('/auth/me');
    return response.data.data.user;
};

/**
 * Create tunnel
 * @returns {Promise<object>} Tunnel data
 */
const createTunnel = async () => {
    const client = createClient();
    const response = await client.post('/tunnels/create');
    return response.data.data.tunnel;
};

/**
 * Get user's tunnels
 * @returns {Promise<Array>} Array of tunnels
 */
const getTunnels = async () => {
    const client = createClient();
    const response = await client.get('/tunnels');
    return response.data.data.tunnels;
};

/**
 * Delete tunnel
 * @param {string} tunnelId - Tunnel ID
 * @returns {Promise<void>}
 */
const deleteTunnel = async (tunnelId) => {
    const client = createClient();
    await client.delete(`/tunnels/${tunnelId}`);
};

module.exports = {
    login,
    register,
    getCurrentUser,
    createTunnel,
    getTunnels,
    deleteTunnel,
};
