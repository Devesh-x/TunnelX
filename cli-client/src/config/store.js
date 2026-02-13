const Conf = require('conf');

/**
 * Configuration Store
 * Stores user credentials and settings locally
 */

const config = new Conf({
    projectName: 'localbridge',
    defaults: {
        token: null,
        email: null,
        serverUrl: 'https://tunnelx-backend.onrender.com',
    },
});

/**
 * Save authentication token
 * @param {string} token - JWT token
 * @param {string} email - User email
 */
const saveAuth = (token, email) => {
    config.set('token', token);
    config.set('email', email);
};

/**
 * Get authentication token
 * @returns {string|null} JWT token or null
 */
const getToken = () => {
    return config.get('token');
};

/**
 * Get user email
 * @returns {string|null} User email or null
 */
const getEmail = () => {
    return config.get('email');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
const isAuthenticated = () => {
    return !!config.get('token');
};

/**
 * Clear authentication
 */
const clearAuth = () => {
    config.delete('token');
    config.delete('email');
};

/**
 * Get server URL
 * @returns {string} Server URL
 */
const getServerUrl = () => {
    return config.get('serverUrl');
};

/**
 * Set server URL
 * @param {string} url - Server URL
 */
const setServerUrl = (url) => {
    config.set('serverUrl', url);
};

module.exports = {
    saveAuth,
    getToken,
    getEmail,
    isAuthenticated,
    clearAuth,
    getServerUrl,
    setServerUrl,
};
