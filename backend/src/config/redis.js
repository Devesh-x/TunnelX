const redis = require('redis');
require('dotenv').config();

// Create Redis client
const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        tls: process.env.NODE_ENV === 'production', // Enable TLS in production for Upstash
    },
    password: process.env.REDIS_PASSWORD || undefined,
});

// Error handling
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
});

redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
});

/**
 * Connect to Redis
 */
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        throw error;
    }
};

/**
 * Store active tunnel session
 * @param {string} tunnelId - Tunnel ID
 * @param {object} data - Tunnel data (userId, publicUrl, etc.)
 * @param {number} ttl - Time to live in seconds (optional)
 */
const setTunnelSession = async (tunnelId, data, ttl = 86400) => {
    try {
        const key = `tunnel:${tunnelId}`;
        await redisClient.setEx(key, ttl, JSON.stringify(data));
        console.log(`✅ Stored tunnel session: ${tunnelId}`);
    } catch (error) {
        console.error('❌ Error storing tunnel session:', error);
        throw error;
    }
};

/**
 * Get active tunnel session
 * @param {string} tunnelId - Tunnel ID
 * @returns {object|null} Tunnel data or null if not found
 */
const getTunnelSession = async (tunnelId) => {
    try {
        const key = `tunnel:${tunnelId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('❌ Error getting tunnel session:', error);
        throw error;
    }
};

/**
 * Delete tunnel session
 * @param {string} tunnelId - Tunnel ID
 */
const deleteTunnelSession = async (tunnelId) => {
    try {
        const key = `tunnel:${tunnelId}`;
        await redisClient.del(key);
        console.log(`✅ Deleted tunnel session: ${tunnelId}`);
    } catch (error) {
        console.error('❌ Error deleting tunnel session:', error);
        throw error;
    }
};

/**
 * Store WebSocket connection mapping
 * @param {string} tunnelId - Tunnel ID
 * @param {string} connectionId - WebSocket connection ID
 */
const setConnectionMapping = async (tunnelId, connectionId) => {
    try {
        const key = `connection:${tunnelId}`;
        await redisClient.set(key, connectionId);
        console.log(`✅ Mapped tunnel ${tunnelId} to connection ${connectionId}`);
    } catch (error) {
        console.error('❌ Error setting connection mapping:', error);
        throw error;
    }
};

/**
 * Get WebSocket connection ID for tunnel
 * @param {string} tunnelId - Tunnel ID
 * @returns {string|null} Connection ID or null
 */
const getConnectionMapping = async (tunnelId) => {
    try {
        const key = `connection:${tunnelId}`;
        return await redisClient.get(key);
    } catch (error) {
        console.error('❌ Error getting connection mapping:', error);
        throw error;
    }
};

/**
 * Delete connection mapping
 * @param {string} tunnelId - Tunnel ID
 */
const deleteConnectionMapping = async (tunnelId) => {
    try {
        const key = `connection:${tunnelId}`;
        await redisClient.del(key);
        console.log(`✅ Deleted connection mapping for tunnel: ${tunnelId}`);
    } catch (error) {
        console.error('❌ Error deleting connection mapping:', error);
        throw error;
    }
};

/**
 * Increment rate limit counter
 * @param {string} identifier - IP address or user ID
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} Current count
 */
const incrementRateLimit = async (identifier, windowMs = 900000) => {
    try {
        const key = `ratelimit:${identifier}`;
        const count = await redisClient.incr(key);

        // Set expiry on first increment
        if (count === 1) {
            await redisClient.pExpire(key, windowMs);
        }

        return count;
    } catch (error) {
        console.error('❌ Error incrementing rate limit:', error);
        throw error;
    }
};

/**
 * Get rate limit count
 * @param {string} identifier - IP address or user ID
 * @returns {number} Current count
 */
const getRateLimitCount = async (identifier) => {
    try {
        const key = `ratelimit:${identifier}`;
        const count = await redisClient.get(key);
        return count ? parseInt(count, 10) : 0;
    } catch (error) {
        console.error('❌ Error getting rate limit count:', error);
        throw error;
    }
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
};

module.exports = {
    redisClient,
    connectRedis,
    closeRedis,
    setTunnelSession,
    getTunnelSession,
    deleteTunnelSession,
    setConnectionMapping,
    getConnectionMapping,
    deleteConnectionMapping,
    incrementRateLimit,
    getRateLimitCount,
};
