const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create console format for better readability
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Console transport is the only reliable one on many cloud platforms
        new winston.transports.Console({
            format: consoleFormat,
        }),
    ],
});

// If we're not in production, log to console with more detail
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

module.exports = logger;
