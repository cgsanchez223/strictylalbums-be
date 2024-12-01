const { Rating, User } = require('../models');
const { Op } = require('sequelize');

// ratingController handles the steps for users to rate albums on the site.

const ratingController = {
    // Create or update a rating
    createRating: async (req, res) => {
        try {
            const { albumId, albumName, artistName, albumImage, rating, review } = req.body;
            const userId = req.user.id;

            // Validate rating - make sure rating falls within 1-5 parameters
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            // Check if rating already exists - call userId for current user and albumId for the album in order to compare ratings
            const existingRating = await Rating.findOne({
                where: {
                    userId,
                    albumId
                }
            });

            let result;
            if (existingRating) {
                // update existing rating
                result = await existingRating.update({
                    rating,
                    review,
                    albumName,
                    artistName,
                    albumImage
                });
            } else {
                // Create new rating
                result = await Rating.create({
                    userId,
                    albumId,
                    albumName,
                    artistName,
                    albumImage,
                    rating,
                    review
                });
            }

            res.status(201).json({
                success: true,
                message: existingRating ? 'Rating updated successfully' : 'Rating created successfully',
                data: result
            });
        } catch (error) {
            console.error('Rating creation error:', error);
            res.status(500).json({
            success: false,
            message: 'Error creating rating',
            error: error.message
        });
        }
    },

    // Get rating for a specific album
    getAlbumRating: async (req, res) => {
        try {
            const { albumId } = req.params;
            const userId = req.user.id;

            const rating = await Rating.findOne({
                where: {
                    userId,
                    albumId
                }
            });

            if (!rating) {
                return res.status(404).json({
                    success: false,
                    message: 'Rating not found'
                });
            }

            res.json({
                success: true,
                data: rating
            });
        } catch (error) {
            console.error('Get rating error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching rating',
                error: error.message
            });
        }
    },

    // Get user's ratings
    getUserRatings: async (req, res) => {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;

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
                    total: ratings.count,
                    limit,
                    offset
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

    // Delete a rating
    deleteRating: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const rating = await Rating.findOne({
                where: {
                    id,
                    userId
                }
            });

            if (!rating) {
                return res.status(404).json({
                    success: false,
                    message: "Rating not found"
                });
            }

            await rating.destroy();

            res.json({
                success: true,
                message: 'Rating deleted successfully'
            });
        } catch (error) {
            console.error('Delete rating error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting rating',
                error: error.message
            });
        }
    },

    // Get recent ratings - used in dashboard and profile page
    getRecentRatings: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;

            const ratings = await Rating.findAndCountAll({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                }],
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            res.json({
                success: true,
                data: {
                    ratings: ratings.rows,
                    total: ratings.count,
                    limit,
                    offset
                }
            });
        } catch (error) {
            console.error('Get recent ratings error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching recent ratings',
                error: error.message
            });
        }
    }
};

module.exports = ratingController;