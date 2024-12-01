const { User, Rating, List } = require('../models');
const { Op } = require('sequelize');

// profileController handles what appears on a user's profile page

const profileController = {
    // Get user profile with ratings and lists
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Rating,
                        as: 'ratings',
                        limit: null,
                        order: [['createdAt', 'DESC']],
                    },
                    {
                        model: List,
                        as: 'lists',
                        limit: 6,
                        order: [['createdAt', 'DESC']],
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching profile',
                error: error.message
            });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const {
                username,
                description,
                location,
                favorite_genres,
                social_links,
                avatar_url
            } = req.body;

            // Check if username is taken (if username is being updated)
            if (username) {
                const existingUser = await User.findOne({
                    where: {
                        username,
                        id: { [Op.ne]: userId }
                    }
                });

                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username is already taken'
                    });
                }
            }

            // Update user
            const [updated] = await User.update({
                username,
                description,
                location,
                favorite_genres,
                social_links,
                avatar_url
            }, {
                where: { id: userId },
                returning: true
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Fetch updated user data
            const updatedUser = await User.findByPk(userId, {
                attributes: { exclude: ['password'] }
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating profile',
                error: error.message
            });
        }
    },

    // Get user's ratings with pagination
    getUserRatings: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const ratings = await Rating.findAndCountAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            res.json({
                success: true,
                data: {
                    ratings: ratings.rows,
                    pagination: {
                        total: ratings.count,
                        page,
                        limit,
                        totalPages: Math.ceil(ratings.count / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get user ratings error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching ratings',
                error: error.message
            });
        }
    },

    // Get user's lists with pagination
    getUserLists: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const lists = await List.findAndCountAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            res.json({
                success: true,
                data: {
                    lists: lists.rows,
                    pagination: {
                        total: lists.count,
                        page,
                        limit,
                        totalPages: Math.ceil(lists.count / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get user lists error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching lists',
                error: error.message
            });
        }
    }
};

module.exports = profileController;