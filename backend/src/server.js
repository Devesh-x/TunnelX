const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { requestLogger, errorHandler, notFoundHandler } = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/auth');
const tunnelRoutes = require('./routes/tunnels');
// const statsRoutes = require('./routes/stats');  // Temporarily disabled

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/tunnels', tunnelRoutes);
// app.use('/stats', statsRoutes);  // Temporarily disabled

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 8080;
const WS_PORT = process.env.WS_PORT || 8081;

let httpServer;
let wsServer;

/**
 * Start server
 */
const startServer = async () => {
    try {
        // Connect to databases
        logger.info('🔄 Connecting to databases...');
        await initDatabase();
        await connectRedis();

        // Start HTTP server
        httpServer = app.listen(PORT, () => {
            logger.info(`✅ HTTP Server running on port ${PORT}`);
            logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Import and start WebSocket server
        const { initWebSocketServer } = require('./websocket/server');
        wsServer = initWebSocketServer(httpServer);
        logger.info(`✅ WebSocket server running on port ${PORT} (path: /ws)`);

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
