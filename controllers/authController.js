const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// authController handles the authorization for registering a user, saving their information, handling passwords, creating access tokens, and saving info to allow registered user to login

// Change to object with methods instead of class
const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { username, email, password, avatar_url } = req.body;

            // console.log(req.body)

            // Check if user already exists
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: email }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this username or email already exists'
                });
            }

            // Hash password - info appears in terminal
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            // console.log(hashedPassword)

            // Create new user
            const user = await User.create({
                username,
                email,
                password_hash: hashedPassword,
                avatar_url: avatar_url
            });

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '24h' }
            );

            // Send response without password
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                description: user.description,
                avatar_url: user.avatar_url,
                createdAt: user.createdAt
            };

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse,
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error registering user',
                error: error.message
            });
        }
    },

    // Helper method to generate token
    generateToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({
                where: { email: email.toLowerCase() }
            });

            // Check if user exists
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            console.log(isPasswordValid)

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '24h' }
            );

            // Send response without password
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                description: user.description,
                avatar_url: user.avatar_url,
                createdAt: user.createdAt
            };

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error during login',
                error: error.message
            });
        }
    },

    // To make sure the session has loaded with all tokens
    verifySession: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
};

module.exports = authController;