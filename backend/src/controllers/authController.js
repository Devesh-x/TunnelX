const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Authentication Controller
 * Handles user registration and login
 */

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

/**
 * Generate JWT token
 * @param {object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
    );
};

/**
 * Register a new user
 * POST /auth/register
 */
const register = async (req, res) => {
    try {
        // Validate input
        const { error, value } = registerSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message,
            });
        }

        const { email, password } = value;

        // Create user
        const user = await User.createUser(email, password);

        // Generate token
        const token = generateToken(user);

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.created_at,
                },
                token,
            },
        });
    } catch (error) {
        if (error.message === 'Email already exists') {
            return res.status(409).json({
                success: false,
                error: 'Email already exists',
            });
        }

        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
        });
    }
};

/**
 * Login user
 * POST /auth/login
 */
const login = async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message,
            });
        }

        const { email, password } = value;

        // Find user
        const user = await User.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        // Verify password
        const isValid = await User.verifyPassword(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        // Generate token
        const token = generateToken(user);

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.created_at,
                },
                token,
            },
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
        });
    }
};

/**
 * Get current user
 * GET /auth/me
 */
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.created_at,
                },
            },
        });
    } catch (error) {
        logger.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user',
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
};
